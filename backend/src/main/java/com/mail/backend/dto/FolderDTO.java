package com.mail.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

// DTO for transferring folder data to frontend
@Data
public class FolderDTO {
    private String id;
    private String name;
    private String type;
    private Integer emailCount;
    private Integer unreadCount;
    private boolean editable;
    private boolean shared;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}