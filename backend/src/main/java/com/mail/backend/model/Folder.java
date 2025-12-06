package com.mail.backend.model;

import lombok.Data;
import java.time.LocalDateTime;

// Folder model representing a custom user folder
@Data
public class Folder {
    private String id;
    private String name;
    private String type; // CUSTOM, SYSTEM
    private Integer emailCount;
    private Integer unreadCount;
    private boolean editable;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Folder() {
        this.emailCount = 0;
        this.unreadCount = 0;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.editable = true;
        this.id = "folder-" + java.util.UUID.randomUUID().toString().substring(0, 8);
    }

    // Increment email count
    public void addEmail() {
        this.emailCount++;
        this.updatedAt = LocalDateTime.now();
    }

    // Decrement email count
    public void removeEmail() {
        if (this.emailCount > 0) {
            this.emailCount--;
        }
        this.updatedAt = LocalDateTime.now();
    }
}
