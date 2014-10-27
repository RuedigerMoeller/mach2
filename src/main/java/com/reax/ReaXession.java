package com.reax;

import com.reax.datamodel.User;
import org.nustaq.kontraktor.Actor;
import org.nustaq.kontraktor.Callback;
import org.nustaq.kontraktor.Future;
import org.nustaq.kontraktor.Promise;
import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.kontraktor.annotations.Local;
import org.nustaq.kontraktor.remoting.RemotableActor;
import org.nustaq.reallive.RealLive;
import org.nustaq.reallive.RealLiveClientWrapper;
import org.nustaq.reallive.Subscription;
import org.nustaq.reallive.queries.JSQuery;
import org.nustaq.reallive.sys.messages.Invocation;
import org.nustaq.reallive.sys.messages.QueryTuple;
import org.nustaq.reallive.sys.metadata.Metadata;

import java.util.Date;
import java.util.HashSet;

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

    //////////////////////////////////////////////////////
    // RealLive access (to be isolated)

    HashSet<Callback> subscriptions = new HashSet<>();

    // expect [tableName,recordkey]
    public void $subscribeKey(String table, String recordKey, Callback cb) {
        Subscription subs = realLive.stream(table).subscribeKey( recordKey, (change) -> cb.receive(change,CONT) );
        subscriptions.add(cb);
    }

//    // expect [tableName,filterString]
//    Object subscribe(Invocation<QueryTuple> inv) {
//        QueryTuple argument = inv.getArgument();
//        Subscription subs = getRLDB().stream("" + argument.getTableName()).subscribe( new JSQuery(argument.getQuerySource()), (change) -> sendReply(inv, change));
//        subscriptions.put(inv.getCbId(),subs);
//        return NO_RESULT;
//    }
//
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
