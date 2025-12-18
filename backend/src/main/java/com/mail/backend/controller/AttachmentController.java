package com.mail.backend.controller;

import com.mail.backend.model.AttachmentMetadata;
import com.mail.backend.model.MimeType;
import com.mail.backend.service.AttachmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.tomcat.util.http.parser.Authorization;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    @Autowired
    AttachmentService attachmentService;


    /**
     * used if we want to choose speed at the price of reliability.
     * we can have non-transactional uploads where the frontend sends the email and starts sending the files,
     * but we consider the data to be existent once it got acknowledged by the attachment service,
     * which follows the principle of optimistic response.
     */
    @GetMapping("/ids")
    public ResponseEntity<?> getValidAttachmentId(){
        Map<String,String> response = new HashMap<>();
        response.put("id",attachmentService.generateAttachmentId(true));

        return new ResponseEntity<>(response,HttpStatus.OK);
    }

    @GetMapping("/{attachment_id}")
    public ResponseEntity<?> getAttachment(@PathVariable("attachment_id") String attachmentId,
                                           HttpServletResponse response, Authentication authentication){
        try {
            String username = authentication.getName() + "@jaryn.com";

            AttachmentMetadata metadata = attachmentService.getAttachmentMetadata(attachmentId);
            InputStream inputStream = attachmentService.getAttachmentStream(attachmentId);

            MimeType type = metadata.getMimeType();
            String[] accessors = metadata.getAccessors();

            boolean hasAccess = false;
            for (String accessor : accessors){
                if (username.equals(accessor)) {
                    hasAccess = true;
                    break;
                }
            }
            if (!hasAccess){
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            response.setContentType(type.toString());

            OutputStream outputStream = response.getOutputStream();
            inputStream.transferTo(outputStream);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (IOException e) {
            System.err.println(e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("")
    public ResponseEntity<?> saveAttachment(@RequestParam(required = false) String id,
                                            @RequestParam String fileName,
                                            @RequestParam String accessors, HttpServletRequest request){
        try {
             String mimeStr= request.getHeader("Content-Type");
             String extStr = fileName.split("\\.")[1];

             MimeType mimeType = MimeType.fromValue(mimeStr);

             if (mimeType != MimeType.fromFileExtension(extStr)){
                 return new ResponseEntity<>(HttpStatus.CONFLICT);
             }

             AttachmentMetadata data;
             System.out.println(accessors);

             String [] accessorsArr = accessors.split("\\s*,\\s*");
             data = (id == null || id.trim().isEmpty())?
                     attachmentService.saveAttachment(mimeType, fileName, accessorsArr, request.getInputStream()):
                     attachmentService.saveAttachment(id, mimeType, fileName,accessorsArr, request.getInputStream());

            if (data == null){
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            return new ResponseEntity<>(data, HttpStatus.OK);
        } catch (IOException e) {
            System.err.println(e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{attachment_id}")
    public void  deleteAttachment(@PathVariable("attachment_id") String attachmentId) {

    }


}
