package com.reax.datamodel;

import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.reallive.RLTable;
import org.nustaq.reallive.Record;
import org.nustaq.reallive.sys.annotations.Align;
import org.nustaq.reallive.sys.annotations.Description;
import org.nustaq.reallive.sys.annotations.KeyLen;
import org.nustaq.reallive.sys.annotations.RenderStyle;

import java.util.HashMap;
import java.util.Iterator;

/**
 * Created by ruedi on 25.10.2014.
 */
@GenRemote @Description("refers to a user. Can have different roles.") @KeyLen(Keys.USER)
public class User extends Record {

    String adminName; // refers to owner in case
    String name;
    String pwd;
    long lastLogin;
    long creationTime;
    String email;

    @RenderStyle("Text15")
    String motto;
    @RenderStyle("Price") @Align("right")
    int cash;
    @RenderStyle("Price") @Align("right")
    int risk;

    UserRole role = UserRole.USER;

    HashMap<String,MarketPosition> positions;

    public MarketPosition getPos( String marketId, RLTable<Asset> assets ) {
        if ( positions == null )
            positions = new HashMap<>();
        MarketPosition marketPosition = positions.get(marketId);
        if ( marketPosition == null ) {
            marketPosition = new MarketPosition(marketId,name);
            positions.put(marketId,marketPosition);
        }
        marketPosition.setAssets(assets);
        return marketPosition;
    }

    public User init(String name, String pwd, long lastLogin, long creationTime, UserRole role, String email) {
        this.name = name;
        this.pwd = pwd;
        this.lastLogin = lastLogin;
        this.creationTime = creationTime;
        this.role = role;
        this.email = email;
        return this;
    }

    public int getCash() {
        return cash;
    }

    public void setCash(int cash) {
        this.cash = cash;
    }

    public String getMotto() {
        return motto;
    }

    public void setMotto(String motto) {
        this.motto = motto;
    }

    public String getAdminName() {
        return adminName;
    }

    public void setAdminName(String adminName) {
        this.adminName = adminName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * assumption == recordKey !!!!
     * @return
     */
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPwd() {
        return pwd;
    }

    public void setPwd(String pwd) {
        this.pwd = pwd;
    }

    public long getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(long lastLogin) {
        this.lastLogin = lastLogin;
    }

    public long getCreationTime() {
        return creationTime;
    }

    public void setCreationTime(long creationTime) {
        this.creationTime = creationTime;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public int getRisk() {
        return risk;
    }

    public void setRisk(int risk) {
        this.risk = risk;
    }

    public void updateRisk() {
        if ( positions == null || positions.size() == 0)
            risk = 0;
        int max = 0;
        for (Iterator<MarketPosition> iterator = positions.values().iterator(); iterator.hasNext(); ) {
            MarketPosition next = iterator.next();
            max = Math.max(next.getRisk(),max);
        }
        risk = max;
    }
}
