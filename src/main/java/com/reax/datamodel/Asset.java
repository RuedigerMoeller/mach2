package com.reax.datamodel;

import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.reallive.Record;
import org.nustaq.reallive.sys.annotations.KeyLen;
import org.nustaq.reallive.sys.annotations.RenderStyle;

/**
 * Created by ruedi on 10/01/15.
 *
 * replication of a position (key is user#instrument)
 */
@GenRemote @KeyLen(Keys.ASSET)
public class Asset extends Record {

    int value;
    @RenderStyle("Price")
    int risk;
    // redundant for faster indexing
    String userId;
    String marketId;
    String instrumentId;
    String displayString;

    public Asset(int value, String userId, String marketId, String instrumentId, String displayString, int risk) {
        this.value = value;
        this.userId = userId;
        this.marketId = marketId;
        this.instrumentId = instrumentId;
        this.displayString = displayString;
        this.risk = risk;
    }

    public int getRisk() {
        return risk;
    }

    public void setRisk(int risk) {
        this.risk = risk;
    }

    public String getDisplayString() {
        return displayString;
    }

    public void setDisplayString(String displayString) {
        this.displayString = displayString;
    }

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getMarketId() {
        return marketId;
    }

    public void setMarketId(String marketId) {
        this.marketId = marketId;
    }

    public String getInstrumentId() {
        return instrumentId;
    }

    public void setInstrumentId(String instrumentId) {
        this.instrumentId = instrumentId;
    }
}
