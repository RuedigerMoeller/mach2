package com.reax;

import com.reax.datamodel.Instrument;
import com.reax.datamodel.Invite;
import com.reax.datamodel.MarketPlace;
import com.reax.datamodel.User;
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

import java.util.HashMap;

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

    public Future<String> $subscribe(String table, String query, Callback cb) {
        Subscription subs = realLive.stream(table).subscribe(new JSQuery(query), (change) -> cb.receive(change, CONT));
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
            String newMPKey = place.getRecordKey() + "#" + user.getRecordKey();
            mpTable.$put(newMPKey, place, 0);
            instrTable.stream().filter(
                ins -> {
                    if ( "admin".equals(ins.getOwner()) && mpRecordKey.equals(ins.getMarketPlace()) ) {
                        return true;
                    }
                    return false;
                },
                change -> {
                    if ( change.isAdd() ) {
                        Instrument tpl = change.getRecord();
                        tpl.setOwner(user.getRecordKey());
                        tpl.setMarketPlace(newMPKey);
                        instrTable.$put(tpl.getRecordKey() + "#" + user.getRecordKey(), tpl, 0);
                    } else
                    if ( ! change.isARU() ) {
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
        subscriptions.values().forEach( (subs) -> {
            realLive.getTable(subs.getTableKey()).stream().unsubscribe(subs);
        });
        subscriptions.clear();
        super.$hasBeenUnpublished();
    }

    public Future $hello( String hello ) {
        System.out.println("Hello");
        return new Promise("selber");
    }

    protected boolean isValidEmailAddress(String email) {
        String ePattern = "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$";
        java.util.regex.Pattern p = java.util.regex.Pattern.compile(ePattern);
        java.util.regex.Matcher m = p.matcher(email);
        return m.matches();
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
            if (isValidEmailAddress(s)) {
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
                String url = MailSettings.load().getAppurl()+"/rest/$httpRedirectInvite/"+key;
                ReaXerve.Self.$submitEmail(s,"You have been invited to reax exchange","click <a href='"+url+"'>here</a> to pick a user name.");
                count++;
            }
        }
        return new Promise<>( (count == 0) ? "SUCCESS" : "no message sent");
    }

}
