package com.reax.matcher;

import com.reax.datamodel.Instrument;
import com.reax.datamodel.Order;
import org.nustaq.kontraktor.Actor;
import org.nustaq.reallive.RLTable;
import org.nustaq.reallive.RealLive;

/**
 * Created by ruedi on 27/12/14.
 */
public class Feeder extends Actor<Feeder> {

    boolean running;
    RealLive rl;
    Matcher matcher;

    public void $init(RealLive rl, Matcher m) {
        this.rl = rl;
        this.matcher = m;
    }

    public void $stopFeed() {
        running = false;
    }

    public void $startFeed() {
        if ( running )
            return;
        running = true;
        Thread.currentThread().setName("Feeder");
        delayed(5000, () -> self().$feed());
    }

    int orderCount = 0;
    public void $feed() {
        RLTable<Instrument> instr = rl.getTable("Instrument");
        instr.stream().each((change) -> {
            if ( orderCount > 1000 ) {
                RLTable orTable = rl.getTable("Order");
                orTable.stream().each((delChange) -> {
                    if ( delChange.isAdd() ) {
                        String text = ((Order) delChange.getRecord()).getText();
                        if (text != null && text.startsWith("Feeder")) {
                            orTable.$remove(delChange.getRecordKey(), 2);
                        }
                    }
                    if ( delChange.isSnapshotDone() ) {
                        orderCount = 0;
                    }
                });
            } else {
                if ( change.isAdd() && ! change.getRecord().isTemplate() ) {
                    if (change.getRecordKey().startsWith("germany")) {
                        return;
                    }
                    double rand = 1 - (change.getRecordKey().charAt(0) - 65) / 100.0;
                    if ( Math.random() < rand ) {
                        Instrument instrument = change.getRecord();
                        //                        Order newOrder = (Order) rl.getTable("Order").createForAddWithKey();
                        Order newOrder = new Order();
                        newOrder.setInstrumentKey(instrument.getRecordKey());
                        boolean isBuy = Math.random() > .5;
                        if (isBuy) {
                            newOrder.setBuy(isBuy);
                            newOrder.setQty((int) (Math.random() * 70 + 50));
                            newOrder.setLimitPrice((int) (Math.random() * 888 + 1));
                        } else {
                            newOrder.setBuy(isBuy);
                            newOrder.setQty((int) (Math.random() * 70 + 50));
                            newOrder.setLimitPrice((int) (Math.random() * 500 + 500));
                        }
                        switch ((int) (Math.random() * 2)) {
                            case 0:
                                newOrder.setTraderKey("Feed0");
                                break;
                            case 1:
                                newOrder.setTraderKey("Feed1");
                                break;
                        }
                        newOrder.setCreationTime(System.currentTimeMillis());
                        int len = (int) (Math.random() * 20 + 1);
                        String t = "Feeder ";
                        for (int i = 0; i < len; i++)
                            t += " poaskdpaokds";
                        newOrder.setText(t);
                        // newOrder.$apply(2);
                        matcher.$addOrder(newOrder);
                        orderCount++;
                    }
                }
            }
        });
        if ( running ) {
            delayed(1000, () -> self().$feed());
        }
    }
}
