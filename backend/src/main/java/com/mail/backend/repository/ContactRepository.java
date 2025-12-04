package com.mail.backend.repository;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.mail.backend.model.Contact;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;


@Slf4j
@Repository
public class ContactRepository {
    @Value("${mail.msg-root:data/emails}")
    private String dataRoot;
    private final ObjectMapper objectMapper;

    public ContactRepository(){
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    private Path getContactsPath(String username){
        return Paths.get(dataRoot, username, "contacts");
    }

    public void saveContact(String username, Contact contact)throws IOException {
        Path contactsDir = getContactsPath(username);
        Files.createDirectories(contactsDir);
        Path contactFile = getContactsPath(username).resolve(contact.getId() + ".json");
        String json = objectMapper.writeValueAsString(contact);
        Files.write(contactFile, json.getBytes());
        log.info("Saved contact {} saved for user {} ", contact.getId(), username);
    }


    public Contact getContact(String username, String contactId) throws IOException {
        Path contactFile = getContactsPath(username).resolve(contactId + ".json");
        if(!Files.exists(contactFile)){
            throw new IOException("Contact not found: " + contactId);
        }
        String json = Files.readString(contactFile);
        return objectMapper.readValue(json, Contact.class);
    }

    public List<Contact> listContacts(String username) throws IOException {
        Path contactsPath = getContactsPath(username);
        if(!Files.exists(contactsPath)){
            return new ArrayList<>();
        }

        try(Stream<Path> files = Files.list(contactsPath)){
            return files
                    .filter(p -> p.toString().endsWith(".json"))
                    .map(p -> {
                        try{
                            String json = Files.readString(p);
                            return objectMapper.readValue(json, Contact.class);
                        }catch(IOException e){
                            log.error("Failed to read contact file: {} ", p, e);
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .toList();
        }
    }


    public void deleteContact(String username, String contactId) throws IOException {
        Path contactFile = getContactsPath(username).resolve(contactId + ".json");
        if(!Files.exists(contactFile)){
            throw new IOException("Contact not found: " + contactId);
        }
        Files.delete(contactFile);
        log.info("Deleted contact {} saved for user {} ", contactId, username);
    }

    public boolean contactExists(String username, String contactId) throws IOException {
        Path contactFile = getContactsPath(username).resolve(contactId + ".json");
        return Files.exists(contactFile);
    }


}
