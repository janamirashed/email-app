package com.mail.backend.service;

import com.mail.backend.dps.factory.CustomFolderFactory;
import com.mail.backend.model.Email;
import com.mail.backend.model.Folder;
import com.mail.backend.repository.EmailRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

// Folder Service - Manages custom folder operations
@Slf4j
@Service
public class FolderService {

    @Autowired
    private EmailRepository emailRepository;

    private final CustomFolderFactory folderFactory = new CustomFolderFactory();

    private static final List<String> SYSTEM_FOLDERS =
            Arrays.asList("inbox", "sent", "drafts", "trash");

    // Create custom folder using factory pattern
    public Folder createCustomFolder(String username, String folderName) throws IOException {
        if (emailRepository.folderExists(username, folderName)) {
            throw new IllegalArgumentException("Folder already exists: " + folderName);
        }

        if (SYSTEM_FOLDERS.contains(folderName.toLowerCase())) {
            throw new IllegalArgumentException("Cannot use reserved folder name: " + folderName);
        }

        // Factory validates folder name and creates metadata
        Folder folder = folderFactory.createFolder(folderName);
        emailRepository.createFolder(username, folderName);

        log.info("Custom folder created: {} for user: {}", folderName, username);
        return folder;
    }

    // Get All Folders (System & Custom)
    public List<Folder> getAllFolders(String username) throws IOException {
        List<Folder> folders = new ArrayList<>();

        // Add system folders
        for (String folderName : SYSTEM_FOLDERS) {
            Folder folder = new Folder();
            folder.setName(folderName);
            folder.setType("SYSTEM");
            folder.setEditable(false);

            // Count emails in system folder
            try {
                List<Email> emails = emailRepository.listEmailsInFolder(username, folderName);
                folder.setEmailCount(emails.size());
                folder.setUnreadCount((int) emails.stream()
                        .filter(email -> !email.isRead())
                        .count());
            } catch (IOException e) {
                log.warn("Could not count emails in folder: {}", folderName);
                folder.setEmailCount(0);
                folder.setUnreadCount(0);
            }

            folders.add(folder);
        }

        // Add custom folders
        Path userRoot = Paths.get(emailRepository.getMsgRoot(), username);
        if (Files.exists(userRoot)) {
            try (Stream<Path> paths = Files.list(userRoot)) {
                paths.filter(Files::isDirectory)
                        .forEach(folderPath -> {
                            String folderName = folderPath.getFileName().toString();

                            // Skip system folders (already added)
                            if (SYSTEM_FOLDERS.contains(folderName.toLowerCase())) {
                                return;
                            }

                            Folder folder = new Folder();
                            folder.setName(folderName);
                            folder.setType("CUSTOM");
                            folder.setEditable(true);

                            // Count emails in custom folder
                            try {
                                List<Email> emails = emailRepository.listEmailsInFolder(username, folderName);
                                folder.setEmailCount(emails.size());
                                folder.setUnreadCount((int) emails.stream()
                                        .filter(email -> !email.isRead())
                                        .count());
                            } catch (IOException e) {
                                log.warn("Could not count emails in custom folder: {}", folderName);
                                folder.setEmailCount(0);
                                folder.setUnreadCount(0);
                            }

                            folders.add(folder);
                        });
            }
        }

        log.info("Retrieved {} folders for user: {}", folders.size(), username);
        return folders;
    }
}