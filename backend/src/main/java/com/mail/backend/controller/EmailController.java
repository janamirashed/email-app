package com.mail.backend.controller;

import com.mail.backend.model.AttachmentMetadata;
import com.mail.backend.model.Email;
import com.mail.backend.repository.EmailRepository;
import com.mail.backend.service.AttachmentService;
import com.mail.backend.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/email")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private AttachmentService attachmentService;

    // GET current user's username from JWT token
    private String getCurrentUsername(Authentication authentication) {
        return authentication.getName();
    }

    /**
     * SEND EMAIL
     * POST /api/email/send
     * Body: { "to": ["recipient@gmail.com"], "subject": "...", "body": "...", "priority": 2 }
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendEmail(@RequestBody Email email, Authentication authentication) {
        try {
            String username = getCurrentUsername(authentication);

            /**
             * ATTACHMENT CHECKS
             * to check the validity of the attachment id sent.. if it was acknowledged by the attachment service or not
             * */

            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to send email");

            for (AttachmentMetadata attachmentMetadata : email.getAttachments()) {
                if (attachmentMetadata.getFileName() == null)
                    return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);

                if (attachmentMetadata.getMimeType() == null)
                    return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);

                if (!attachmentService.isAcknowledged(attachmentMetadata.getId()))
                    //to check if this attachment was acknowledged by the attachment service through the endpoint
                    return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }
            // if not proceed normally


            String messageId = emailService.sendEmail(username, email);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("messageId", messageId);
            response.put("message", "Email sent successfully");

            log.info("Email {} sent successfully", messageId);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            log.error("Invalid email: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        } catch (IOException e) {
            log.error("Failed to send email: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to send email");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * SAVE DRAFT
     * POST /api/email/draft
     * Body: { "to": ["..."], "subject": "...", "body": "..." }
     */
    @PostMapping("/draft")
    public ResponseEntity<?> saveDraft(@RequestBody Email email, Authentication authentication) {
        try {
            String username = getCurrentUsername(authentication);
            /**
             * ATTACHMENT CHECKS
             * to check the validity of the attachment id sent.. if it was acknowledged by the attachment service or not
             * */

            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to send email");

            for (AttachmentMetadata attachmentMetadata : email.getAttachments()) {
                if (attachmentMetadata.getFileName() == null)
                    return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);

                if (attachmentMetadata.getMimeType() == null)
                    return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);

                if (!attachmentService.isAcknowledged(attachmentMetadata.getId()))
                    //to check if this attachment was acknowledged by the attachment service through the endpoint
                    return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }
            // if not proceed normally

            String messageId = emailService.saveDraft(username, email);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("messageId", messageId);
            response.put("message", "Draft saved successfully");

            log.info("Draft {} saved successfully", messageId);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IOException e) {
            log.error("Failed to save draft: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to save draft");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET INBOX - Paginated
     * GET /api/email/inbox?page=1&limit=20
     */
    @GetMapping("/inbox")
    public ResponseEntity<?> getInbox(
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            Authentication authentication) {
        try {
            String username = getCurrentUsername(authentication);
            Map<String, Object> emails = emailService.getInboxEmails(username, page, limit, sortBy);

            return new ResponseEntity<>(emails, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Failed to get inbox: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to get inbox");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET EMAILS FROM FOLDER
     * GET /api/email/folder/{folder}?page=1&limit=20
     */
    @GetMapping("/folder/{folder}")
    public ResponseEntity<?> getFolder(
            @PathVariable String folder,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            Authentication authentication) {
        try {
            String username = getCurrentUsername(authentication);
            Map<String, Object> emails = emailService.getEmailsInFolder(username, folder, page, limit, sortBy);

            return new ResponseEntity<>(emails, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Failed to get folder {}: {}", folder, e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to get folder: " + folder);
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET SINGLE EMAIL
     * GET /api/email/{messageId}
     */
    @GetMapping("/{messageId}")
    public ResponseEntity<?> getEmail(@PathVariable String messageId, Authentication authentication) {
        try {
            String username = getCurrentUsername(authentication);
            Email email = emailService.getEmail(username, messageId);

            // Mark as read automatically
            emailService.markAsRead(username, messageId);

            return new ResponseEntity<>(email, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Email not found: {}", messageId);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Email not found");
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * SEARCH EMAILS
     * GET /api/email/search?keyword=test&searchIn=all
     * searchIn: "subject", "body", "sender", "all"
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchEmails(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "all") String searchBy,
            @RequestParam(required = false) String sortBy,
            Authentication authentication) {
        try {
            String username = getCurrentUsername(authentication);
            List<Email> results = emailService.searchEmails(username, keyword, searchBy, sortBy);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("keyword", keyword);
            response.put("searchBy", searchBy);
            response.put("sortBy", sortBy);
            response.put("totalResults", results.size());
            response.put("results", results);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Search failed: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Search failed");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /**
     * GET STARRED EMAILS
     * GET /api/email/starred
     */
    @GetMapping("/starred")
    public ResponseEntity<?> getStarredEmails(
            @RequestParam(defaultValue = "date") String sortBy,
            Authentication authentication) {
        try {
            String username = getCurrentUsername(authentication);
            List<Email> emails = emailService.getStarredEmails(username, sortBy);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("totalStarred", emails.size());
            response.put("sortBy", sortBy);
            response.put("emails", emails);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Failed to get starred emails: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to get starred emails");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET UNREAD COUNT
     * GET /api/email/unread-count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        try {
            String username = getCurrentUsername(authentication);
            int count = emailService.getUnreadCount(username);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("unreadCount", count);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Failed to get unread count: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to get unread count");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /**
     * MARK AS READ
     * PUT /api/email/{messageId}/read
     */
    @PutMapping("/{messageId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String messageId, Authentication authentication) {
        try {
            String username = getCurrentUsername(authentication);
            emailService.markAsRead(username, messageId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Email marked as read");

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Failed to mark as read: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to mark as read");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * MARK AS UNREAD
     * PUT /api/email/{messageId}/unread
     */
    @PutMapping("/{messageId}/unread")
    public ResponseEntity<?> markAsUnread(@PathVariable String messageId, Authentication authentication) {
        try {
            String username = getCurrentUsername(authentication);
            emailService.markAsUnread(username, messageId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Email marked as unread");

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Failed to mark as unread: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to mark as unread");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * STAR EMAIL
     * PUT /api/email/{messageId}/star
     */
    @PutMapping("/{messageId}/star")
    public ResponseEntity<?> starEmail(@PathVariable String messageId, Authentication authentication) {
        try {
            String username = getCurrentUsername(authentication);
            emailService.starEmail(username, messageId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Email starred");

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Failed to star email: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to star email");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * UNSTAR EMAIL
     * PUT /api/email/{messageId}/unstar
     */
    @PutMapping("/{messageId}/unstar")
    public ResponseEntity<?> unstarEmail(@PathVariable String messageId, Authentication authentication) {
        try {
            String username = getCurrentUsername(authentication);
            emailService.unstarEmail(username, messageId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Email unstarred");

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Failed to unstar email: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to unstar email");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * MOVE EMAIL TO FOLDER
     * PUT /api/email/{messageId}/move?toFolder=work
     */
    @PutMapping("/{messageId}/move")
    public ResponseEntity<?> moveEmail(
            @PathVariable String messageId,
            @RequestParam String toFolder,
            Authentication authentication) {
        try {
            String username = getCurrentUsername(authentication);
            emailService.moveEmail(username, messageId, toFolder);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Email moved to " + toFolder);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Failed to move email: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to move email");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * SEND DRAFT
     * POST /api/email/{messageId}/send-draft
     */
    @PostMapping("/{messageId}/send-draft")
    public ResponseEntity<?> sendDraft(@PathVariable String messageId, Authentication authentication) {
        try {
            String username = getCurrentUsername(authentication);
            emailService.sendDraft(username, messageId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Draft sent successfully");

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Failed to send draft: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to send draft");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /**
     * DELETE EMAIL (Move to trash)
     * DELETE /api/email/{messageId}
     */
    @DeleteMapping("/{messageId}")
    public ResponseEntity<?> deleteEmail(@PathVariable String messageId, Authentication authentication) {
        try {
            String username = getCurrentUsername(authentication);
            emailService.deleteEmail(username, messageId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Email moved to trash");

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Failed to delete email: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to delete email");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * BULK MOVE EMAILS
     * POST /api/email/bulk-move?toFolder=work
     * Body: ["messageId1", "messageId2", ...]
     */
    @PostMapping("/bulk-move")
    public ResponseEntity<?> bulkMove(
            @RequestBody List<String> messageIds,
            @RequestParam String toFolder,
            Authentication authentication) {
        try {
            String username = getCurrentUsername(authentication);
            emailService.bulkMove(username, messageIds, toFolder);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Moved " + messageIds.size() + " emails to " + toFolder);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Bulk move failed: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Bulk move failed");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * BULK DELETE EMAILS
     * POST /api/email/bulk-delete
     * Body: ["messageId1", "messageId2", ...]
     */
    @PostMapping("/bulk-delete")
    public ResponseEntity<?> bulkDelete(@RequestBody List<String> messageIds, Authentication authentication) {
        try {
            String username = getCurrentUsername(authentication);
            emailService.bulkDelete(username, messageIds);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Deleted " + messageIds.size() + " emails");

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Bulk delete failed: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Bulk delete failed");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}