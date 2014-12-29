package com.reax.datamodel;

import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.reallive.Record;
import org.nustaq.reallive.sys.annotations.*;

import java.text.DateFormat;
import java.util.Date;

/**
 * Created by ruedi on 18.07.14.
 *
 * Key is orderId
 *
 */
@GenRemote
public class Order extends Record {

    String instrumentKey;
    String instrumentMnem;

    boolean buy; // else sell

    @RenderStyle("Price") @DisplayWidth("60px") @Align("right")
    int limitPrice;
    int qty;

    @RenderStyle("Text15")
    String text;

    String traderKey;

    long creationTime;
    String creationTimeString;

    public long getCreationTime() {
        return creationTime;
    }

    public void setCreationTime(long creationTime) {
        this.creationTime = creationTime;
        setTimeStringFrom(creationTime);
    }

    public String getInstrumentMnem() {
        return instrumentMnem;
    }

    public void setInstrumentMnem(String instrumentMnem) {
        this.instrumentMnem = instrumentMnem;
    }

    public String getCreationTimeString() {
        return creationTimeString;
    }

    public void setCreationTimeString(String creationTimeString) {
        this.creationTimeString = creationTimeString;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getInstrumentKey() {
        return instrumentKey;
    }

    public void setInstrumentKey(String instrumentKey) {
        this.instrumentKey = instrumentKey;
    }

    public boolean isBuy() {
        return buy;
    }

    public void setBuy(boolean buy) {
        this.buy = buy;
    }

    public int getLimitPrice() {
        return limitPrice;
    }

    public void setLimitPrice(int limitPrice) {
        this.limitPrice = limitPrice;
    }

    public int getQty() {
        return qty;
    }

    public void setQty(int qty) {
        this.qty = qty;
    }

    public String getTraderKey() {
        return traderKey;
    }

    public void setTraderKey(String traderKey) {
        this.traderKey = traderKey;
    }

    public void setTimeStringFrom(long timeStringFrom) {
        this.creationTimeString = DateFormat.getDateTimeInstance().format(new Date(timeStringFrom));
    }
}
