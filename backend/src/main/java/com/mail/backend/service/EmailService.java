package com.mail.backend.service;

import com.mail.backend.model.Email;
import com.mail.backend.repository.EmailRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class EmailService {

    @Autowired
    private EmailRepository emailRepository;

    // SEND EMAIL - Save to sent folder and create copy in recipient's inbox
    // Frontend handles sending to one recipient at a time
    public String sendEmail(String username, Email email) throws IOException {
        // Validate
        if (email.getTo() == null || email.getTo().isEmpty()) {
            throw new IllegalArgumentException("Recipients list cannot be empty");
        }
        if (email.getSubject() == null || email.getSubject().trim().isEmpty()) {
            throw new IllegalArgumentException("Subject cannot be empty");
        }

        // Generate unique messageId
        String messageId = generateMessageId();
        email.setMessageId(messageId);
        email.setFrom(username + "@jaryn.com");
        email.setTimestamp(LocalDateTime.now());
        email.setFolder("sent");
        email.setDraft(false);

        // Save to sender's sent folder
        emailRepository.saveEmail(username, email);
        log.info("Email {} sent by {} to {}", messageId, username, email.getTo());

        // Send to recipient (one at a time, frontend handles iteration)
        String recipient = email.getTo().get(0); // Frontend sends to single recipient
        try {
            // Create copy for recipient's inbox
            Email recipientCopy = new Email();
            recipientCopy.setMessageId(messageId);
            recipientCopy.setFrom(email.getFrom());
            recipientCopy.setTo(email.getTo());
            recipientCopy.setSubject(email.getSubject());
            recipientCopy.setBody(email.getBody());
            recipientCopy.setTimestamp(email.getTimestamp());
            recipientCopy.setPriority(email.getPriority());
            recipientCopy.setFolder("inbox");
            recipientCopy.setAttachments(email.getAttachments());

            // Extract recipient's username from email
            String recipientUsername = extractUsername(recipient);
            emailRepository.saveEmail(recipientUsername, recipientCopy);
            log.info("Email {} delivered to {}", messageId, recipient);
        } catch (Exception e) {
            log.error("Failed to deliver email to {}", recipient, e);
            throw new IOException("Failed to deliver email");
        }

        return messageId;
    }

    // SAVE DRAFT
    public String saveDraft(String username, Email email) throws IOException {
        String messageId = generateMessageId();
        email.setMessageId(messageId);
        email.setFrom(username + "@jaryn.com");
        email.setTimestamp(LocalDateTime.now());
        email.setFolder("drafts");
        email.setDraft(true);

        emailRepository.saveEmail(username, email);
        log.info("Draft {} saved by {}", messageId, username);
        return messageId;
    }

    // SEND DRAFT - Move from drafts to sent, send to recipients
    public void sendDraft(String username, String messageId) throws IOException {
        Email draft = emailRepository.getEmail(username, "drafts", messageId);
        if (draft == null) {
            throw new IOException("Draft not found");
        }

        // Delete from drafts
        emailRepository.deleteEmail(username, "drafts", messageId);

        // Send email
        sendEmail(username, draft);
    }

    // GET INBOX EMAILS - Paginated
    public Map<String, Object> getInboxEmails(String username, int page, int limit) throws IOException {
        List<Email> emails = emailRepository.listEmailsInFolder(username, "inbox");
        return paginate(emails, page, limit, "inbox");
    }

    // GET EMAILS FROM ANY FOLDER - Paginated
    public Map<String, Object> getEmailsInFolder(String username, String folder, int page, int limit) throws IOException {
        List<Email> emails = emailRepository.listEmailsInFolder(username, folder);
        return paginate(emails, page, limit, folder);
    }

    // GET SINGLE EMAIL
    public Email getEmail(String username, String messageId) throws IOException {
        // Search across all folders
        List<Email> allEmails = emailRepository.getAllEmails(username);
        return allEmails.stream()
                .filter(e -> e.getMessageId().equals(messageId))
                .findFirst()
                .orElseThrow(() -> new IOException("Email not found: " + messageId));
    }

    // SEARCH EMAILS
    public List<Email> searchEmails(String username, String keyword, String searchIn) throws IOException {
        List<Email> allEmails = emailRepository.getAllEmails(username);
        String lowerKeyword = keyword.toLowerCase();

        return allEmails.stream()
                .filter(email -> {
                    switch (searchIn.toLowerCase()) {
                        case "subject":
                            return email.getSubject().toLowerCase().contains(lowerKeyword);
                        case "body":
                            return email.getBody().toLowerCase().contains(lowerKeyword);
                        case "sender":
                            return email.getFrom().toLowerCase().contains(lowerKeyword);
                        case "all":
                        default:
                            return email.getSubject().toLowerCase().contains(lowerKeyword)
                                    || email.getBody().toLowerCase().contains(lowerKeyword)
                                    || email.getFrom().toLowerCase().contains(lowerKeyword);
                    }
                })
                .collect(Collectors.toList());
    }

    // MARK AS READ
    public void markAsRead(String username, String messageId) throws IOException {
        Email email = getEmail(username, messageId);
        email.setRead(true);
        emailRepository.saveEmail(username, email);
        log.info("Email {} marked as read by {}", messageId, username);
    }

    // MARK AS UNREAD
    public void markAsUnread(String username, String messageId) throws IOException {
        Email email = getEmail(username, messageId);
        email.setRead(false);
        emailRepository.saveEmail(username, email);
        log.info("Email {} marked as unread by {}", messageId, username);
    }

    // STAR EMAIL
    public void starEmail(String username, String messageId) throws IOException {
        Email email = getEmail(username, messageId);
        email.setStarred(true);
        emailRepository.saveEmail(username, email);
        log.info("Email {} starred by {}", messageId, username);
    }

    // UNSTAR EMAIL
    public void unstarEmail(String username, String messageId) throws IOException {
        Email email = getEmail(username, messageId);
        email.setStarred(false);
        emailRepository.saveEmail(username, email);
        log.info("Email {} unstarred by {}", messageId, username);
    }

    // MOVE EMAIL TO FOLDER
    public void moveEmail(String username, String messageId, String toFolder) throws IOException {
        Email email = getEmail(username, messageId);
        String fromFolder = email.getFolder();

        emailRepository.moveEmail(username, messageId, fromFolder, toFolder);
        log.info("Email {} moved from {} to {}", messageId, fromFolder, toFolder);
    }

    // DELETE EMAIL (Move to trash)
    public void deleteEmail(String username, String messageId) throws IOException {
        Email email = getEmail(username, messageId);
        String currentFolder = email.getFolder();

        if (!currentFolder.equals("trash")) {
            emailRepository.moveEmail(username, messageId, currentFolder, "trash");
            email.setDeletedAt(LocalDateTime.now());
            emailRepository.saveEmail(username, email);
            log.info("Email {} moved to trash by {}", messageId, username);
        }
    }

    // PERMANENTLY DELETE EMAIL
    public void permanentlyDeleteEmail(String username, String messageId) throws IOException {
        Email email = getEmail(username, messageId);
        emailRepository.deleteEmail(username, email.getFolder(), messageId);
        log.info("Email {} permanently deleted by {}", messageId, username);
    }

    // BULK MOVE EMAILS
    public void bulkMove(String username, List<String> messageIds, String toFolder) throws IOException {
        for (String messageId : messageIds) {
            try {
                moveEmail(username, messageId, toFolder);
            } catch (IOException e) {
                log.error("Failed to move email {}", messageId, e);
            }
        }
        log.info("Bulk moved {} emails to {}", messageIds.size(), toFolder);
    }

    // BULK DELETE EMAILS
    public void bulkDelete(String username, List<String> messageIds) throws IOException {
        for (String messageId : messageIds) {
            try {
                deleteEmail(username, messageId);
            } catch (IOException e) {
                log.error("Failed to delete email {}", messageId, e);
            }
        }
        log.info("Bulk deleted {} emails", messageIds.size());
    }

    // CLEANUP TRASH - Auto delete after 30 days
    public void cleanupTrash(String username) throws IOException {
        emailRepository.cleanupTrash(username);
        log.info("Trash cleanup completed for {}", username);
    }

    // GET STARRED EMAILS
    public List<Email> getStarredEmails(String username) throws IOException {
        List<Email> allEmails = emailRepository.getAllEmails(username);
        return allEmails.stream()
                .filter(Email::isStarred)
                .collect(Collectors.toList());
    }

    // GET UNREAD EMAIL COUNT
    public int getUnreadCount(String username) throws IOException {
        List<Email> allEmails = emailRepository.getAllEmails(username);
        return (int) allEmails.stream()
                .filter(email -> !email.isRead())
                .count();
    }

    // Generate unique message ID
    private String generateMessageId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    // Extract username from email address
    private String extractUsername(String emailAddress) {
        if (emailAddress.contains("@jaryn.com")) {
            return emailAddress.split("@")[0];
        }
        // For external emails, use first part of email
        return emailAddress.split("@")[0];
    }

    // Paginate list of emails
    private Map<String, Object> paginate(List<Email> emails, int page, int limit, String folder) {
        int totalEmails = emails.size();
        int totalPages = (int) Math.ceil((double) totalEmails / limit);

        // Validate page
        if (page < 1) page = 1;
        if (page > totalPages && totalPages > 0) page = totalPages;

        int startIdx = (page - 1) * limit;
        int endIdx = Math.min(startIdx + limit, totalEmails);

        List<Email> pageContent = emails.subList(startIdx, endIdx);

        Map<String, Object> response = new HashMap<>();
        response.put("content", pageContent);
        response.put("currentPage", page);
        response.put("pageSize", limit);
        response.put("totalPages", totalPages);
        response.put("totalEmails", totalEmails);
        response.put("folder", folder);

        return response;
    }
}