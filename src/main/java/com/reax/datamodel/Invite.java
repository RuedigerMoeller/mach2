package com.reax.datamodel;

import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.reallive.Record;
import org.nustaq.reallive.sys.annotations.KeyLen;

/**
 * Created by ruedi on 23.11.14.
 */
@GenRemote
@KeyLen(16)
public class Invite extends Record {

    String admin;    // done by
    String emails[]; // list of users invited (email addresses)
    int replied;     // number of users which replied and added an account
    long timeSent;
    int hoursValid;

    public Invite() {
    }

    public Invite(String admin, String[] emails, int replied, long timeSent, int hoursValid) {
        this.admin = admin;
        this.emails = emails;
        this.replied = replied;
        this.timeSent = timeSent;
        this.hoursValid = hoursValid;
    }

    public String getAdmin() {
        return admin;
    }

    public void setAdmin(String admin) {
        this.admin = admin;
    }

    public String[] getEmails() {
        return emails;
    }

    public void setEmails(String[] emails) {
        this.emails = emails;
    }

    public int getReplied() {
        return replied;
    }

    public void setReplied(int replied) {
        this.replied = replied;
    }

    public long getTimeSent() {
        return timeSent;
    }

    public void setTimeSent(long timeSent) {
        this.timeSent = timeSent;
    }

    public int getHoursValid() {
        return hoursValid;
    }

    public void setHoursValid(int hoursValid) {
        this.hoursValid = hoursValid;
    }
}
