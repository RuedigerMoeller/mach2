package com.reax.datamodel;

import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.reallive.RLTable;
import org.nustaq.reallive.Record;
import org.nustaq.reallive.sys.annotations.KeyLen;

import java.util.HashMap;

/**
 * Created by ruedi on 08/01/15.
 *
 * tracks positions resulting from trades and open order positions of
 * a market. Results are propragated to realLive
 */
@GenRemote
public class MarketPosition {

    String marketKey;
    String userId;
    HashMap<String,Integer> instrKeyToPosition;
    HashMap<String,Integer> instrKeyToOrderPosition;

    transient RLTable<Asset> assets;

    public MarketPosition(String marketKey, String userId) {
        this.marketKey = marketKey;
        this.userId = userId;
    }

    public RLTable<Asset> getAssets() {
        return assets;
    }

    public void setAssets(RLTable<Asset> assets) {
        this.assets = assets;
    }

    public String getMarketKey() {
        return marketKey;
    }

    public void setMarketKey(String marketKey) {
        this.marketKey = marketKey;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public HashMap<String, Integer> getInstrKeyToPosition() {
        return instrKeyToPosition;
    }

    public HashMap<String, Integer> getInstrKeyToOrderPosition() {
        return instrKeyToOrderPosition;
    }

    public void setInstrKeyToOrderPosition(HashMap<String, Integer> instrKeyToOrderPosition) {
        this.instrKeyToOrderPosition = instrKeyToOrderPosition;
    }

    public void setInstrKeyToPosition(HashMap<String, Integer> instrKeyToPosition) {
        this.instrKeyToPosition = instrKeyToPosition;
    }

    public int getMarketPosition(String instrKey) {
        if ( instrKeyToPosition == null ) {
            return 0;
        }
        Integer integer = instrKeyToPosition.get(instrKey);
        if ( integer == null ) {
            return 0;
        }
        return integer;
    }

    public void setMarketPosition(String instrKey, int pos) {
        if ( instrKeyToPosition == null ) {
            instrKeyToPosition = new HashMap<>();
        }
        instrKeyToPosition.put(instrKey, pos);
    }

    public int addPosition(String instrKey, int toAdd) {
        int newVal = 0;
        if ( instrKeyToPosition == null ) {
            instrKeyToPosition = new HashMap<>();
            newVal = toAdd;
        } else {
            Integer integer = instrKeyToPosition.get(instrKey);
            if (integer == null) {
                newVal = toAdd;
            } else {
                newVal = toAdd + integer;
            }
        }
        if ( newVal == 0 ) {
            assets.$remove(userId+"#"+instrKey,0);
        } else {
            assets.$put(userId + "#" + instrKey, new Asset(newVal,userId,marketKey,instrKey), 0);
        }
        instrKeyToPosition.put(instrKey, newVal);
        return newVal;
    }


    public int getOrderPosition(String instrKey) {
        if ( instrKeyToOrderPosition == null ) {
            return 0;
        }
        Integer integer = instrKeyToOrderPosition.get(instrKey);
        if ( integer == null ) {
            return 0;
        }
        return integer;
    }

    public void setOrderPosition(String instrKey, int pos) {
        if ( instrKeyToOrderPosition == null ) {
            instrKeyToOrderPosition = new HashMap<>();
        }
        instrKeyToOrderPosition.put(instrKey, pos);
    }

    public int addOrderPosition(String instrKey, int toAdd) {
        int newVal = 0;
        if ( instrKeyToOrderPosition == null ) {
            instrKeyToOrderPosition = new HashMap<>();
            newVal = toAdd;
        } else {
            Integer integer = instrKeyToOrderPosition.get(instrKey);
            if (integer == null) {
                newVal = toAdd;
            } else {
                newVal = toAdd + integer;
            }
        }
        instrKeyToOrderPosition.put(instrKey,newVal);
        return newVal;
    }

}
