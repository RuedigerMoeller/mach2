package com.reax.datamodel;

import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.reallive.Record;
import org.nustaq.reallive.sys.annotations.*;

/**
 * Created by ruedi on 18.07.14.
 *
 * key = synthetic id
 *
 */
@GenRemote
@KeyLen(8) // instr template id # marketid
public class Instrument extends Record {

    String description;
    long expiryDate;
    String expiryDateString;
    int contractsTraded;
    int volumeTraded;

    @Description("market this instrument belongs to")
    String marketPlace;
    @Description("owning user of market this instrument belongs to")
    String owner;
    @Description("mnemonic")
    String name;

    @RenderStyle("Price") @BGColor("rgba(77,8,8,0.8)") @DisplayWidth("60px") @TextColor("#fff")
    int bid;
    @RenderStyle("Price") @BGColor("rgba(77,8,8,0.8)") @DisplayWidth("60px") @TextColor("#fff")
    int ask;
    @RenderStyle("Qty") @DisplayWidth("60px")
    int bidQty;
    @RenderStyle("Qty")  @DisplayWidth("60px")
    int askQty;

    @RenderStyle("Price") @DisplayWidth("60px")
    int lastPrc;
    @RenderStyle("Qty") @DisplayWidth("60px")
    int lastQty;

    @Hidden
    long lastMatch;
    @DisplayWidth("160px") @DisplayName("Time")
    String lastMatchTimeUTC;
    String state = "TRADE";


    public Instrument() {
    }

    public Instrument(String key, String description, long expiryDate, String expiryDateString) {
        super(key);
        this.description = description;
        this.expiryDate = expiryDate;
        this.expiryDateString = expiryDateString;
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
        this.lastMatch = lastMatch;
    }

    public String getLastMatchTimeUTC() {
        return lastMatchTimeUTC;
    }

    public void setLastMatchTimeUTC(String lastMatchTimeUTC) {
        this.lastMatchTimeUTC = lastMatchTimeUTC;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getMarketPlace() {
        return marketPlace;
    }

    public void setMarketPlace(String marketPlace) {
        this.marketPlace = marketPlace;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getContractsTraded() {
        return contractsTraded;
    }

    public void setContractsTraded(int contractsTraded) {
        this.contractsTraded = contractsTraded;
    }

    public int getVolumeTraded() {
        return volumeTraded;
    }

    public void setVolumeTraded(int volumeTraded) {
        this.volumeTraded = volumeTraded;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public long getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(long expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getExpiryDateString() {
        return expiryDateString;
    }

    public void setExpiryDateString(String expiryDateString) {
        this.expiryDateString = expiryDateString;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }
}
