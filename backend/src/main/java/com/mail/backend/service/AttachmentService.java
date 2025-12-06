package com.mail.backend.service;

import com.mail.backend.model.AttachmentMetadata;
import com.mail.backend.model.MimeType;
import com.mail.backend.repository.AttachmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AttachmentService {

    @Autowired
    AttachmentRepository attachmentRepository;
    Map<String, Date> generatedIds;
    Set<String> acknowledged;

    public AttachmentService() {
        this.generatedIds = new ConcurrentHashMap<>();
        this.acknowledged = new HashSet<>();
    }

    public AttachmentMetadata saveAttachment(String id, MimeType mimeType, String fileName, InputStream inputStream) {
        /**
         * returns the updated metadata having the size in bytes and the assigned attachment_id
         */
        //any validation or checking logic and then delegates to the repository
        if (!isValidAttachmentId(id))
            return null;

        generatedIds.remove(id);
        this.acknowledged.add(id);
        //prevents reuse
        AttachmentMetadata attachmentMetadata = new AttachmentMetadata();

        attachmentMetadata.setId(id);
        attachmentMetadata.setFileName(fileName);
        attachmentMetadata.setMimeType(mimeType);
        Long size = attachmentRepository.saveAttachment(attachmentMetadata, inputStream);



        // automatically saves the metadata
        attachmentRepository.saveAttachmentMetadata(attachmentMetadata);
        return attachmentMetadata;
    }

    public InputStream getAttachmentStream(String attachment_id) {
        /**
         * returns the stream of the file from disk to be directly piped to the HTTPServletResponse Stream
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

    public String generateAttachmentId(){
        /**
         * generates and returns a UUID and tracks it's issuing time to later check for validity
         */
        String uuid = UUID.randomUUID().toString();
        generatedIds.put(uuid, new Date());
        return uuid;
    }

    public boolean isValidAttachmentId(String id){
        /**
         * checks if the attachment id was generated and that it was generated less than 5 minutes ago as a security measure
         */
        return generatedIds.containsKey(id) && (new Date().getTime() - generatedIds.get(id).getTime() <= 60 * 1e3 * 30);
    }

    public boolean isAcknowledged(String attachment_id){
        /**
         * be careful that for this version once this method is called the acknowledgement of this id is reset (as if it's not acknowledged)
         * as a way to clean up the acknowledgement set on check.
         */
        if (acknowledged.contains(attachment_id)){
            acknowledged.remove(attachment_id);
            return true;
        }
        return false;
    }


}
