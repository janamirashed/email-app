package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
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
