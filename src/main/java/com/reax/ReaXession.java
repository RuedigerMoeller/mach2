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
import org.nustaq.reallive.sys.config.ConfigReader;
import org.nustaq.reallive.sys.config.SchemaConfig;
import org.nustaq.reallive.sys.metadata.Metadata;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.function.Predicate;

/**
 * Created by ruedi on 23.10.2014.
 */
@GenRemote
public class ReaXession extends FourKSession<ReaXerve,ReaXession> {

    RealLive realLive;
    User user; // atention: reload from reallive before transactions
    long previousLogin;

    @Local
    public void $init(User user, RealLive realLive) {
        this.realLive = new RealLiveClientWrapper(realLive);
        this.user = user;
        user.prepareForUpdate(true);
        previousLogin = user.getLastLogin();
        user.setLastLogin(System.currentTimeMillis());
        if ( user.getAdminName() == null )
            user.setAdminName(user.getName()); // fix import error
        user.$apply(0);
    }

    //////////////////////////////////////////////////////
    // RealLive access (to be isolated)

    HashMap<String,Subscription> subscriptions = new HashMap<>();
    int subsCount = 1;

    public Future<String> $subscribeKey(String table, String recordKey, Callback cb) {
        Subscription subs = realLive.stream(table).subscribeKey(recordKey, (change) -> cb.receive(change, CONT));
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
     * @param marketPlaceFilter - if != null, remove messages not having this MP
     * @param userFilter - if != null only allow messages for this user (+self)
     * @param cb
     * @return subsId
     */
    public Future<String> $subscribeMsg(String marketPlaceFilter, String userFilter, Callback cb) {
        long oldest = Math.min(previousLogin,System.currentTimeMillis()-60*24*60*60*1000l);
        Predicate matches = rec -> {
            Message m = (Message) rec;
            // check time window
            if ( m.getMsgTime() < oldest ) {
                return false;
            }
            // check same exchange
            String userAdminName = user.getAdminName();
            if (userAdminName == null)
                userAdminName = user.getName();
            if ( ! userAdminName.equals(m.getAdminId()) )
                return false;
            // check for private or own
            if ( m.getUserId() != null && ! m.getUserId().equals(user.getName()) && ! m.getSenderId().equals(user.getName() ) )
                return false;
            // system msg
            if ( "system".equals(m.getAdminId()) )
                return true;
            // check filters
            boolean matchesMPFilter = (marketPlaceFilter == null && m.getMarketId() == null) || (m.getMarketId() != null && m.getMarketId().equals(marketPlaceFilter));
            boolean matchesUserFilter =
                    m.getUserId() == null ||
                    userFilter == null ||
                    (userFilter != null && m.getUserId().equals(user.getName())) ||
                    m.getSenderId().equals(user.getName());
            if ( (matchesMPFilter && matchesUserFilter) )
            {
                return true;
            }
            return false;
        };

        ChangeBroadcastReceiver bcastRec = change -> cb.receive(change, CONT);
        ArrayList<Message> messages = new ArrayList<>();
        Promise pres = new Promise();
        realLive.stream("Message").filterUntil(
            matches,
            (rec,i) -> ((Integer)i).intValue() > 2000,
            change -> {
                if (change.isAdd())
                    messages.add((Message) change.getRecord());
            }
        ).onResult( res -> {
                messages.sort( (a,b) -> (int) (b.getMsgTime() - a.getMsgTime()) );
                for (int i = 0; i < 50 && i < messages.size(); i++) {
                    final Message rec = messages.get(i);
                    cb.receive(ChangeBroadcast.NewAdd("Messages",rec,0),CONT);
                }

                Subscription subs =  realLive.stream("Message").listen(matches,bcastRec);
                String key = "subs" + subsCount++;
                subscriptions.put(key, subs);
                pres.receive(key,null);
            }
        );
        return pres;
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

    public Future<String> $getCookieID() {
        Invite inv = new Invite();
        inv.setUser(user.getName());
        inv.setPwd(user.getPwd());
        String inviteId = createInviteId();
        inv._setRecordKey(inviteId);
        realLive.getTable("Invite").$put(inviteId,inv,0);
        return new Promise<>(inviteId);
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

    public Future<Instrument> $getInstrument( String id ) {
        return realLive.getTable("Instrument").$get(id);
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
                        }
                        if (change.isSnapshotDone()) {
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

    public Future<User> $getUser() {
        return new Promise<>(user);
    }

    public Future<String> $addOrder( String marketId, String instrId, String instrName, boolean buy, int price, int qty, String text ) {
        Order o = new Order();
        o.setBuy(buy);
        o.setCreationTime(System.currentTimeMillis());
        o.setMarketKey(marketId);
        o.setInstrumentKey(instrId);
        o.setInstrumentName(instrName);
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
        message.setMessageText("" + message.getMessageText());
        if ( user.getAdminName() == null ) {
            message.setAdminId(user.getName()); // market owner owns hisself
        } else {
            message.setAdminId(user.getAdminName());
        }
        if ( message.getSenderId() == null )
            message.setSenderId(user.getName());
        message.setMsgTime(System.currentTimeMillis());
        message._setRecordKey(null);

        String t = message.getMessageText();
        if ( t.startsWith("@") ) {
            int nameIndex = t.indexOf(" ");
            if ( nameIndex > 0 ) {
                String name = t.substring(1,nameIndex);
                realLive.getTable("User").$get(name).then( (targetUser,e) -> {
                    if ( targetUser != null ) {
                        User tu = (User) targetUser;
                        String tuAdminName = tu.getAdminName();
                        if ( tuAdminName == null ) // admins should have themself as admins. Autocorrect inport issues
                            tuAdminName = tu.getName();
                        if ( tuAdminName != null && tuAdminName.equals(user.getAdminName()) ) {
                            message.setUserId(name);
                        }
                        msgTab.$add(message,0);
                    } else {
                        msgTab.$add(message,0);
                    }
                });
                return new Promise<>(null);
            }
        }
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
                invite.setTimeSent(System.currentTimeMillis());
                String key = createInviteId();
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

    protected String createInviteId() {
        String key = user.getName()+(""+Math.random()).substring(2);
        while( key.length() < 32 )
            key+=""+(int)(Math.random()*10);
        return key;
    }

    @Override
    public Future $getReport() {
        User finalUser = user;
        return new Promise(
            new SessionReport(
                getActor().getClass().getSimpleName(),
                getMailboxSize(),
                getCallbackSize(),
                user.getAdminName()+"::"+user.getName(),
                new Date(previousLogin).toString()
            )
        );
    }

    public static class SessionReport extends ActorReport {

        public SessionReport(String clz, int mailboxSize, int cbqSize, String user, String login) {
            super(clz, mailboxSize, cbqSize);
            this.user = user;
            this.login = login;
        }

        String user; // = finalUser.getAdminName()+"::"+finalUser.getName();
        String login; // = new Date(previousLogin).toString();

    }

    public Future<String> $updateUser(User u) {
        User updUser = (User) realLive.getTable("User").createForUpdate(user.getRecordKey(), true);
        updUser.setMotto(u.getMotto());
        updUser.setPwd(u.getPwd());
        return updUser.$apply(0);
    }
}
