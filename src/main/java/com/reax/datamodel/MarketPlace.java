package com.reax.datamodel;

import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.reallive.Record;
import org.nustaq.reallive.sys.annotations.KeyLen;

/**
 * Created by ruedi on 04.08.2014.
 */
@GenRemote @KeyLen(Keys.MARKET_PLACE)
public class MarketPlace extends Record {

    static final int ORDERED_BET = 1;

    String templateId; // the recId it was derived from
    String admin;
    String description;
    String longDescription;
    String img = "marketPlace.jpg";

    // risk parameters
    int numberOfInstruments;
    int riskMethod = ORDERED_BET;

    public String getAdmin() {
        return admin;
    }

    public String getLongDescription() {
        return longDescription;
    }

    public void setLongDescription(String longDescription) {
        this.longDescription = longDescription;
    }

    public String getImg() {
        return img;
    }

    public void setImg(String img) {
        this.img = img;
    }

    public String getTemplateId() {
        return templateId;
    }

    public void setTemplateId(String templateId) {
        this.templateId = templateId;
    }

    public void setAdmin(String admin) {
        this.admin = admin;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getNumberOfInstruments() {
        return numberOfInstruments;
    }

    public void setNumberOfInstruments(int numberOfInstruments) {
        this.numberOfInstruments = numberOfInstruments;
    }

    public int getRiskMethod() {
        return riskMethod;
    }

    public void setRiskMethod(int riskMethod) {
        this.riskMethod = riskMethod;
    }
}
