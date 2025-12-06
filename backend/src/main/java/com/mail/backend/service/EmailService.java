package com.mail.backend.service;

import com.mail.backend.dps.builder.EmailBuilder;
import com.mail.backend.dps.strategy.*;
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
    public String sendEmail(String username, Email emailRequest) throws IOException {
        // Validate
        if (emailRequest.getTo() == null || emailRequest.getTo().isEmpty()) {
            throw new IllegalArgumentException("Recipients list cannot be empty");
        }
        if (emailRequest.getSubject() == null || emailRequest.getSubject().trim().isEmpty()) {
            throw new IllegalArgumentException("Subject cannot be empty");
        }

        // Generate unique messageId
        String messageId = generateMessageId();

        // Build the email using Builder Pattern
        Email email = Email.builder()
                .messageId(messageId)
                .from(username + "@jaryn.com")
                .to(emailRequest.getTo())
                .subject(emailRequest.getSubject())
                .body(emailRequest.getBody())
                .timestamp(LocalDateTime.now())
                .priority(emailRequest.getPriority() != null ? emailRequest.getPriority() : 3)
                .attachments(emailRequest.getAttachments())
                .inSent()
                .build();

        // Save to sender's sent folder
        emailRepository.saveEmail(username, email);
        log.info("Email {} sent by {} to {}", messageId, username, email.getTo());

        // Send to recipient (one at a time, frontend handles iteration)
        String recipient = email.getTo().get(0); // Frontend sends to single recipient
        try {
            // Create copy for recipient's inbox using Builder Pattern
            Email recipientCopy = Email.builder()
                    .messageId(messageId)
                    .from(email.getFrom())
                    .to(email.getTo())
                    .subject(email.getSubject())
                    .body(email.getBody())
                    .timestamp(email.getTimestamp())
                    .priority(email.getPriority())
                    .attachments(email.getAttachments())
                    .inInbox()
                    .markAsUnread()
                    .build();

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
    public String saveDraft(String username, Email emailRequest) throws IOException {
        String messageId = generateMessageId();

        // Build draft using Builder Pattern
        Email draft = Email.builder()
                .messageId(messageId)
                .from(username + "@jaryn.com")
                .to(emailRequest.getTo())
                .subject(emailRequest.getSubject())
                .body(emailRequest.getBody())
                .timestamp(LocalDateTime.now())
                .priority(emailRequest.getPriority())
                .attachments(emailRequest.getAttachments())
                .inDrafts()
                .build();

        emailRepository.saveEmail(username, draft);
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
    public Map<String, Object> getInboxEmails(String username, int page, int limit, String sortBy) throws IOException {
        List<Email> emails = emailRepository.listEmailsInFolder(username, "inbox");

        // Apply Sorting
        if(sortBy != null && !sortBy.isEmpty()) {
            SortStrategy strategy = getSortStrategy(sortBy);
            emails = strategy.sort(emails);
        }
        return paginate(emails, page, limit, "inbox");
    }

    // GET EMAILS FROM ANY FOLDER - Paginated
    public Map<String, Object> getEmailsInFolder(String username, String folder, int page, int limit, String sortBy) throws IOException {
        List<Email> emails = emailRepository.listEmailsInFolder(username, folder);

        // Apply Sorting
        if (sortBy != null && !sortBy.isEmpty()) {
            SortStrategy strategy = getSortStrategy(sortBy);
            emails = strategy.sort(emails);
        }

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
    public List<Email> searchEmails(String username, String keyword, String searchBy, String sortBy) throws IOException {
        List<Email> allEmails = emailRepository.getAllEmails(username);

        // Apply search strategy
        SearchStrategy searchStrategy = getSearchStrategy(searchBy);
        List<Email> results = searchStrategy.search(allEmails, keyword);

        // Apply sorting strategy if specified
        if (sortBy != null && !sortBy.isEmpty()) {
            SortStrategy sortStrategy = getSortStrategy(sortBy);
            results = sortStrategy.sort(results);
        }
        return results;
    }

    // MARK AS READ
    public void markAsRead(String username, String messageId) throws IOException {
        Email email = getEmail(username, messageId);

        // Use Builder Pattern to create modified email
        Email updatedEmail = email.toBuilder()
                .markAsRead()
                .build();

        emailRepository.saveEmail(username, updatedEmail);
        log.info("Email {} marked as read by {}", messageId, username);
    }

    // MARK AS UNREAD
    public void markAsUnread(String username, String messageId) throws IOException {
        Email email = getEmail(username, messageId);

        // Use Builder Pattern to create modified email
        Email updatedEmail = email.toBuilder()
                .markAsUnread()
                .build();

        emailRepository.saveEmail(username, updatedEmail);
        log.info("Email {} marked as unread by {}", messageId, username);
    }

    // STAR EMAIL
    public void starEmail(String username, String messageId) throws IOException {
        Email email = getEmail(username, messageId);

        // Use Builder Pattern to create modified email
        Email updatedEmail = email.toBuilder()
                .star()
                .build();

        emailRepository.saveEmail(username, updatedEmail);
        log.info("Email {} starred by {}", messageId, username);
    }

    // UNSTAR EMAIL
    public void unstarEmail(String username, String messageId) throws IOException {
        Email email = getEmail(username, messageId);

        // Use Builder Pattern to create modified email
        Email updatedEmail = email.toBuilder()
                .unstar()
                .build();

        emailRepository.saveEmail(username, updatedEmail);
        log.info("Email {} unstarred by {}", messageId, username);
    }

    // MOVE EMAIL TO FOLDER
    public void moveEmail(String username, String messageId, String toFolder) throws IOException {
        Email email = getEmail(username, messageId);
        String fromFolder = email.getFolder();

        // Use Builder Pattern to update folder
        Email updatedEmail = email.toBuilder()
                .folder(toFolder)
                .build();

        // If moving to trash, set deletedAt
        if (toFolder.equals("trash")) {
            updatedEmail = updatedEmail.toBuilder()
                    .deletedAt(LocalDateTime.now())
                    .build();
        }

        emailRepository.moveEmail(username, messageId, fromFolder, toFolder);
        log.info("Email {} moved from {} to {}", messageId, fromFolder, toFolder);
    }

    // DELETE EMAIL (Move to trash)
    public void deleteEmail(String username, String messageId) throws IOException {
        Email email = getEmail(username, messageId);
        String currentFolder = email.getFolder();

        if (!currentFolder.equals("trash")) {
            emailRepository.moveEmail(username, messageId, currentFolder, "trash");

            // Use Builder Pattern to mark as deleted
            Email trashedEmail = email.toBuilder()
                    .inTrash()
                    .build();

            emailRepository.saveEmail(username, trashedEmail);
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

    // GET STARRED EMAILS + sorting
    public List<Email> getStarredEmails(String username, String sortBy) throws IOException {
        List<Email> allEmails = emailRepository.getAllEmails(username);
        List<Email> starred = allEmails.stream()
                .filter(Email::isStarred)
                .collect(Collectors.toList());

        // Apply sorting
        if (sortBy != null && !sortBy.isEmpty()) {
            SortStrategy strategy = getSortStrategy(sortBy);
            starred = strategy.sort(starred);
        }

        return starred;
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

    // Strategy Pattern - Sorting
    private SortStrategy getSortStrategy(String sortBy) {
        if(sortBy==null || sortBy.isEmpty()) {
            return new SortByDateStrategy(); // Default Sort strategy
        }
        return switch (sortBy.toLowerCase()){
            case "date" -> new SortByDateStrategy();
            case "importance", "priority" -> new SortByImportanceStrategy();
            default -> new SortByDateStrategy();
        };
    }

    // Strategy Pattern - Searching
    private SearchStrategy getSearchStrategy(String searchBy) {
        if(searchBy==null || searchBy.isEmpty()) {
            return new SearchAllStrategy(); // Default Search strategy
        }
        return switch (searchBy.toLowerCase()){
            case "sender" -> new SearchBySenderStrategy();
            case "subject"-> new SearchBySubjectStrategy();
            case "receiver", "receivers", "to" -> new SearchByReceiverStrategy();
            case "all"  -> new SearchAllStrategy();
            case "body" -> new SearchByBodyStrategy();
            default -> new SearchAllStrategy();
        };
    }
}