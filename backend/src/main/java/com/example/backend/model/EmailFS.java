package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDate;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class EmailFS {
    private String message_id;
    private String from;
    private String to;
    private String subject;
    private String body;
    private String date;
    private List<String> attachments;

    public EmailFS(String message_id, String from, String to, String subject, String body, String date,  List<String> attachments) {
        this.message_id = message_id;
        this.from = from;
        this.to = to;
        this.subject = subject;
        this.body = body;
        this.date = date;
        this.attachments = attachments;
    }

    public EmailFS() {}

    public String getMessage_id() {
        return message_id;
    }

    public void setMessage_id(String message_id) {
        this.message_id = message_id;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public List<String> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<String> attachments) {
        this.attachments = attachments;
    }

    @Override
    public String toString() {
        return "EmailFS{" +
                "message_id='" + message_id + '\'' +
                ", from='" + from + '\'' +
                ", to='" + to + '\'' +
                ", subject='" + subject + '\'' +
                ", body='" + body + '\'' +
                ", date='" + date + '\'' +
                '}';
    }
}
