package com.mail.backend.controller;

import com.mail.backend.model.AttachmentMetadata;
import com.mail.backend.model.MimeType;
import com.mail.backend.service.AttachmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/attachments")
@CrossOrigin(origins = "http://localhost:4200/")
public class AttachmentController {

    @Autowired
    AttachmentService attachmentService;

    @GetMapping("/ids")
    public ResponseEntity<?> getValidAttachmentId(){
        Map<String,String> response = new HashMap<>();
        response.put("id",attachmentService.generateAttachmentId());
        return new ResponseEntity<>(response,HttpStatus.OK);
    }

    @GetMapping("/{attachment_id}")
    public ResponseEntity<?> getAttachment(@PathVariable("attachment_id") String attachmentId, HttpServletResponse response){
        try {
            InputStream inputStream = attachmentService.getAttachmentStream(attachmentId);
            MimeType type = attachmentService.getAttachmentMetadata(attachmentId).getMimeType();
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
    public ResponseEntity<?>  saveAttachment(@RequestParam String id, @RequestParam MimeType mimeType, @RequestParam String fileName, HttpServletRequest file){
        try {
            if (attachmentService.saveAttachment(id, mimeType, fileName, file.getInputStream()) == null){
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (IOException e) {
            System.err.println(e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{attachment_id}")
    public void  deleteAttachment(@PathVariable("attachment_id") String attachmentId) {

    }


}
