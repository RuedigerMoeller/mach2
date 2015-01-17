package com.reax.datamodel;

import com.reax.matcher.RiskCalculator;
import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.reallive.RLTable;
import org.nustaq.reallive.Record;
import org.nustaq.reallive.sys.annotations.KeyLen;

import java.io.Serializable;
import java.util.HashMap;

/**
 * Created by ruedi on 08/01/15.
 *
 * tracks positions resulting from trades and open order positions of
 * a market. Results are propagated to realLive
 *
 */
@GenRemote
public class MarketPosition implements Serializable {

    String marketKey;
    String userId;
    HashMap<String,Integer> instrKeyToPosition;
    HashMap<String,Integer> instrKeyToOrderPosition;
    int risk;

    transient RLTable<Asset> assets;

    public MarketPosition(String marketKey, String userId) {
        this.marketKey = marketKey;
        this.userId = userId;
    }

    public int getRisk() {
        return risk;
    }

    public void setRisk(int risk) {
        this.risk = risk;
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

    public int addPosition(String instrKey, int toAdd, String assetName, RiskCalculator riskCalculator) {
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
            assets.$put(userId + "#" + instrKey, new Asset(newVal,userId,marketKey,instrKey, assetName, riskCalculator.calcRisk(newVal)), 0);
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

    /**
     * Assumption
     * 1 st value = N-1
     * 2          = N-2
     *
     * last       = 0
     */
    public void updateRiskInOrderedBet( RiskCalculator calc ) {
        if ( instrKeyToPosition == null || instrKeyToPosition.size() == 0) {
            risk = 0;
            return;
        }
        int res[] = {Integer.MAX_VALUE};
        // very simplified: for each shorted position, assume win.
        instrKeyToPosition.entrySet().forEach(entry -> {
            if (entry.getValue() < 0) {
//                res[0] = Math.max(entry.getValue() * (numberOfContracts-1) * 100, res[0]);
                res[0] = Math.min(calc.calcRisk(entry.getValue()), res[0]);
            }
        });
        if ( res[0] == Integer.MAX_VALUE ) {
            risk = 0;
        } else {
            risk = res[0];
        }
    }

}
