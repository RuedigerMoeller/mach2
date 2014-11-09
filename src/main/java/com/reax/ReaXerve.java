package com.reax;

import com.lukehutch.fastclasspathscanner.FastClasspathScanner;
import com.reax.datamodel.Asset;
import com.reax.datamodel.TestRecord;
import com.reax.datamodel.User;
import com.reax.datamodel.UserRole;
import org.nustaq.kontraktor.*;
import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.kontraktor.annotations.Local;
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
import java.util.*;

/**
 * Created by ruedi on 23.10.2014.
 */
@GenRemote
public class ReaXerve extends FourK<ReaXerve,ReaXession> {

    protected RealLive realLive;

    @Local
    public void $init(Scheduler clientScheduler) {
        super.$init(clientScheduler);
        initRealLive();
    }

    protected void initRealLive() {
        realLive = new RLImpl("./reallive-data");

        scanModelClasses( User.class.getPackage().getName() ).forEach(clazz -> realLive.createTable(clazz));

        importInitialData(User.class);

        realLive.getTable("User").$put(
                "admin",
                new User().init("admin", "admin", new Date().toString(), new Date().toString(), UserRole.ADMIN, "me@me.com"),
                0
        );

        RLTable testTable = realLive.getTable("TestRecord");
        for ( int i = 1; i < 500; i++ ) {
            testTable.$put("test_" + i, new TestRecord().init("name"+i,""+Math.random(),13,32,5*i),0);
        }

        try {
            SchemaConfig schemaProps = ConfigReader.readConfig("./model.kson");
            realLive.getMetadata().overrideWith(schemaProps); // FIXME: side effecting
        } catch (Exception e) {
            e.printStackTrace();
        }

        delayed( 5000, () -> $changeStuff() );
    }

    private void importInitialData( Class<? extends Record> clz) {
        try {
            Record records[] = (Record[]) new Kson().readObject(new File("initialdata/"+clz.getSimpleName().toLowerCase()+".kson"), clz);
            for (int i = 0; i < records.length; i++) {
                Record record = records[i];
                if ( record.getRecordKey() != null ) {
                    realLive.getTable(clz.getSimpleName()).$put(
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

    int stuffCount = 0;
    public void $changeStuff() {
        if ( isStopped() )
            return;
        RLTable<User> user = realLive.getTable("User");
        user.$get("admin").then((u, e) -> {
            user.prepareForUpdate(u);
            u.setEmail("" + Math.random());
            u.$apply(0);
            if ( stuffCount == 0 ) {
                user.$put("pok", new User().init("pok", "asd", "-", "..", UserRole.MARKET_OWNER, "...."), 0);
                stuffCount++;
            } else {
                user.$remove("pok", 0 );
                stuffCount = 0;
            }
            delayed(5000, () -> $changeStuff());
        });
    }

    @Override
    protected Future<Object> isLoginValid(String user, String pwd) {
        Promise p = new Promise();
        realLive.getTable("User").$get(user.trim().toLowerCase()).then((userRecord, error) -> {
            if ( userRecord != null && pwd.equals(((User) userRecord).getPwd())) {
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
        actor.$init((User)userRecord,realLive);
        return actor;
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
                ((Exception)e).printStackTrace();
                System.exit(1);
            }
        });
    }

}
