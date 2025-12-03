package com.example.backend.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AttachmentFS {

    private String attachment_id;

    public AttachmentFS(String attachment_id) {
        this.attachment_id = attachment_id;
    }
    public AttachmentFS() {}

    @Override
    public String toString() {
        return "AttachmentFS{" +
                "attachment_id='" + attachment_id + '\'' +
                '}';
    }
}
