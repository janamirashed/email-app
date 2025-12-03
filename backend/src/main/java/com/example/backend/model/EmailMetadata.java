package com.example.backend.model;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@Data
public class EmailMetadata {
    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("message_id")
    private String messageId;

    private List<String> labels; // ["INBOX", "SCHOOL", "WORK"]

    @JsonProperty("is_read")
    private Boolean isRead = false;

    @JsonProperty("is_deleted")
    private Boolean isDeleted = false;

    @JsonProperty("is_starred")
    private Boolean isStarred = false;

    @JsonProperty("folder_id")
    private String folderId;

    @JsonProperty("created_at")
    private Long createdAt;

    @JsonProperty("updated_at")
    private Long updatedAt;

    public void addLabel(String label) {
        if (!this.labels.contains(label)) {
            this.labels.add(label);
        }
    }

    public void removeLabel(String label) {
        this.labels.remove(label);
    }

    public boolean hasLabel(String label) {
        return this.labels != null && this.labels.contains(label);
    }
}
