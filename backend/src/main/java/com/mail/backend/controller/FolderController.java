package com.mail.backend.controller;

import com.mail.backend.model.Folder;
import com.mail.backend.service.FolderService;
import com.mail.backend.repository.EmailRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// REST API for custom folder operations
@Slf4j
@RestController
@RequestMapping("/api/folders")
@CrossOrigin(origins = "http://localhost:4200")
public class FolderController {

    @Autowired
    private FolderService folderService;

    @Autowired
    private EmailRepository emailRepository;

    private static final List<String> SYSTEM_FOLDERS =
            Arrays.asList("inbox", "sent", "drafts", "trash");

    // Get current user from authentication
    private String getCurrentUsername(Authentication authentication) {
        return authentication.getName();
    }


    // POST /api/folders - Create new custom folder
    @PostMapping
    public ResponseEntity<?> createFolder(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String username = getCurrentUsername(authentication);
            String folderName = request.get("name");

            Folder folder = folderService.createCustomFolder(username, folderName);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Folder created successfully");
            response.put("folder", folder);

            log.info("Custom folder created: {} by user: {}", folderName, username);
            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            log.error("Failed to create folder: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to create folder");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // PUT /api/folders/{folderName} - Rename custom folder
    @PutMapping("/{folderName}")
    public ResponseEntity<?> renameFolder(
            @PathVariable String folderName,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String username = getCurrentUsername(authentication);
            String newName = request.get("newName");

            // Prevent renaming system folders
            if (SYSTEM_FOLDERS.contains(folderName.toLowerCase())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Cannot rename system folder: " + folderName);
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }

            // Use repository to rename
            emailRepository.renameFolder(username, folderName, newName);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Folder renamed successfully");

            log.info("Folder renamed from {} to {} by user: {}", folderName, newName, username);
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            log.error("Failed to rename folder: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to rename folder");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // DELETE /api/folders/{folderName} - Delete custom folder
    @DeleteMapping("/{folderName}")
    public ResponseEntity<?> deleteFolder(
            @PathVariable String folderName,
            Authentication authentication) {
        try {
            String username = getCurrentUsername(authentication);

            // Prevent deleting system folders
            if (SYSTEM_FOLDERS.contains(folderName.toLowerCase())) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Cannot delete system folder: " + folderName);
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }

            // Use repository to delete
            emailRepository.deleteFolder(username, folderName);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Folder deleted successfully");

            log.info("Folder deleted: {} by user: {}", folderName, username);
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            log.error("Failed to delete folder: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to delete folder");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get All Folders
    @GetMapping
    public ResponseEntity<?> getAllFolders(Authentication authentication) {
        try {
            String username = getCurrentUsername(authentication);
            List<Folder> folders = folderService.getAllFolders(username);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("totalFolders", folders.size());
            response.put("folders", folders);

            log.info("Retrieved {} folders for user: {}", folders.size(), username);
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            log.error("Failed to get folders: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to retrieve folders");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}