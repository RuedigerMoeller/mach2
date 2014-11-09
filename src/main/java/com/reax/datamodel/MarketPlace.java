package com.reax.datamodel;

import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.reallive.Record;

/**
 * Created by ruedi on 04.08.2014.
 */
@GenRemote
public class MarketPlace extends Record {

    String admin;
    String marketPlaceName;

    public String getAdmin() {
        return admin;
    }

    public void setAdmin(String admin) {
        this.admin = admin;
    }

    public String getMarketPlaceName() {
        return marketPlaceName;
    }

    public void setMarketPlaceName(String marketPlaceName) {
        this.marketPlaceName = marketPlaceName;
    }
}
