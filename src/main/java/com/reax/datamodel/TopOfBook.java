package com.reax.datamodel;

import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.reallive.Record;

import java.text.DateFormat;
import java.util.Date;

/**
 * Created by ruedi on 18.07.14.
 *
 * Top of book entry for a single intstrument (instrument id = recordKey)
 */
@GenRemote
public class TopOfBook extends Record {

    int bid;
    int ask;
    int bidQty;
    int askQty;

    int lastPrc;
    int lastQty;

    long lastMatch;
    String lastMatchStr;
    String state = "TRADE";

    public TopOfBook() {
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public TopOfBook(String key, int bid, int ask, int bidQty, int askQty, int lastPrc, int lastQty, long lastMatch, String lastMatchTimeUTC) {
        super(key);
        this.bid = bid;
        this.ask = ask;
        this.bidQty = bidQty;
        this.askQty = askQty;
        this.lastPrc = lastPrc;
        this.lastQty = lastQty;
        this.lastMatch = lastMatch;
        this.lastMatchStr = lastMatchTimeUTC;
    }

    public int getBid() {
        return bid;
    }

    public void setBid(int bid) {
        this.bid = bid;
    }

    public int getAsk() {
        return ask;
    }

    public void setAsk(int ask) {
        this.ask = ask;
    }

    public int getBidQty() {
        return bidQty;
    }

    public void setBidQty(int bidQty) {
        this.bidQty = bidQty;
    }

    public int getAskQty() {
        return askQty;
    }

    public void setAskQty(int askQty) {
        this.askQty = askQty;
    }

    public int getLastPrc() {
        return lastPrc;
    }

    public void setLastPrc(int lastPrc) {
        this.lastPrc = lastPrc;
    }

    public int getLastQty() {
        return lastQty;
    }

    public void setLastQty(int lastQty) {
        this.lastQty = lastQty;
    }

    public long getLastMatch() {
        return lastMatch;
    }

    public void setLastMatch(long lastMatch) {
        this.lastMatch = lastMatch; setLastTradeStringFrom(lastMatch);
    }

    public String getLastMatchStr() {
        return lastMatchStr;
    }

    public void setLastMatchStr(String lastMatchStr) {
        this.lastMatchStr = lastMatchStr;
    }

    public void setLastTradeStringFrom(long timeStringFrom) {
        this.lastMatchStr = Trade.df.format(new Date(timeStringFrom));
    }

}
