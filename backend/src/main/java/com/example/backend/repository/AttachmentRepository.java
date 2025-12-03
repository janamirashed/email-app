package com.example.backend.repository;

import com.example.backend.model.AttachmentFS;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;



@Repository
public class AttachmentRepository {

    @Value("${mail.attachment-root}")
    private String attachmentRoot;

    public void putAttachment(AttachmentFS attachment) throws IOException {
        String attachmentJson = new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(attachment);
        Files.writeString(Path.of(attachmentRoot, attachment.getAttachment_id() + ".json"), attachmentJson, StandardOpenOption.CREATE);
    }

    public AttachmentFS getAttachment(String attachment_id) throws IOException {
        String emailJson = Files.readString(Path.of(attachmentRoot , attachment_id + ".json"));
        return new ObjectMapper().readValue(emailJson, AttachmentFS.class);
    }


}
