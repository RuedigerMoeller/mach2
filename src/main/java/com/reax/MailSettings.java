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
    String smtpHost;
    String smtpPort;
    String smtpAuth;
    String startTls;


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

    public String getSmtpHost() {
        return smtpHost;
    }

    public void setSmtpHost(String smtpHost) {
        this.smtpHost = smtpHost;
    }

    public String getSmtpPort() {
        return smtpPort;
    }

    public void setSmtpPort(String smtpPort) {
        this.smtpPort = smtpPort;
    }

    public String getSmtpAuth() {
        return smtpAuth;
    }

    public void setSmtpAuth(String smtpAuth) {
        this.smtpAuth = smtpAuth;
    }

    public String getStartTls() {
        return startTls;
    }

    public void setStartTls(String startTls) {
        this.startTls = startTls;
    }
}
