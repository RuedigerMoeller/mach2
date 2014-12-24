package com.reax;

import org.nustaq.kson.Kson;

import java.io.File;

/**
 * Created by ruedi on 24.12.2014.
 */
public class MailSettings {

    public static MailSettings load() {
        try {
            return (MailSettings) new Kson().map(MailSettings.class).readObject(new File("./mail.kson"));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    String appurl;
    String user;
    String password;

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getAppurl() {
        return appurl;
    }

    public void setAppurl(String appurl) {
        this.appurl = appurl;
    }
}
