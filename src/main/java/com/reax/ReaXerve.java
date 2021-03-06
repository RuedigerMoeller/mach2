package com.reax;

import com.lukehutch.fastclasspathscanner.FastClasspathScanner;
import com.reax.datamodel.*;
import com.reax.datamodel.Message;
import com.reax.matcher.Feeder;
import com.reax.matcher.Matcher;
import com.sun.org.apache.xpath.internal.operations.Bool;
import org.nustaq.kontraktor.*;
import org.nustaq.kontraktor.annotations.CallerSideMethod;
import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.kontraktor.annotations.Local;
import org.nustaq.kontraktor.remoting.http.rest.HtmlString;
import org.nustaq.kontraktor.util.HttpMonitor;
import org.nustaq.kontraktor.util.Log;
import org.nustaq.fourk.FourK;
import org.nustaq.kson.Kson;
import org.nustaq.reallive.RLTable;
import org.nustaq.reallive.RealLive;
import org.nustaq.reallive.Record;
import org.nustaq.reallive.impl.RLImpl;
import org.nustaq.reallive.sys.config.ConfigReader;
import org.nustaq.reallive.sys.config.SchemaConfig;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.function.BooleanSupplier;

/**
 * Created by ruedi on 23.10.2014.
 */
@GenRemote
public class ReaXerve extends FourK<ReaXerve,ReaXession> {

    public static ReaXerve Self;
    protected RealLive realLive;
    protected Mailer mailer;
    protected Matcher matcher;
    protected Feeder feeder;

    public static boolean isValidEmailAddress(String email) {
        String ePattern = "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$";
        java.util.regex.Pattern p = java.util.regex.Pattern.compile(ePattern);
        java.util.regex.Matcher m = p.matcher(email);
        return m.matches();
    }

    @Local
    public void $init(Scheduler clientScheduler) {
        Self = self();
        mailer = Actors.AsActor(Mailer.class);
        super.$init(clientScheduler);
        initRealLive()
            .onResult( r -> initMatcher() )
            .onError(e -> System.out.println("init failure: " + e));
    }

    protected void initMatcher() {
        matcher = Actors.AsActor(Matcher.class);
        matcher.$init(realLive);
        feeder = Actors.AsActor(Feeder.class);
        feeder.$init(realLive,matcher);

    }

    public void $startFeed() {
        feeder.$startFeed();
    }

    public void $stopFeed() {
        feeder.$stopFeed();
    }

    @CallerSideMethod
    public Mailer getMailer() {
        return getActor().mailer;
    }

    @CallerSideMethod
    public Matcher getMatcher() {
        return getActor().matcher;
    }

    protected Future initRealLive() {
        Promise p = new Promise();
        realLive = new RLImpl("./reallive-data");
        realLive.$init().onResult(r -> {
            scanModelClasses(User.class.getPackage().getName()).forEach(clazz -> {
                if (Record.class.isAssignableFrom(clazz))
                    realLive.createTable(clazz);
            });

            // fixme: bad hack. actually need to yield on createTable calls ..
            delayed(5000, () -> {
                realLive.getTable("User").$put(
                        "admin",
                        new User().init("admin", "admin", System.currentTimeMillis(), System.currentTimeMillis(), UserRole.ADMIN, "me@me.com"),
                        0
                );

                importInitialData(User.class);
                importInitialData(MarketPlace.class);
                importInitialData(Instrument.class);

                try {
                    SchemaConfig schemaProps = ConfigReader.readConfig("./model.kson");
//            realLive.getMetadata().overrideWith(schemaProps); // FIXME: side effecting
//            done per login for dynamic update
                } catch (Exception e) {
                    e.printStackTrace();
                }

                p.signal();
            });
        }).onError(e -> p.receive(null, e));
        return p;
    }

    private void importInitialData( Class<? extends Record> clz) {
        try {
            Class acl = Class.forName("[L"+clz.getName()+";");
            Record records[] = (Record[]) new Kson().readObject(new File("initialdata/"+clz.getSimpleName().toLowerCase()+".kson"), acl);
            for (int i = 0; i < records.length; i++) {
                Record record = records[i];
                if ( record.getRecordKey() != null ) {
                    realLive.getTable(clz.getSimpleName()).$putIfAbsent(
                            record.getRecordKey(),
                            record,
                            0
                    );
                } else {
                    Log.Warn(this, "Import: " + record + " is missing recordKey attribute");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    List<Class> scanModelClasses( String packageSepByComma ) {
        ArrayList<Class> records = new ArrayList<>();
        new FastClasspathScanner( packageSepByComma.split(",") )
                .matchClassesWithAnnotation( GenRemote.class, (clazz) -> {
                    try {
                        records.add(clazz);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }).scan();
        return records;
    }

    public Future<Boolean> $isInviteValid( String id ) {
        Promise result = new Promise();
        RLTable<Invite> invite = realLive.getTable("Invite");
        invite.$get(id).onResult(inv -> {
            if (inv == null) {
                result.receive( null, null);
            } else {
                result.receive( inv, null);
           }
        }).onError(err -> result.receive( null, null));
        return result;
    }

    public Future<String[]> $validateRegistration(String id) {
        Promise result = new Promise();
        RLTable<Invite> invite = realLive.getTable("Invite");
        invite.$get(id).onResult(inv -> {
            if (inv == null) {
                result.receive( null, null);
            } else {
//                if (System.currentTimeMillis() > inv.getTimeSent() + inv.getHoursValid() * 60l * 60 * 1000) {
//                    invite.$remove( inv.getRecordKey(), 0);
//                    result.receive( null, null);
//                } else
                {
                    User u = new User();
//                    u.setAdminName("admin");
                    u.setName(inv.getUser());
                    u.setPwd(inv.getPwd());
                    u.setEmail(inv.getEmail());
                    u.setRole(UserRole.MARKET_OWNER);
                    u.setCreationTime(u.getCreationTime());
                    RLTable users = realLive.getTable("User");
                    users.$putIfAbsent(u.getName(), u, 0);
                    users.$sync().onResult( r -> result.receive(new String[]{inv.getUser(), inv.getPwd()}, null) );
                }
            }
        }).onError(err -> result.receive( null, null));
        return result;
    }

    public Future<String> $registerUser( String user, String pwd, String email ) {
        if (isValidEmailAddress(email)) {
            RLTable<Invite> inviteTable = realLive.getTable("Invite");
            Invite invite = inviteTable.createForAdd();
            invite.setAdmin("admin");
            invite.setUser(user);
            invite.setPwd(pwd);
            invite.setEmail(email);
            invite.setTimeSent(System.currentTimeMillis());
            String key = user+(""+Math.random()).substring(2);
            while( key.length() < 32 )
                key+=""+(int)(Math.random()*10);
            invite._setRecordKey(key);
            inviteTable.$put(key,invite,0);
            String url = MailSettings.load().getAppurl()+"#register$"+key;
            final String finalKey = key;
            ReaXerve.Self.$submitEmail(email,
                    "Confirm your ReaX exchange registration",
                    "<html>Please click <a href='"+url+"'>here</a> to confirm</html>")
                    .onResult( succ -> {
                        if ( succ != null && succ ) {
                            invite.setMailSent(true);
                            inviteTable.$put(finalKey, invite, 0);
                        }
                    });
            return new Promise<>(null);
        }
        return new Promise<>("Invalid mail address");
    }

    @Override
    protected Future<Object> isLoginValid(String user, String pwd) {
        Promise p = new Promise();
        if ( user != null && user.length() == 32 ) // cookie
        {
            realLive.getTable("Invite").$get(user).then((invite, error) -> {
                if ( invite != null ) {
                    realLive.getTable("Invite").$remove(user,0);
                    isLoginValid( ((Invite)invite).getUser(), ((Invite) invite).getPwd() ).then( (r,e) -> p.receive(r,e) );
                } else {
                    p.receive( null, "invalid login");
                }
            });
            return p;
        }
        realLive.getTable("User").$get(user.trim().toLowerCase()).then((userRecord, error) -> {
            if ( userRecord != null && pwd.equals(((User) userRecord).getPwd())) {
                String name = ((User) userRecord).getName();
                // copy defualt image if none exists
                String pathname = "fileroot/img/user/" + name + ".png";
                if ( ! new File(pathname).exists() ) {
                    Path from = Paths.get("fileroot/img/user.png");
                    CopyOption[] options = new CopyOption[]{
                        StandardCopyOption.REPLACE_EXISTING
                    };
                    try {
                        Files.copy(from, Paths.get(pathname), options);
                    } catch (IOException e) {
                        Log.Warn(ReaXerve.this,e);
                    }
                }
                p.receive(userRecord,null);
            } else {
                p.receive(null,"authentication failure");
            }
        });
        return p;
    }

    @Override
    protected ReaXession createSessionActor(String sessionId, Scheduler clientScheduler, Object userRecord) {
        ReaXession actor = Actors.AsActor(ReaXession.class, clientScheduler);
        actor.$init((User) userRecord, realLive);
        return actor;
    }

    public Future<Boolean> $submitEmail(String receiver, String subject, String text) {
        return mailer.$sendMail(receiver,subject,text);
    }

    public Future<Boolean> $userExists(String user) {
        Promise p = new Promise();
        realLive.getTable("User").$get(user).then( (r,e) -> p.receive(r,e)) ;
        return p;
    }

    /**
     *
     * @param inviteId
     * @param nickname
     * @param pwd
     * @return null for success, else error msg
     */
    public Future<String> $createUserFromInvite(String inviteId, String nickname, String pwd) {
        Promise result = new Promise();
        RLTable<Invite> invite = realLive.getTable("Invite");
        invite.$get(inviteId).onResult(inv -> {
            if (inv == null) {
                result.receive( "no valid invitation found for given id.", null);
            } else {
                RLTable<User> ut = realLive.getTable("User");
                User newOne = new User();
                newOne._setRecordKey(nickname);
                newOne.setAdminName(inv.getAdmin());
                newOne.setEmail(inv.getEmail());
                newOne.setPwd(pwd);
                newOne.setName(nickname);
                newOne.setRole(UserRole.USER);
                newOne.setCreationTime(System.currentTimeMillis());
                invite.$remove( inv.getRecordKey(), 0);
                ut.$put(nickname,newOne,0);
                result.signal();
                postAdminMsg(inv.getAdmin(), nickname, "User " + nickname + " has confirmed your invitation !");
            }
        }).onError(err -> result.receive( ""+err, null));
        return result;
    }

    protected void postAdminMsg(String admin, String sender, String msgTxt ) {
        RLTable<Message> msgTab = realLive.getTable("Message");
        Message message = new Message();
        message.setAdminId(admin); // market owner owns hisself
        message.setSenderId(sender);
        message.setMessageText(msgTxt);
        message.setMsgTime(System.currentTimeMillis());
        message._setRecordKey(null);
        msgTab.$add(message,0);
    }
    /**
     * startup server + map some files for development
     * @param arg
     * @throws Exception
     */
    public static void main( String arg[] ) throws Exception {
        ReaXerve server = Actors.AsActor(ReaXerve.class);
        server.$main(arg).then( (r,e) -> {
            if ( e != null ) {
                ((Throwable)e).printStackTrace();
                System.exit(1);
            }
            HttpMonitor.DEFAULT_PORT = 8886;
            HttpMonitor.getInstance().$publish("server",server);
        });
    }

}
