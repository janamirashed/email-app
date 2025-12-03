package com.example.backend.repository;

import com.example.backend.model.EmailFS;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;



@Repository
public class EmailRepository {


    @Value("${mail.msg-root}")
    private String msgRoot;

    public void putEmail(EmailFS email) throws IOException {
        String emailJson = new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(email);
        Files.writeString(Path.of(msgRoot, email.getMessage_id() + ".json"), emailJson, StandardOpenOption.CREATE);
    }

    public EmailFS getEmail(String message_id) throws IOException {
        String emailJson = Files.readString(Path.of(msgRoot , message_id + ".json"));
        return new ObjectMapper().readValue(emailJson, EmailFS.class);
    }


}
