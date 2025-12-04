package com.mail.backend.service;

import com.mail.backend.model.AttachmentMetadata;
import com.mail.backend.model.MimeType;
import com.mail.backend.repository.AttachmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class AttachmentService {

    @Autowired
    AttachmentRepository attachmentRepository;

    public AttachmentMetadata saveAttachment(MimeType mimeType, String fileName, InputStream inputStream) {
        /**
         * returns the updated metadata having the size in bytes and the assigned attachment_id
         */
        //any validation or checking logic and then delegates to the repository
        AttachmentMetadata attachmentMetadata = new AttachmentMetadata();

        attachmentMetadata.setId(UUID.randomUUID().toString());
        attachmentMetadata.setFileName(fileName);
        attachmentMetadata.setMimeType(mimeType);
        Long size = attachmentRepository.saveAttachment(attachmentMetadata, inputStream);
        attachmentMetadata.setSize(size);



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


}
