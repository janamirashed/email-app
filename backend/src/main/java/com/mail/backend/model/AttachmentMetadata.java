package com.mail.backend.model;


import lombok.Data;

@Data
public class AttachmentMetadata {
    private String id;
    private String fileName;
    private MimeType mimeType;
    private Long size;
//    private String b64Data;
    public AttachmentMetadata(String id, String fileName, MimeType mimeType, String b64Data, Long fileSize) {
        this.id = id;
        this.fileName = fileName;
        this.mimeType = mimeType;
        this.size = fileSize;
//        this.b64Data = b64Data;
    }
    public AttachmentMetadata() {}

}
