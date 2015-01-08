package com.reax.datamodel;

import org.nustaq.kontraktor.annotations.GenRemote;
import org.nustaq.reallive.Record;
import org.nustaq.reallive.sys.annotations.KeyLen;

import java.util.Date;

/**
 * Created by ruedi on 06/01/15.
 */
@GenRemote @KeyLen(Keys.MESSAGE)
public class Message extends Record {

    long msgTime;
    String msgTimeString;
    String messageText;
    // message target
    String adminId;
    String marketId;
    String userId;

    String senderId;

    public Message() {
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public long getMsgTime() {
        return msgTime;
    }

    public void setMsgTime(long msgTime) {
        this.msgTime = msgTime;
        this.msgTimeString = Trade.df.format(new Date(msgTime));
    }

    public String getAdminId() {
        return adminId;
    }

    public void setAdminId(String adminId) {
        this.adminId = adminId;
    }

    public String getMarketId() {
        return marketId;
    }

    public void setMarketId(String marketId) {
        this.marketId = marketId;
    }

    public String getMessageText() {
        return messageText;
    }

    public void setMessageText(String messageText) {
        this.messageText = messageText;
    }

}
