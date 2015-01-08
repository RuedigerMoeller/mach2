package com.reax.datamodel;

import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.reallive.Record;
import org.nustaq.reallive.sys.annotations.KeyLen;

import java.util.Date;

/**
 * Created by ruedi on 23.11.14.
 */
@GenRemote
@KeyLen(Keys.INVITE)
public class Invite extends Record {

    String admin;    // done by
    String email;    // email of user invited
    String user;     // name of user (only in case of registration)
    String pwd;      // pwd in case of registration
    String timeSentString;
    long timeSent;
    int hoursValid;
    boolean mailSent = false;

    public Invite() {
    }

    public Invite(String admin, String email, String user, long timeSent, int hoursValid) {
        this.admin = admin;
        this.email = email;
        this.user = user;
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

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String getPwd() {
        return pwd;
    }

    public void setPwd(String pwd) {
        this.pwd = pwd;
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
