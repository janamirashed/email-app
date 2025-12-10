package com.mail.backend.dps.builder;

import com.mail.backend.model.AttachmentMetadata;
import com.mail.backend.model.Email;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class EmailBuilder {
    private String messageId;
    private String from;
    private List<String> to;
    private String subject;
    private String body;
    private LocalDateTime timestamp;
    private Integer priority;
    private boolean isRead;
    private boolean isStarred;
    private boolean isDraft;
    private String folder;
    private String originalFolder;
    private List<AttachmentMetadata> attachments;
    private LocalDateTime deletedAt;

    public EmailBuilder() {
        // Initialize collections
        this.to = new ArrayList<>();
        this.attachments = new ArrayList<>();

        // Set defaults
        this.timestamp = LocalDateTime.now();
        this.isRead = false;
        this.isStarred = false;
        this.isDraft = false;
        this.priority = 3; // Normal priority
    }

    public EmailBuilder messageId(String messageId) {
        this.messageId = messageId;
        return this;
    }

    public EmailBuilder from(String from) {
        this.from = from;
        return this;
    }

    public EmailBuilder to(String recipient) {
        this.to.add(recipient);
        return this;
    }

    public EmailBuilder to(List<String> recipients) {
        this.to.addAll(recipients);
        return this;
    }

    public EmailBuilder subject(String subject) {
        this.subject = subject;
        return this;
    }

    public EmailBuilder body(String body) {
        this.body = body;
        return this;
    }

    public EmailBuilder timestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
        return this;
    }

    public EmailBuilder priority(Integer priority) {
        if (priority < 1 || priority > 4) {
            throw new IllegalArgumentException("Priority must be between 1 (highest) and 4 (lowest)");
        }
        this.priority = priority;
        return this;
    }

    public EmailBuilder highPriority() {
        this.priority = 1;
        return this;
    }

    public EmailBuilder normalPriority() {
        this.priority = 3;
        return this;
    }

    public EmailBuilder lowPriority() {
        this.priority = 4;
        return this;
    }

    public EmailBuilder isRead(boolean isRead) {
        this.isRead = isRead;
        return this;
    }

    public EmailBuilder markAsRead() {
        this.isRead = true;
        return this;
    }

    public EmailBuilder markAsUnread() {
        this.isRead = false;
        return this;
    }

    public EmailBuilder isStarred(boolean isStarred) {
        this.isStarred = isStarred;
        return this;
    }

    public EmailBuilder star() {
        this.isStarred = true;
        return this;
    }

    public EmailBuilder unstar() {
        this.isStarred = false;
        return this;
    }

    public EmailBuilder isDraft(boolean isDraft) {
        this.isDraft = isDraft;
        return this;
    }

    public EmailBuilder asDraft() {
        this.isDraft = true;
        return this;
    }

    public EmailBuilder folder(String folder) {
        this.folder = folder;
        return this;
    }

    public EmailBuilder originalFolder(String originalFolder) {
        this.originalFolder = originalFolder;
        return this;
    }

    public EmailBuilder inInbox() {
        this.folder = "inbox";
        return this;
    }

    public EmailBuilder inSent() {
        this.folder = "sent";
        return this;
    }

    public EmailBuilder inDrafts() {
        this.folder = "drafts";
        this.isDraft = true;
        return this;
    }

    public EmailBuilder inTrash() {
        // Save the current folder as original before moving to trash
        if (this.originalFolder == null && this.folder != null && !this.folder.equals("trash")) {
            this.originalFolder = this.folder;
        }

        this.folder = "trash";
        this.deletedAt = LocalDateTime.now();
        return this;
    }

    public EmailBuilder attachment(AttachmentMetadata attachment) {
        this.attachments.add(attachment);
        return this;
    }

    public EmailBuilder attachments(List<AttachmentMetadata> attachments) {
        this.attachments.addAll(attachments);
        return this;
    }

    public EmailBuilder deletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
        return this;
    }

    // Validates the email before building
    private void validate() {
        if (subject == null || subject.trim().isEmpty()) {
            throw new IllegalStateException("Email subject cannot be empty");
        }
        if (to == null || to.isEmpty()) {
            throw new IllegalStateException("Email must have at least one recipient");
        }
        if (from == null || from.trim().isEmpty()) {
            throw new IllegalStateException("Email must have a sender");
        }
    }

    // Builds and returns the Email object
    // @return constructed Email instance
    public Email build() {
        validate();

        Email email = new Email();
        email.setMessageId(this.messageId);
        email.setFrom(this.from);
        email.setTo(this.to);
        email.setSubject(this.subject);
        email.setBody(this.body);
        email.setTimestamp(this.timestamp);
        email.setPriority(this.priority);
        email.setRead(this.isRead);
        email.setStarred(this.isStarred);
        email.setDraft(this.isDraft);
        email.setFolder(this.folder);
        email.setOriginalFolder(this.originalFolder);
        email.setAttachments(this.attachments);
        email.setDeletedAt(this.deletedAt);

        return email;
    }

    // Creates a builder from an existing Email
    public static EmailBuilder fromEmail(Email email) {
        EmailBuilder builder = new EmailBuilder();
        builder.messageId = email.getMessageId();
        builder.from = email.getFrom();
        builder.to = new ArrayList<>(email.getTo());
        builder.subject = email.getSubject();
        builder.body = email.getBody();
        builder.timestamp = email.getTimestamp();
        builder.priority = email.getPriority();
        builder.isRead = email.isRead();
        builder.isStarred = email.isStarred();
        builder.isDraft = email.isDraft();
        builder.folder = email.getFolder();
        builder.originalFolder = email.getOriginalFolder();
        builder.attachments = new ArrayList<>(email.getAttachments());
        builder.deletedAt = email.getDeletedAt();
        return builder;
    }
}