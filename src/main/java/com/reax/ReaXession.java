package com.reax;

import org.nustaq.kontraktor.Actor;
import org.nustaq.kontraktor.Future;
import org.nustaq.kontraktor.Promise;

/**
 * Created by ruedi on 23.10.2014.
 */
public class ReaXession extends Actor<ReaXession> {

    long creationTime = System.currentTimeMillis();
    long lastHB = creationTime;
    String sessionId;

    public void $init(String sessionId, String user, ReaXerve self) {
        this.sessionId = sessionId;
    }

    public Future<String> $getId() {
        return new Promise<>(sessionId);
    }
}
