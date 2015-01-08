package com.reax.matcher;

import com.reax.datamodel.Instrument;
import com.reax.datamodel.Order;
import org.nustaq.kontraktor.Actor;
import org.nustaq.reallive.RLTable;
import org.nustaq.reallive.RealLive;

import java.util.ArrayList;

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

    int orderCount = 2000;
    public void $feed() {
        RLTable<Instrument> instr = rl.getTable("Instrument");
        instr.stream().forEach((change) -> {
            if (orderCount > 2000) {
                RLTable orTable = rl.getTable("Order");
                ArrayList<String> toDel = new ArrayList<>();
                orTable.stream().forEach( (delChange) -> {
                    if (delChange.isAdd()) {
                        String text = ((Order) delChange.getRecord()).getText();
                        if (text != null && (text.endsWith("..")||text.indexOf("Feeder") >= 0)) {
                            toDel.add(delChange.getRecordKey());
                        }
                    }
                    if (delChange.isSnapshotDone()) {
                        if ( orderCount > 0 )
                            run(() -> toDel.forEach(key -> orTable.$remove(key, 2)));
                        orderCount = 0;
                    }
                });
            } else {
                if (change.isAdd() && !change.getRecord().isTemplate()) {
                    if (change.getRecordKey().startsWith("germany")) {
                        return;
                    }
                    double rand = 1 - (change.getRecordKey().charAt(0) - 65) / 100.0;
                    if (Math.random() < rand) {
                        Instrument instrument = change.getRecord();
                        //                        Order newOrder = (Order) rl.getTable("Order").createForAddWithKey();
                        Order newOrder = new Order();
                        newOrder.setInstrumentKey(instrument.getRecordKey());
                        newOrder.setMarketKey(instrument.getMarketPlace());
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
                        String t = "";
                        switch ((int)(Math.random()*5)) {
                            case 0: t += "losers will lose"; break;
                            case 1: t += "Kauft Ihr Schafe"; break;
                            case 2: t += "gogogo"; break;
                            case 3: t += "Ein etwas längerer text nur so zum test"; break;
                            case 4: t += "a winner"; break;
                        }
                        newOrder.setText(t+" ..");
                        // newOrder.$apply(2);
                        matcher.$addOrder(newOrder);
                        orderCount++;
                    }
                }
            }
        });
        if ( running ) {
            delayed(3000, () -> self().$feed());
        }
    }
}
