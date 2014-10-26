package com.reax;

import com.reax.datamodel.User;
import com.reax.datamodel.UserRole;
import org.nustaq.kontraktor.*;
import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.kontraktor.annotations.Local;
import org.nustaq.kontraktor.impl.ElasticScheduler;
import org.nustaq.kontraktor.remoting.Coding;
import org.nustaq.kontraktor.remoting.SerializerType;
import org.nustaq.kontraktor.remoting.http.netty.wsocket.ActorWSServer;
import org.nustaq.kson.Kson;
import org.nustaq.kson.KsonDeserializer;
import org.nustaq.reallive.RealLive;
import org.nustaq.reallive.impl.RLImpl;

import java.io.File;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Created by ruedi on 23.10.2014.
 */
@GenRemote
public class ReaXerve extends Actor<ReaXerve> {

    Map<String,ReaXession> sessions;
    long sessionIdCounter = 1;

    Scheduler clientScheduler; // set of threads processing client requests
    RealLive realLive;

    @Local
    public void $init( Scheduler clientScheduler ) {
        sessions = new HashMap<>();
        realLive = new RLImpl("./reallive");
        this.clientScheduler = clientScheduler;
        realLive.createTable(User.class);
        realLive.getTable("User").$put(
            "admin",
            new User().init("admin", "admin", new Date().toString(), new Date().toString(), UserRole.ADMIN),
            0
        );
    }

    /**
     * to avoid the need for anonymous clients to create a websocket connection prior logon,
     * this is exposed as a webservice and is called using $.get(). The Id returned then can be
     * used to obtain a valid session id for the websocket connection.
     *
     * @param user
     * @param pwd
     * @return
     */
    public Future<String> $authenticate( String user, String pwd ) {
        if ( user != null && pwd != null ) // dummy auth
        {
            Promise p = new Promise();
            realLive.getTable("User").$get(user.trim().toLowerCase()).then((userRecord, error) -> {
                if ( userRecord != null && pwd.equals(((User) userRecord).getPwd())) {
                    ReaXession newSession = Actors.AsActor(ReaXession.class, clientScheduler);
                    String sessionId = "" + sessionIdCounter++; // can be more cryptic in the future
                    newSession.$init(sessionId, (User) userRecord, self(), realLive);
                    sessions.put(sessionId, newSession);
                    p.receive(sessionId,null);
                } else {
                    p.receive(null,"authentication failure");
                }
            });
            return p;
        }
        return new Promise<>(null,"authentication failure");
    }

    public Future<ReaXession> $getSession(String id) {
        return new Promise<>(sessions.get(id));
    }

    @Local
    public Future $clientTerminated(ReaXession session) {
        Promise p = new Promise();
        session.$getId().then((id, err) -> {
            sessions.remove(id);
            p.signal();
        });
        return p;
    }


    /**
     * startup server + map some files for development
     * @param arg
     * @throws Exception
     */
    public static void main( String arg[] ) throws Exception {

        ReaXConf appconf = (ReaXConf) new Kson().readObject(new File("reaxconf.kson"), ReaXConf.class.getName());

        int port = parseArgs(arg);
        if ( port <= 0 )
            port = appconf.port;

        HashMap<String,String> shortClassNameMapping = (HashMap<String, String>) new Kson().readObject(new File("name-map.kson"),HashMap.class);

        ReaXerve xerver = Actors.AsActor(ReaXerve.class);
        final ElasticScheduler scheduler = new ElasticScheduler(2, 1000);
        xerver.$init(scheduler); // 2 threads, q size 1000

        // start websocket server (default path for ws traffic /websocket)
        ActorWSServer server = ActorWSServer.startAsRestWSServer(
                port,
                xerver,         // facade actor
                new File("./"), // content root
                scheduler,      // Scheduler determining per client q size + number of worker threads
                new Coding(
                    SerializerType.MinBin,
                    conf -> shortClassNameMapping.forEach( (k,v) -> conf.registerCrossPlatformClassMapping(k,v) )
                )
        );

        // DEV mappings to avoid copying js libs
        mapDEVLibLocations(server);
    }

    private static void mapDEVLibLocations(ActorWSServer server) {
        // FIXME: implement js classpath and single request bulk loading
        Function<File, File> fileMapper = f -> {
            if (f != null && f.getName() != null) {
                if (f.getName().equals("minbin.js")) {
                    File file = new File("C:\\work\\GitHub\\fast-serialization\\src\\main\\javascript\\minbin.js");
                    if (!file.exists()) {
                        return new File("/home/ruedi/IdeaProjects/fast-serialization/src/main/javascript/minbin.js");
                    }
                    return file;
                }
                if (f.getName().equals("kontraktor.js")) {
                    File file = new File("C:\\work\\GitHub\\abstractor\\netty-kontraktor\\src\\main\\webroot\\kontraktor.js");
                    if (!file.exists()) {
                        return new File("/home/ruedi/IdeaProjects/abstractor/netty-kontraktor/src/main/javascript/kontraktor.js");
                    }
                    return file;
                }
                if (f.getName().equals("real-live.js")) {
                    File file = new File("C:\\work\\GitHub\\RealLive\\src\\js\\real-live.js");
                    if (!file.exists()) {
                        return new File("/home/ruedi/IdeaProjects/abstractor/netty-kontraktor/src/main/javascript/kontraktor.js");
                    }
                    return file;
                }
            }
            return f;
        };
        server.setFileMapper(fileMapper);
    }

    // grab prot from command line args
    private static int parseArgs(String[] arg) {
        int port = 0;
        if ( arg.length > 1 ) {
            System.out.println("Expect port as first argument");
            System.exit(1);
        }
        if ( arg.length > 0 ) {
            try {
                port = Integer.parseInt(arg[0]);
            } catch (Exception ex) {
                ex.printStackTrace();
                System.out.println("Expect port as first argument");
                System.exit(1);
            }
        }
        return port;
    }


}
