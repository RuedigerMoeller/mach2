package com.reax;

import org.nustaq.kontraktor.*;
import org.nustaq.kontraktor.annotations.Local;
import org.nustaq.kontraktor.impl.ElasticScheduler;
import org.nustaq.kontraktor.remoting.http.netty.wsocket.ActorWSServer;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by ruedi on 23.10.2014.
 */
public class ReaXerve extends Actor<ReaXerve> {

    Map<String,ReaXession> sessions;
    long sessionIdCounter = 1;

    Scheduler clientScheduler;

    @Local
    public void $init( Scheduler clientScheduler ) {
        sessions = new HashMap<>();
        this.clientScheduler = clientScheduler;
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
            ReaXession newSession = Actors.AsActor(ReaXession.class, clientScheduler);
            String sessionId = "" + sessionIdCounter++; // can be more cryptic in the future
            newSession.$init(sessionId, user, self());
            sessions.put(sessionId, newSession);
            return new Promise<>(sessionId,null);
        }
        return new Promise<>(null,"authentication failure");
    }

    public Future<ReaXession> $getSession(String id) {
        return new Promise<>(sessions.get(id));
    }

    public void $clientTerminated(ReaXession session) {
        session.$getId().then((id, err) -> sessions.remove(id));
    }


    /**
     * startup server + map some files for development
     * @param arg
     * @throws Exception
     */
    public static void main( String arg[] ) throws Exception {
        if ( arg.length > 1 ) {
            System.out.println("Expect port as first argument");
            System.exit(1);
        }
        int port = 7777;
        if ( arg.length > 0 ) {
            try {
                port = Integer.parseInt(arg[0]);
            } catch (Exception ex) {
                ex.printStackTrace();
                System.out.println("Expect port as first argument");
                System.exit(1);
            }
        }

        ReaXerve xerver = Actors.AsActor(ReaXerve.class);
        final ElasticScheduler scheduler = new ElasticScheduler(2, 1000);
        xerver.$init(scheduler); // 2 threads, q size 1000

        // start websocket server (default path for ws traffic /websocket)
        File contentRoot = new File("./");
        ActorWSServer server = ActorWSServer.startAsRestWSServer(port, xerver, contentRoot, scheduler);

        // DEV avoid copying js libs
        server.setFileMapper( f -> {
            if ( f != null && f.getName() != null ) {
                if ( f.getName().equals("minbin.js") ) {
                    File file = new File("C:\\work\\GitHub\\fast-serialization\\src\\main\\javascript\\minbin.js");
                    if ( ! file.exists() ) {
                        return new File("/home/moelrue/IdeaProjects/gh/fast-serialization/src/main/javascript/minbin.js");
                    }
                    return file;
                }
                if ( f.getName().equals("kontraktor.js") ) {
                    File file = new File("C:\\work\\GitHub\\abstractor\\netty-kontraktor\\src\\main\\javascript\\kontraktor.js");
                    if ( ! file.exists() ) {
                        return new File("/home/moelrue/IdeaProjects/gh/kontraktor/netty-kontraktor/src/main/javascript/kontraktor.js");
                    }
                    return file;
                }
            }
            return f;
        });

    }


}
