package com.example.backend.model;

public class AttachmentFS {

    private String attachment_id;

    public AttachmentFS(String attachment_id) {
        this.attachment_id = attachment_id;
    }
    public AttachmentFS() {}

    public String getAttachment_id() {
        return attachment_id;
    }

    public void setAttachment_id(String attachment_id) {
        this.attachment_id = attachment_id;
    }

    @Override
    public String toString() {
        return "AttachmentFS{" +
                "attachment_id='" + attachment_id + '\'' +
                '}';
    }
}
