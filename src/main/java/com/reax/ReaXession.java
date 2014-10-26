package com.reax;

import com.reax.datamodel.User;
import org.nustaq.kontraktor.Actor;
import org.nustaq.kontraktor.Future;
import org.nustaq.kontraktor.Promise;
import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.kontraktor.annotations.Local;
import org.nustaq.kontraktor.remoting.RemotableActor;
import org.nustaq.reallive.RealLive;
import org.nustaq.reallive.RealLiveClientWrapper;
import org.nustaq.reallive.sys.metadata.Metadata;

import java.util.Date;

/**
 * Created by ruedi on 23.10.2014.
 */
@GenRemote
public class ReaXession extends Actor<ReaXession> implements RemotableActor {

    long creationTime = System.currentTimeMillis();
    String sessionId;
    ReaXerve app;
    RealLive realLive;
    User user;

    @Local
    public void $init(String sessionId, User user, ReaXerve app, RealLive realLive) {
        this.sessionId = sessionId;
        this.app = app;
        this.realLive = new RealLiveClientWrapper(realLive);
        this.user = user;
    }

    public Future<String> $getId() {
        return new Promise<>(sessionId);
    }

    public Future $getCreationTime() {
        return new Promise<>(new Date(creationTime).toString() );
    }

    public Future<Metadata> $getRLMeta() {
        return new Promise<>(realLive.getMetadata());
    }

    @Override
    @Local
    public void $hasBeenUnpublished() {
        app.$clientTerminated(self()).then(() -> self().$stop());
    }
}
