package com.mail.backend.service;

import com.mail.backend.dps.factory.CustomFolderFactory;
import com.mail.backend.model.Folder;
import com.mail.backend.repository.EmailRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

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
}