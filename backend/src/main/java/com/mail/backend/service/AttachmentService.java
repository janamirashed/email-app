package com.mail.backend.service;

import com.mail.backend.model.AttachmentMetadata;
import com.mail.backend.model.MimeType;
import com.mail.backend.repository.AttachmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AttachmentService {

    @Autowired
    AttachmentRepository attachmentRepository;
    Map<String, Date> generatedIds;
    Map<String, Date>  acknowledged;

    public AttachmentService() {
        this.generatedIds = new ConcurrentHashMap<>();
        this.acknowledged = new ConcurrentHashMap<>();
    }

    @Scheduled(cron = "0 */10 * * * *")
    private void cleanupIdTracker(){
        /**
         * to handle if a person generates too many ids and never uses them.
         * to avoid consuming more memory than needed
         */
        for(Map.Entry<String,Date> entry : this.generatedIds.entrySet()){
            if (entry.getValue().after(new Date()))
                continue;
            this.generatedIds.remove(entry.getKey());
        }
    }

    @Scheduled(cron = "0 */15 * * * *")
    private void cleanupAcknowledgement(){
        /**
         * to handle if a person generates too many ids and never uses them.
         * to avoid consuming more memory than needed
         */
        for(Map.Entry<String,Date> entry : this.generatedIds.entrySet()){
            if (entry.getValue().after(new Date()))
                continue;
            this.generatedIds.remove(entry.getKey());
        }
    }

    public AttachmentMetadata saveAttachment(String id, MimeType mimeType, String fileName, String[] accessors,  InputStream inputStream) {
        /**
         * used when we are taking the approach of non-transactional uploads, in which case the client requests the id first,
         * and then uploads with the same id in that case we track the generated ids,and consider acknowledgement before completing the upload.
         * returns the updated metadata and the assigned attachment_id
         */
        System.out.println("Non-Transactional attachment save");
        //any validation or checking logic and then delegates to the repository
        if (!isValidAttachmentId(id))
            return null;

        generatedIds.remove(id);
        long expirationTime = (long) (new Date().getTime() + 60*1e3*5);
        this.acknowledged.put(id, new Date(expirationTime));
        //prevents reuse
        AttachmentMetadata attachmentMetadata = new AttachmentMetadata();

        attachmentMetadata.setId(id);
        attachmentMetadata.setFileName(fileName);
        attachmentMetadata.setMimeType(mimeType);
        attachmentMetadata.setAccessors(accessors);
        Long size = attachmentRepository.saveAttachment(attachmentMetadata, inputStream);



        // automatically saves the metadata
        attachmentRepository.saveAttachmentMetadata(attachmentMetadata);
        return attachmentMetadata;
    }

    public AttachmentMetadata saveAttachment(MimeType mimeType, String fileName, String[] accessors, InputStream inputStream){

        /**
         * used when we are taking the approach of transactional uploads, in which case the client doesn't request the id prior to upload,
         * the client just uploads the file and waits for the upload completion.
         * returns the updated metadata and the generated attachment_id
         */
        System.out.println("Transactional attachment save");
        AttachmentMetadata attachmentMetadata = new AttachmentMetadata();
        String id = this.generateAttachmentId(false);
        attachmentMetadata.setId(id);
        attachmentMetadata.setFileName(fileName);
        attachmentMetadata.setMimeType(mimeType);
        attachmentMetadata.setAccessors(accessors);
        Long size = attachmentRepository.saveAttachment(attachmentMetadata, inputStream);

        if (size > 0){
            long expirationTime = (long) (new Date().getTime() + 60*1e3*5);
            this.acknowledged.put(id, new Date(expirationTime));
        }
        //acknowledged only after completion
        attachmentRepository.saveAttachmentMetadata(attachmentMetadata);
        return attachmentMetadata;
    }

    public InputStream getAttachmentStream(String attachment_id) {
        /*
          returns the stream of the file from disk to be directly piped to the HTTPServletResponse Stream
         */
        //any logic lies here
        InputStream inputStream = attachmentRepository.getAttachmentStream(attachment_id);
        return inputStream;
    }

    public AttachmentMetadata getAttachmentMetadata(String attachment_id){
        /**
         * returns an attachment's metadata given it's id
         */
        return attachmentRepository.getAttachmentMetadata(attachment_id);
    }

    public String generateAttachmentId(boolean track_id){
        /**
         * generates and returns a UUID and tracks it's expiration time to later check for validity
         */
        String uuid = UUID.randomUUID().toString();
        if (track_id){
            long expirationTime = (long) (new Date().getTime() + 60*1e3*5);
            generatedIds.put(uuid, new Date(expirationTime));
        }
        return uuid;
    }

    public boolean isValidAttachmentId(String id){
        /**
         * checks if the attachment id was generated and that it was generated less than 5 minutes ago as a security measure
         */
        return generatedIds.containsKey(id) && (new Date().before(generatedIds.get(id)));
    }

    public boolean isAcknowledged(String attachment_id){
        /*
         * as a way to clean up the acknowledgement set on check.
         */
        return acknowledged.containsKey(attachment_id) || attachmentRepository.attachmentExists(attachment_id);
    }


}
