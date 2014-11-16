package com.reax.datamodel;

import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.reallive.Record;

/**
 * Created by ruedi on 04.08.2014.
 */
@GenRemote
public class MarketPlace extends Record {

    String templateId; // the recId it was derived from
    String admin;
    String description;

    public String getAdmin() {
        return admin;
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
}
