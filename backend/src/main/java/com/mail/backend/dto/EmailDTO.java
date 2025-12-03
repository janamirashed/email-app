package com.mail.backend.dto;

import com.mail.backend.model.Attachment;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class EmailDTO {
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
    private List<Attachment> attachments;
}
