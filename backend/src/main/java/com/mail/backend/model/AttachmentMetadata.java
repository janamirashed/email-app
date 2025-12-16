package com.mail.backend.model;


import lombok.Data;

@Data
public class AttachmentMetadata {
    private String id;
    private String fileName;
    private MimeType mimeType;
    private String[] accessors;


    public AttachmentMetadata(String id, String fileName, MimeType mimeType, String[] accessors) {
        this.id = id;
        this.fileName = fileName;
        this.mimeType = mimeType;
        this.accessors = accessors;
    }
    public AttachmentMetadata() {}

}
