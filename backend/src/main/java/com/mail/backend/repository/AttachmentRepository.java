package com.mail.backend.repository;


import com.mail.backend.model.AttachmentMetadata;
import com.mail.backend.model.MimeType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import org.springframework.util.MimeTypeUtils;
import tools.jackson.databind.ObjectMapper;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;


@Slf4j
@Repository
public class AttachmentRepository {
    @Value("${mail.attachment-root:data/attachment}")
    private String attachmentRoot;

    @Autowired
    private ObjectMapper objectMapper;

    public Long saveAttachment(AttachmentMetadata data, InputStream in){
        long size = 0L;
        try{
            Files.createDirectories(Paths.get(attachmentRoot));
            Path dir =  Path.of(attachmentRoot, data.getId() + "." + MimeType.toFileExtension(data.getMimeType()));
            OutputStream out = new FileOutputStream(dir.toFile());
            size = in.transferTo(out);
        }catch(Exception e){
            System.err.println("Error saving attachment to file" + e.getMessage());
        }
        return size;
    }

    public InputStream getAttachmentStream(String attachmentId){

//        try{
//            try (var stream = Files.list(Path.of(attachmentRoot))) {
//                Optional<Path> match = stream
//                        .filter(p -> p.getFileName().toString().startsWith(attachmentId))
//                        .findFirst();
//
//                if (match.isPresent()) {
//                    return new FileInputStream(match.get().toFile());
//                } else {
//                    System.err.println("Attachment not found for ID: " + attachmentId);
//                    return null;
//                }
//            }
//        }
        try {
            String ext = MimeType.toFileExtension(getAttachmentMetadata(attachmentId).getMimeType());
            Path path = Paths.get(attachmentRoot, attachmentId + "." + ext);
            return new FileInputStream(path.toFile());
        }
        catch (Exception e) {
            System.err.println("Error getting attachment stream" + e.getMessage());
        }
        return null;
    }

    public void saveAttachmentMetadata(AttachmentMetadata data){
        try {
            Path path =  Path.of(attachmentRoot, data.getId() + ".json");
            String strData = objectMapper.writeValueAsString(data);
            Files.writeString(path, strData, StandardCharsets.UTF_8);
        }catch(Exception e){
            System.err.println("Error saving attachment metadata to file" + e.getMessage());
        }

    }

    public AttachmentMetadata getAttachmentMetadata(String attachmentId){
        Path dir =  Path.of(attachmentRoot, attachmentId + ".json");
        try {
            return objectMapper.readValue(dir.toFile(), AttachmentMetadata.class);
        } catch (Exception e) {
            System.err.println("Error getting attachment metadata" + e.getMessage());
        }
        return null;
    }

    public boolean attachmentExists(String attachment_id){
        try {
            Path path = Paths.get(attachmentRoot, attachment_id + ".json");
            return path.toFile().exists();
        }
        catch (Exception e) {
            System.err.println("Error getting attachment stream" + e.getMessage());
            return false;
        }

    }

}
