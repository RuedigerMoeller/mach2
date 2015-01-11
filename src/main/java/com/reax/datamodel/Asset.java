package com.reax.datamodel;

import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.reallive.Record;
import org.nustaq.reallive.sys.annotations.KeyLen;

/**
 * Created by ruedi on 10/01/15.
 *
 * replication of a position (key is user#instrument)
 */
@GenRemote @KeyLen(Keys.ASSET)
public class Asset extends Record {

    int value;
    // redundant for faster indexing
    String userId;
    String marketId;
    String instrumentId;

    public Asset(int value, String userId, String marketId, String instrumentId) {
        this.value = value;
        this.userId = userId;
        this.marketId = marketId;
        this.instrumentId = instrumentId;
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
