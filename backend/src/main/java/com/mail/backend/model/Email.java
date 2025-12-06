package com.mail.backend.model;

import com.mail.backend.dps.builder.EmailBuilder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class Email {
    private String messageId;
    private String from;
    private List<String> to;
    private String subject;
    private String body;
    private LocalDateTime timestamp;
    private Integer priority; // 1 (Highest) to 4 (Lowest)
    private boolean isRead;
    private boolean isStarred;
    private boolean isDraft;
    private String folder; // inbox, sent, drafts, trash, or custom folder name
    private List<AttachmentMetadata> attachments;
    private LocalDateTime deletedAt; // For trash auto-delete after 30 days

    public Email() {
        this.to = new ArrayList<>();
        this.attachments = new ArrayList<>();
        this.timestamp = LocalDateTime.now();
        this.isRead = false;
        this.isStarred = false;
        this.isDraft = false;
        this.priority = 3; // Default: Normal priority
    }

    // Creates a new EmailBuilder instance
    // @return EmailBuilder for fluent email construction
    public static EmailBuilder builder() {
        return new EmailBuilder();
    }

    // Creates a builder from this email instance (for modifications)
    // @return EmailBuilder initialized with this email's data
    public EmailBuilder toBuilder() {
        return EmailBuilder.fromEmail(this);
    }
}