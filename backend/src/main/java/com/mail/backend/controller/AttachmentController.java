package com.mail.backend.controller;

import com.mail.backend.model.AttachmentMetadata;
import com.mail.backend.model.MimeType;
import com.mail.backend.service.AttachmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

@RestController
@RequestMapping("/attachments")
public class AttachmentController {

    @Autowired
    AttachmentService attachmentService;

    @GetMapping("/{attachment_id}")
    public void getAttachment(@PathVariable("attachment_id") String attachmentId, HttpServletResponse response) throws IOException {
        try {
            InputStream inputStream = attachmentService.getAttachmentStream(attachmentId);
            MimeType type = attachmentService.getAttachmentMetadata(attachmentId).getMimeType();
            response.setContentType(type.toString());
            OutputStream outputStream = response.getOutputStream();
            inputStream.transferTo(outputStream);
        } catch (IOException e) {
            System.err.println(e.getMessage());
        }
    }

    @PutMapping("")
    public AttachmentMetadata saveAttachment(@RequestParam MimeType mimeType, @RequestParam String fileName, HttpServletRequest file) throws IOException {
        try {
            return attachmentService.saveAttachment(mimeType, fileName, file.getInputStream());
        } catch (IOException e) {
            System.err.println(e.getMessage());
        }
        return null;
    }

    @DeleteMapping("/{attachment_id}")
    public void  deleteAttachment(@PathVariable("attachment_id") String attachmentId) {

    }


}
