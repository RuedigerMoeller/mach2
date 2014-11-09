package com.reax.datamodel;

import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.reallive.Record;
import org.nustaq.reallive.sys.annotations.Description;
import org.nustaq.reallive.sys.annotations.KeyLen;

/**
 * Created by ruedi on 27.07.14.
 *
 * Trader#InstrumentID
 *
 */
@KeyLen(20+20+1) @GenRemote @Description("refers to an asset of a trader. Key is Trader#InstrumentID")
public class Asset extends Record {

    int qty;
    int margined;
    int openBuyQty;
    int openSellQty;

    public Asset(String key, int qty) {
        super(key);
        this.qty = qty;
    }

    public int getOpenBuyQty() {
        return openBuyQty;
    }

    public void setOpenBuyQty(int openBuyQty) {
        this.openBuyQty = openBuyQty;
    }

    public int getOpenSellQty() {
        return openSellQty;
    }

    public void setOpenSellQty(int openSellQty) {
        this.openSellQty = openSellQty;
    }

    public int getMargined() {
        return margined;
    }

    public void setMargined(int margined) {
        this.margined = margined;
    }

    public int getQty() {
        return qty;
    }

    public void setQty(int qty) {
        this.qty = qty;
    }

    public int getAvaiable() {
        return qty-margined;
    }
}
