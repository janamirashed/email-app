package com.example.backend;

import com.example.backend.model.Attachment;
import com.example.backend.model.AttachmentFS;
import com.example.backend.model.EmailFS;
import com.example.backend.repository.AttachmentRepository;
import com.example.backend.repository.EmailRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) throws IOException {
        ConfigurableApplicationContext context = SpringApplication.run(BackendApplication.class, args);
        EmailRepository emailRepository = context.getBean(EmailRepository.class);
        AttachmentRepository attachmentRepository = context.getBean(AttachmentRepository.class);

        String dateString = new SimpleDateFormat("yyyy-MM-dd").format(new Date());

        AttachmentFS attachment = new AttachmentFS();
        attachment.setAttachment_id("56fa");

        List<String> attachment_ids = new ArrayList<>();
        attachment_ids.add("56fa");

        EmailFS email = new EmailFS(
                "2F34a",
                "nour.atawy2015@gmail.com",
                "yousef.walid@gmail.com",
                "test",
                "test body",
                dateString,
                attachment_ids);

        emailRepository.putEmail(email);
        attachmentRepository.putAttachment(attachment);
        System.out.println(emailRepository.getEmail(email.getMessage_id()));
        System.out.println(attachmentRepository.getAttachment(attachment.getAttachment_id()));
    }

}
