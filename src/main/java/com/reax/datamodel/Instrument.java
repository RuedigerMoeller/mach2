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

    public Instrument() {
    }

    public Instrument(String key, String description, long expiryDate, String expiryDateString) {
        super(key);
        this.description = description;
        this.expiryDate = expiryDate;
        this.expiryDateString = expiryDateString;
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
