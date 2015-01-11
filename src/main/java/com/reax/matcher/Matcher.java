package com.reax.matcher;

import com.reax.datamodel.Instrument;
import com.reax.datamodel.Order;
import com.reax.datamodel.Trade;
import com.reax.datamodel.User;
import org.nustaq.kontraktor.Actor;
import org.nustaq.kontraktor.Future;
import org.nustaq.kontraktor.Promise;
import org.nustaq.kontraktor.util.Log;
import org.nustaq.kontraktor.util.TicketMachine;
import org.nustaq.reallive.ChangeBroadcast;
import org.nustaq.reallive.RLTable;
import org.nustaq.reallive.RealLive;

import java.util.HashMap;
import java.util.HashSet;

/**
 * Created by ruedi on 26/12/14.
 */
public class Matcher extends Actor<Matcher> {

    public static int MATCHER_ID = 1; // id of sending matcher
    private static final int MAX_ORDER_QTY = 9999;

    RealLive rl;

    RLTable<Order> orders;
    RLTable<Trade> trades;
    RLTable<Instrument> instruments;
    HashMap<String,InstrumentMatcher> matcherMap = new HashMap<>();
    TicketMachine tickets = new TicketMachine();

    long orderIdCnt = System.currentTimeMillis(); // FIXME: adjust after restart from persistence ?

    String createOrderId() {
        return "MA:"+orderIdCnt++;
    }

    boolean initialized = false;
    public void $init(RealLive rl) {
        Thread.currentThread().setName("Matcher");
        checkThread();
        this.rl = rl;

        orders = rl.getTable("Order");
        trades = rl.getTable("Trade");
        instruments = rl.getTable("Instrument");

        checkThread();
        // pump stored orders into matchers
        orders.stream().subscribe(null,(ordchange) -> {
            checkThread();
            if ( ordchange.getRecord() != null ) {
                instruments.$get(ordchange.getRecord().getInstrumentKey()).onResult(
                    instr -> getMatcher(instr).onARUChange(ordchange)
                );
            } else
            if ( ordchange.isSnapshotDone() ) {
                delayed( 1, () -> {
                    matcherMap.values().forEach((matcher) -> matcher.snapDone(ordchange));
                    initialized = true;
                });
            } else {
                System.out.println("ignored change message "+ordchange);
            }
        });
    }

    InstrumentMatcher getMatcher( Instrument inst ) {
        InstrumentMatcher instrumentMatcher = matcherMap.get(inst.getRecordKey());
        if ( instrumentMatcher == null ) {
            instrumentMatcher = new InstrumentMatcher(self(), inst, orders, trades);
            matcherMap.put(inst.getRecordKey(), instrumentMatcher);
            if ( initialized ) {
                instrumentMatcher.snapDone(ChangeBroadcast.NewSnapFin("Order",0));
            }
        }
        return instrumentMatcher;
    }

    // returns null or error string FIXME: bad style inherited from early impl ..
    public Future<String> $addOrder( Order ord ) {
        if ( ord.getLimitPrice() <= 0 || ord.getQty() < 1 || ord.getQty() > MAX_ORDER_QTY || ord.getLimitPrice() > 9999 ) {
            return new Promise("Invalid OrderPrice or Quantity");
        }
        Promise<String> result = new Promise<>();

        tickets.getTicket(ord.getTraderKey()).then((finished, error) -> {
            Future<User> user = rl.getTable("User").$get(ord.getTraderKey());
            yield(user).then( (r,e) -> {
                ord._setRecordKey(createOrderId());
                InstrumentMatcher instrumentMatcher = matcherMap.get(ord.getInstrumentKey());
                if ( instrumentMatcher == null ) {
                    instruments.$get(ord.getInstrumentKey()).onResult( instr -> {
                        getMatcher(instr).addOrder(ord, user.getResult() )
                            .then((res, err) -> {
                                result.receive(err != null ? err : res, null);
                                finished.signal();
                            });
                    }).onError( er -> Log.Warn(this,"fatal: instrument "+ord.getInstrumentKey()+" not found."));
                } else {
                    instrumentMatcher.addOrder(ord, user.getResult() )
                        .then((res, err) -> {
                            result.receive(err != null ? err : res, null);
                            finished.signal();
                        });
                }
            });

        });

        return result;
    }

    /**
     * post process mactch for orders, trade + market update already done
     *
     * @param ord
     * @param matchedQty
     * @param matchPrice
     */
    // order must not be changed, just as input
    public void $processMatch( Order ord, int matchedQty, int matchPrice ) {
        tickets.getTicket(ord.getTraderKey()).then( (finished,e) -> {
            Future<User> userFuture = rl.getTable("User").$get(ord.getTraderKey());
            yield(userFuture).then( (r,e1) -> {
                User user = userFuture.getResult();
                if ( user != null ) {
                    user.prepareForUpdate(true);
                    user.getPos(ord.getMarketKey(), rl.getTable("Asset"))
                        .addPosition(
                            ord.getInstrumentKey(),
                            ord.isBuy() ? matchedQty : -matchedQty
                        );
                    user.setCash(user.getCash() + (ord.isBuy() ? -matchedQty : matchedQty) * matchPrice);
                    // else concurrency issues !
                    user.$apply(MATCHER_ID).then( (sig,e2) -> finished.signal() );
                    return;
                } else {
                    if ( ! "Feed0".equals(ord.getTraderKey()) && ! "Feed1".equals(ord.getTraderKey()) )
                        Log.Warn(Matcher.this,"unknown user in match:"+ord.getTraderKey());
                }
                finished.signal();
            });
        });
    }

    public Future<String> $delOrder( Order ord ) {
        Promise result = new Promise();
        tickets.getTicket(ord.getTraderKey()).then( (sigFin, e) -> {
            matcherMap.get(ord.getInstrumentKey()).delOrder(ord).then((r,err) -> {
                if ( r == null ) {
                    result.receive("Order " + ord.getRecordKey() + " not found.", null);
                    sigFin.signal();
                    return;
                }
                if ( ord.getQty() != r.getQty() ) {
                    result.receive("Partial Order deleted. Has already been matched partially: " + (ord.getQty() - r.getQty()), null);
                    orders.$remove(ord.getRecordKey(),MATCHER_ID);
                    orderDeletionBalanceUpdate(ord);
                    sigFin.signal();
                    return;
                }
                result.receive((ord.isBuy() ? "Buy" : "Sell") + " Order deleted. [" + ord.getInstrumentKey() + " " + ord.getQty() + "@" + (ord.getLimitPrice() / 100) + "]", null);
                orders.$remove(ord.getRecordKey(),MATCHER_ID);
                orderDeletionBalanceUpdate(ord);
                sigFin.signal();
            });
        });
        return result;
    }

    private void orderDeletionBalanceUpdate(Order ord) {
        tickets.getTicket(ord.getTraderKey()).then( (finished,e) -> {
            Future<User> user = rl.getTable("User").$get(ord.getTraderKey());
            yield(user).then((r, e1) -> {
                // todo: adjust Market position
                finished.signal();
            });
        });
    }

}
