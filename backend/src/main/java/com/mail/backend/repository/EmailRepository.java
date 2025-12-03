package com.mail.backend.repository;

import com.mail.backend.model.Email;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Repository
public class EmailRepository {

    @Value("${mail.msg-root:data/emails}")
    private String msgRoot;

    private final ObjectMapper objectMapper;

    public EmailRepository() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    // Initialize directory structure
    private void createDirectories(String username) throws IOException {
        String userRoot = msgRoot + "/" + username;
        Files.createDirectories(Paths.get(userRoot, "inbox"));
        Files.createDirectories(Paths.get(userRoot, "sent"));
        Files.createDirectories(Paths.get(userRoot, "drafts"));
        Files.createDirectories(Paths.get(userRoot, "trash"));
    }

    // Save email to specific folder
    public void saveEmail(String username, Email email) throws IOException {
        createDirectories(username);
        String folderPath = msgRoot + "/" + username + "/" + email.getFolder();
        Files.createDirectories(Paths.get(folderPath));

        String emailJson = objectMapper.writerWithDefaultPrettyPrinter()
                .writeValueAsString(email);

        Path emailPath = Paths.get(folderPath, email.getMessageId() + ".json");
        Files.writeString(emailPath, emailJson, StandardOpenOption.CREATE,
                StandardOpenOption.TRUNCATE_EXISTING);

        log.info("Saved email {} to folder {}", email.getMessageId(), email.getFolder());
    }

    // Get email by ID and folder
    public Email getEmail(String username, String folder, String messageId) throws IOException {
        Path emailPath = Paths.get(msgRoot, username, folder, messageId + ".json");

        if (!Files.exists(emailPath)) {
            throw new IOException("Email not found: " + messageId);
        }

        String emailJson = Files.readString(emailPath);
        return objectMapper.readValue(emailJson, Email.class);
    }

    // List all emails in a folder
    public List<Email> listEmailsInFolder(String username, String folder) throws IOException {
        Path folderPath = Paths.get(msgRoot, username, folder);

        if (!Files.exists(folderPath)) {
            return new ArrayList<>();
        }

        try (Stream<Path> paths = Files.list(folderPath)) {
            return paths
                    .filter(p -> p.toString().endsWith(".json"))
                    .map(p -> {
                        try {
                            String json = Files.readString(p);
                            return objectMapper.readValue(json, Email.class);
                        } catch (IOException e) {
                            log.error("Error reading email: {}", p, e);
                            return null;
                        }
                    })
                    .filter(email -> email != null)
                    .collect(Collectors.toList());
        }
    }

    // Move email between folders
    public void moveEmail(String username, String messageId, String fromFolder,
                          String toFolder) throws IOException {
        Email email = getEmail(username, fromFolder, messageId);

        // Delete from old location
        deleteEmail(username, fromFolder, messageId);

        // Update folder and save to new location
        email.setFolder(toFolder);
        if (toFolder.equals("trash")) {
            email.setDeletedAt(LocalDateTime.now());
        }
        saveEmail(username, email);
    }

    // Delete email
    public void deleteEmail(String username, String folder, String messageId) throws IOException {
        Path emailPath = Paths.get(msgRoot, username, folder, messageId + ".json");
        Files.deleteIfExists(emailPath);
        log.info("Deleted email {} from folder {}", messageId, folder);
    }

    // Get all emails for a user (across all folders)
    public List<Email> getAllEmails(String username) throws IOException {
        List<Email> allEmails = new ArrayList<>();
        Path userRoot = Paths.get(msgRoot, username);

        if (!Files.exists(userRoot)) {
            return allEmails;
        }

        try (Stream<Path> folders = Files.list(userRoot)) {
            folders.filter(Files::isDirectory)
                    .forEach(folder -> {
                        try {
                            allEmails.addAll(listEmailsInFolder(username,
                                    folder.getFileName().toString()));
                        } catch (IOException e) {
                            log.error("Error listing folder: {}", folder, e);
                        }
                    });
        }

        return allEmails;
    }

    // Clean up trash (delete emails older than 30 days)
    public void cleanupTrash(String username) throws IOException {
        List<Email> trashEmails = listEmailsInFolder(username, "trash");
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        for (Email email : trashEmails) {
            if (email.getDeletedAt() != null &&
                    email.getDeletedAt().isBefore(thirtyDaysAgo)) {
                deleteEmail(username, "trash", email.getMessageId());
                log.info("Auto-deleted email {} (older than 30 days)", email.getMessageId());
            }
        }
    }

    // Check if custom folder exists
    public boolean folderExists(String username, String folderName) {
        Path folderPath = Paths.get(msgRoot, username, folderName);
        return Files.exists(folderPath);
    }

    // Create custom folder
    public void createFolder(String username, String folderName) throws IOException {
        Path folderPath = Paths.get(msgRoot, username, folderName);
        Files.createDirectories(folderPath);
        log.info("Created custom folder: {}", folderName);
    }

    // Delete custom folder
    public void deleteFolder(String username, String folderName) throws IOException {
        Path folderPath = Paths.get(msgRoot, username, folderName);

        // Move all emails to inbox before deleting folder
        List<Email> emails = listEmailsInFolder(username, folderName);
        for (Email email : emails) {
            moveEmail(username, email.getMessageId(), folderName, "inbox");
        }

        Files.deleteIfExists(folderPath);
        log.info("Deleted custom folder: {}", folderName);
    }

    // Rename custom folder
    public void renameFolder(String username, String oldName, String newName) throws IOException {
        Path oldPath = Paths.get(msgRoot, username, oldName);
        Path newPath = Paths.get(msgRoot, username, newName);

        Files.move(oldPath, newPath);

        // Update folder field in all emails
        List<Email> emails = listEmailsInFolder(username, newName);
        for (Email email : emails) {
            email.setFolder(newName);
            saveEmail(username, email);
        }

        log.info("Renamed folder {} to {}", oldName, newName);
    }
}
