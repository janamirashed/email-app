package com.mail.backend.service;

import com.mail.backend.repository.EmailRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

@Slf4j
@Component
public class TrashCleanupScheduler {

    @Autowired
    private EmailRepository emailRepository;

    // Runs cleanup for all users' trash folders daily at 2 AM
    // Deletes emails older than 30 days
    @Scheduled(cron = "0 0 2 * * ?") // runs a check 2 AM every day
    public void cleanupAllUsersTrash() {
        log.info("Starting trash cleanup job");

        try {
            // Get all user directories
            String msgRoot = emailRepository.getMsgRoot();
            Path rootPath = Paths.get(msgRoot);

            if (!Files.exists(rootPath)) {
                log.warn("Message root directory does not exist: {}", msgRoot);
                return;
            }

            // Iterate through each user folder
            try (Stream<Path> userPaths = Files.list(rootPath)) {
                userPaths.filter(Files::isDirectory)
                        .forEach(userPath -> {
                            String username = userPath.getFileName().toString();
                            try {
                                emailRepository.cleanupTrash(username);
                                log.info("Trash cleanup completed for user: {}", username);
                            } catch (IOException e) {
                                log.error("Failed to cleanup trash for user {}: {}", username, e.getMessage());
                            }
                        });
            }

            log.info("Trash cleanup job completed");

        } catch (IOException e) {
            log.error("Failed to perform trash cleanup: {}", e.getMessage(), e);
        }
    }
}