package com.example.backend.model;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@Data
public class Email {
    @JsonProperty("message_id")
    private String messageId;

    private String from;
    private List<String> to;
    private String subject;
    private Long date;
    private String body;

    @JsonProperty("attachments")
    private List<Attachment> attachments;

    @Data
    public static class Attachment {
        private String id;
        private String filename;
        private String mime;
        private Long size;
    }

    // Builder Pattern Implementation
    public static class EmailBuilder {
        private String messageId;
        private String from;
        private List<String> to;
        private String subject;
        private Long date;
        private String body;
        private List<Attachment> attachments;

        public EmailBuilder messageId(String messageId) {
            this.messageId = messageId;
            return this;
        }

        public EmailBuilder from(String from) {
            this.from = from;
            return this;
        }

        public EmailBuilder to(List<String> to) {
            this.to = to;
            return this;
        }

        public EmailBuilder subject(String subject) {
            this.subject = subject;
            return this;
        }

        public EmailBuilder date(Long date) {
            this.date = date;
            return this;
        }

        public EmailBuilder body(String body) {
            this.body = body;
            return this;
        }

        public EmailBuilder attachments(List<Attachment> attachments) {
            this.attachments = attachments;
            return this;
        }

        public Email build() {
            Email email = new Email();
            email.messageId = this.messageId;
            email.from = this.from;
            email.to = this.to;
            email.subject = this.subject;
            email.date = this.date;
            email.body = this.body;
            email.attachments = this.attachments;
            return email;
        }
    }

    public static EmailBuilder builder() {
        return new EmailBuilder();
    }
}

