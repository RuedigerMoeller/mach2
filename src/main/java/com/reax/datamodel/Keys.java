package com.reax.datamodel;

/**
 * Created by ruedi on 08/01/15.
 */
public class Keys {

    public static final int PURE_INSTRUMENT   = 16;
    public static final int PURE_MARKET_PLACE = 16;

    public static final int USER         = 16;
    public static final int MESSAGE      = 16;
    public static final int ORDER        = 16;
    public static final int SESSION      = 16;
    public static final int TRADE        = 16;
    public static final int INVITE       = USER+16;  // user+random vals
    public static final int MARKET_PLACE = USER+PURE_MARKET_PLACE+1;    // admin#mptemplatekey
    public static final int INSTRUMENT   = USER+16+1;                   // admin#instrkey
    public static final int ASSET        = USER+1+INSTRUMENT;           // user#instr
}
