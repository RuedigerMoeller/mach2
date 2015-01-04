package com.reax.datamodel;

import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.reallive.Record;
import org.nustaq.reallive.sys.annotations.KeyLen;

import java.util.Date;

/**
 * Created by ruedi on 23.11.14.
 */
@GenRemote
@KeyLen(32)
public class Invite extends Record {

    String admin;    // done by
    String email; // email of user invited
    String repliedUserName;     // name of user in case replied
    String timeSentString;
    long timeSent;
    int hoursValid;
    boolean mailSent = false;

    public Invite() {
    }

    public Invite(String admin, String email, String repliedUserName, long timeSent, int hoursValid) {
        this.admin = admin;
        this.email = email;
        this.repliedUserName = repliedUserName;
        setTimeSent(timeSent);
        this.hoursValid = hoursValid;
    }

    public boolean isMailSent() {
        return mailSent;
    }

    public void setMailSent(boolean mailSent) {
        this.mailSent = mailSent;
    }

    public String getAdmin() {
        return admin;
    }

    public void setAdmin(String admin) {
        this.admin = admin;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRepliedUserName() {
        return repliedUserName;
    }

    public void setRepliedUserName(String repliedUserName) {
        this.repliedUserName = repliedUserName;
    }

    public long getTimeSent() {
        return timeSent;
    }

    public void setTimeSent(long timeSent) {
        this.timeSent = timeSent;
        timeSentString = Trade.df.format(new Date(timeSent));
    }

    public int getHoursValid() {
        return hoursValid;
    }

    public void setHoursValid(int hoursValid) {
        this.hoursValid = hoursValid;
    }

    public String getTimeSentString() {
        return timeSentString;
    }

    public void setTimeSentString(String timeSentString) {
        this.timeSentString = timeSentString;
    }
}
