package com.reax;

import org.nustaq.kontraktor.Actor;

import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.util.Date;
import java.util.Properties;

/**
 * Created by ruedi on 23.11.14.
 */
public class Mailer extends Actor<Mailer> {

    public void $sendMail( String receiver, String subject, String content ) {
        try {
            Properties props = new Properties();

            props.put("mail.smtp.auth", "true");
		    props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.host", "smtp.gmail.com");
		    props.put("mail.smtp.port", "587");

            Session session = Session.getInstance(props);
            Message message = new MimeMessage(session);
            message.setFrom();
            message.setSubject(subject);
            message.setText(content);
            message.setRecipient(Message.RecipientType.TO, new InternetAddress(receiver,false));
            message.setSentDate(new Date());
            Transport.send(message, "reaxmailer@gmail.com","");
        } catch (NoSuchProviderException e) {
            e.printStackTrace();
        } catch (MessagingException e) {
            e.printStackTrace();
        }

    }

    public static void main(String arg[]) {
//        String proxyHost = "169.254.206.193";
//        String proxyPort = "8080";
//        Properties proxySet = System.getProperties();
//        proxySet.put("http.proxyPort",proxyPort);
//        proxySet.put("http.proxyHost",proxyHost);

        Mailer m = new Mailer();
        m.$sendMail("heiko@dowidat.de", "Hello", "This is content");
    }

}
