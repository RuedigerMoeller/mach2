package com.reax;

import com.reax.datamodel.*;
import org.nustaq.kontraktor.Callback;
import org.nustaq.kontraktor.Future;
import org.nustaq.kontraktor.Promise;
import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.kontraktor.annotations.Local;
import org.nustaq.kontraktor.util.Log;
import org.nustaq.fourk.FourKSession;
import org.nustaq.reallive.*;
import org.nustaq.reallive.queries.JSQuery;
import org.nustaq.reallive.sys.SysMeta;
import org.nustaq.reallive.sys.config.ConfigReader;
import org.nustaq.reallive.sys.config.SchemaConfig;
import org.nustaq.reallive.sys.metadata.Metadata;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.util.HashMap;
import java.util.Iterator;
import java.util.function.Predicate;

/**
 * Created by ruedi on 23.10.2014.
 */
@GenRemote
public class ReaXession extends FourKSession<ReaXerve,ReaXession> {

    RealLive realLive;
    User user;

    @Local
    public void $init(User user, RealLive realLive) {
        this.realLive = new RealLiveClientWrapper(realLive);
        this.user = user;
    }

    //////////////////////////////////////////////////////
    // RealLive access (to be isolated)

    HashMap<String,Subscription> subscriptions = new HashMap<>();
    int subsCount = 1;

    public Future<String> $subscribeKey(String table, String recordKey, Callback cb) {
        Subscription subs = realLive.stream(table).subscribeKey( recordKey, (change) -> cb.receive(change,CONT) );
        String key = "subs" + subsCount++;
        subscriptions.put(key, subs);
        return new Promise<>(key);
    }

    /**
     *
     * @param table
     * @param query
     * @param cb
     * @return subs id
     */
    public Future<String> $subscribe(String table, String query, Callback cb) {
        Subscription subs = realLive.stream(table).subscribe(new JSQuery(query), change -> {
            cb.receive(change, CONT);
        });
        String key = "subs" + subsCount++;
        subscriptions.put(key, subs);
        return new Promise<>(key);
    }

    /**
     * @param marketPlacePrefix - if != null, remove messages relevant to other MP
     * @param cb
     * @return subsId
     */
    public Future<String> $subscribeMsg(String marketPlacePrefix, String userId, Callback cb) {
        long oldest = 0;//System.currentTimeMillis()-2*24*60*60*1000l;
        Predicate matches = rec -> {
            Message m = (Message) rec;
            if ( m.getMsgTime() < oldest ) {
                return false;
            }
            String adminName = user.getAdminName();
            if (adminName == null)
                adminName = user.getName();
            if ((adminName.equals(m.getAdminId())) ||
                    (marketPlacePrefix == null || (m.getMarketId() != null && m.getMarketId().equals(marketPlacePrefix))) ||
                    (m.getUserId() == null || (userId != null && m.getUserId().equals(user.getName())))
                    ) {
                return true;
            }
            return false;
        };

        ChangeBroadcastReceiver bcastRec = change -> cb.receive(change, CONT);
        realLive.stream("Message").filterUntil(
            matches,
            (rec,i) -> ((Integer)i).intValue() > 20,
            bcastRec
        );

        Subscription subs =  realLive.stream("Message").listen(matches,bcastRec);
        String key = "subs" + subsCount++;
        subscriptions.put(key, subs);
        return new Promise<>(key);
    }

    public void $unsubscribe(String subsKey) {
        Subscription subs = subscriptions.get(subsKey);
        if ( subs != null ) {
            realLive.getTable(subs.getTableKey()).stream().unsubscribe(subs);
            subscriptions.remove(subsKey);
        } else {
            Log.Warn(this,"no subscription for unsubscribe found for key "+subsKey);
        }
    }

    public Future<Metadata> $getRLMeta() {
        // DEV ONLY: read for each login
        try {
            SchemaConfig schemaProps = ConfigReader.readConfig("./model.kson");
            realLive.getMetadata().overrideWith(schemaProps); // FIXME: side effecting
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new Promise<>(realLive.getMetadata());
    }

//    // expect [tableName,filterString]
//    Object listen(Invocation<QueryTuple> inv) {
//        QueryTuple argument = inv.getArgument();
//        Subscription subs = getRLDB().stream("" + argument).listen(new JSQuery(argument.getQuerySource()), (change) -> sendReply(inv, change));
//        subscriptions.put(inv.getCbId(), subs);
//        return NO_RESULT;
//    }

    // expect [tableName,filterString]
    public void $query( String table, String query, Callback cb ) {
        realLive.stream( table ).filter(new JSQuery(query),
            change ->
              cb.receive(change, change.isError()||change.isSnapshotDone() ? null : CONT)
        );
    }

    //
    //////////////////////////////////////////////////////

    public Future $instantiateMarketPlace(String mpRecordKey) {
        Promise p = new Promise();

        RLTable<MarketPlace> mpTable = realLive.getTable("MarketPlace");
        RLTable<Instrument> instrTable = realLive.getTable("Instrument");

        mpTable.$get(mpRecordKey).onResult( place -> {
            place.setAdmin( user.getRecordKey() );
            Message m = new Message();
            m.setAdminId(user.getRecordKey());
            m.setSenderId("system");
            m.setMessageText("New Market created: '"+place.getDescription()+"'");
            $sendMessage(m);
            String newMPKey = place.getRecordKey() + "#" + user.getRecordKey();
            mpTable.$put(newMPKey, place, 0);
            instrTable.stream().filter(
                    ins -> {
                        if ("admin".equals(ins.getOwner()) && mpRecordKey.equals(ins.getMarketPlace())) {
                            return true;
                        }
                        return false;
                    },
                    change -> {
                        if (change.isAdd()) {
                            Instrument tpl = change.getRecord();
                            tpl.setOwner(user.getRecordKey());
                            tpl.setMarketPlace(newMPKey);
                            instrTable.$put(tpl.getRecordKey() + "#" + user.getRecordKey(), tpl, 0);
                        } else if (!change.isARU()) {
                            p.receive("ok", null); // signal finish
                        }
                    });
        });
        return p;
    }

    /**
     * clean up after session close
     */
    @Override
    public void $hasBeenUnpublished() {
        subscriptions.values().forEach((subs) -> {
            realLive.getTable(subs.getTableKey()).stream().unsubscribe(subs);
        });
        subscriptions.clear();
        super.$hasBeenUnpublished();
    }

    public Future $hello( String hello ) {
        System.out.println("Hello");
        return new Promise("selber");
    }

    public Future<User> $getUser() {
        return new Promise<>(user);
    }

    public Future<String> $addOrder( String instrId, String instrName, boolean buy, int price, int qty, String text ) {
        Order o = new Order();
        o.setBuy(buy);
        o.setCreationTime(System.currentTimeMillis());
        o.setInstrumentKey(instrId);
        o.setInstrumentMnem(instrName);
        o.setLimitPrice(price);
        o.setQty(qty);
        o.setText(text);
        o.setTraderKey(user.getRecordKey());
        return app.getMatcher().$addOrder(o);
    }

    public Future<String> $delOrder(Order order) {
        return app.getMatcher().$delOrder(order);
    }

    public Future<Integer> $uploadImage( String symbolic, String imageType, byte[] bytes ) {
//        System.out.println("size: "+image.length() +" type "+imageType+"  "+image);
//        byte[] bytes = new byte[0];
        try {
//            bytes = image.getBytes("UTF-8");
            ByteArrayInputStream bai = new ByteArrayInputStream(bytes);
            Iterator<ImageReader> imageReadersByMIMEType = ImageIO.getImageReadersByMIMEType(imageType);
            if ( imageReadersByMIMEType.hasNext() ) {
                ImageReader reader = imageReadersByMIMEType.next();
                reader.setInput(ImageIO.createImageInputStream(bai));
                BufferedImage read = reader.read(0, reader.getDefaultReadParam() );
                ImageIO.write(read, "png", new File("fileroot/img/user/" + user.getName() + ".png"));
            } else {
                return new Promise<>(null, "unrecognized type");
            }
        } catch (Exception e) {
            Log.Warn(this,e);
            return new Promise<>(0,e.getClass().getSimpleName()+":"+e.getMessage());
        }
        return new Promise<>(bytes.length);
    }

    public Future $sendMessage( Message message ) {
        RLTable<Message> msgTab = realLive.getTable("Message");
        if ( user.getAdminName() == null ) {
            message.setAdminId(user.getName()); // market owner owns hisself
        } else {
            message.setAdminId(user.getAdminName());
        }
        if ( message.getSenderId() == null )
            message.setSenderId(user.getName());
        message.setMsgTime(System.currentTimeMillis());
        message._setRecordKey(null);
        msgTab.$add(message,0);
        return new Promise(null);
    }

    /**
     * "SUCCESS" = sucess, else error msg
     * @return
     */
    public Future<String> $sendMails( String mails ) {
        if (mails == null || mails.trim().length()==0) {
            return new Promise<>("no mail addresses entered");
        }
        final String[] mailList = mails.split(" ");
        int count = 0;
        final RLTable inviteTable = realLive.getTable("Invite");
        for (int i = 0; i < mailList.length; i++) {
            String s = mailList[i].trim();
            if (ReaXerve.isValidEmailAddress(s)) {
                Invite invite = (Invite) inviteTable.createForAdd();
                invite.setAdmin(user.getName());
                invite.setEmail(s);
                invite.setHoursValid(24*5);
                invite.setTimeSent(System.currentTimeMillis());
                String key = user.getName()+(""+Math.random()).substring(2);
                while( key.length() < 32 )
                    key+=""+(int)(Math.random()*10);
                invite._setRecordKey(key);
                inviteTable.$put(key,invite,0);
                String url = MailSettings.load().getAppurl()+"#invite$"+key;
                final String finalKey = key;
                ReaXerve.Self.$submitEmail(s,
                        "You have been invited to reax exchange by "+user.getEmail(),
                        "<html>Click <a href='"+url+"'>here</a> to pick a user name and log on.</html>")
                    .onResult( succ -> {
                        if ( succ != null && succ ) {
                            invite.setMailSent(true);
                            inviteTable.$put(finalKey, invite, 0);
                        }
                    });
                count++;
            }
        }
        return new Promise<>( (count > 0) ? "Enqueud "+count+" mails." : "No message sent. Check addresses.");
    }

}
