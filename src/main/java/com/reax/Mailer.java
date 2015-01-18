package com.reax;

import org.nustaq.kontraktor.Actor;
import org.nustaq.kontraktor.Future;
import org.nustaq.kontraktor.Promise;
import org.nustaq.kson.Kson;

import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.io.File;
import java.util.Date;
import java.util.Properties;

/**
 * Created by ruedi on 23.11.14.
 */
public class Mailer extends Actor<Mailer> {

    public Future<Boolean> $sendMail( String receiver, String subject, String content ) {
        try {
            MailSettings set = (MailSettings) new Kson().map(MailSettings.class).readObject(new File("./mail.kson"));

            Properties props = new Properties();
            props.put("mail.smtp.auth", set.getSmtpAuth() );
            props.put("mail.smtp.starttls.enable", set.getStartTls());
            props.put("mail.smtp.host", set.getSmtpHost());
            props.put("mail.smtp.port", set.getSmtpPort());

            Session session = Session.getInstance(props);
            Message message = new MimeMessage(session);
            message.setFrom();
            message.setSubject(subject);
            message.setText(content);
            message.setRecipient(Message.RecipientType.TO, new InternetAddress(receiver,false));
            message.setSentDate(new Date());
            Transport.send(message, set.getUser(),set.getPassword());
            return new Promise<>(true);
        } catch (Exception e) {
            e.printStackTrace();
            return new Promise<>(false,e);
        }
    }

    public static void main(String arg[]) {
//        String proxyHost = "169.254.206.193";
//        String proxyPort = "8080";
//        Properties proxySet = System.getProperties();
//        proxySet.put("http.proxyPort",proxyPort);
//        proxySet.put("http.proxyHost",proxyHost);

        Mailer m = new Mailer();
        m.$sendMail("moru0011@gmail.com", "Hello", "This is content");
//        m.$sendMail("heiko@dowidat.de", "Hello", "This is content");
    }

}
