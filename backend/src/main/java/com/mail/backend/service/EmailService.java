package com.mail.backend.service;

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

    @Autowired
    private FilterService filterService;
    // SEND EMAIL - Save to sent folder and create copy in recipient's inbox
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
        try{
            emailRepository.saveEmail(username, filterService.applyFilters(username, email));
        } catch (Exception e){
            System.err.println(e.getMessage());
        }
        log.info("Email {} sent by {} to {}", messageId, username, email.getTo());

        // Loop through all recipients
        Queue<String> recipientQueue = new LinkedList<>(email.getTo());
        int totalRecipients = recipientQueue.size();
        int successfulDeliveries = 0;
        int failedDeliveries = 0;

        log.info("Processing email {} delivery to {} recipients using Queue", messageId, totalRecipients);

        // Process recipients from the queue
        while (!recipientQueue.isEmpty()) {
            String recipient = recipientQueue.poll();

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

                String recipientUsername = extractUsername(recipient);
                emailRepository.saveEmail(recipientUsername, filterService.applyFilters(recipientUsername, recipientCopy));

                successfulDeliveries++;
                log.info("Email {} delivered successfully to {} [Queue position: {}/{}]",
                        messageId, recipient, (totalRecipients - recipientQueue.size()), totalRecipients);

            } catch (Exception e) {
                failedDeliveries++;
                // Continue with next recipient instead of throwing
                log.error("Failed to deliver email {} to {}: {}", messageId, recipient, e.getMessage());
            }
        }

        // Log delivery summary
        log.info("Email {} delivery complete - Success: {}/{}, Failed: {}/{}",
                messageId, successfulDeliveries, totalRecipients, failedDeliveries, totalRecipients);

        if (failedDeliveries > 0) {
            log.warn("Email {} had {} failed delivery attempts out of {}",
                    messageId, failedDeliveries, totalRecipients);
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

        String originalFolderToSave = email.getOriginalFolder();
        if (originalFolderToSave == null || originalFolderToSave.isEmpty()) {
            originalFolderToSave = fromFolder;
        }

        // Use Builder Pattern to update folder
        Email updatedEmail = email.toBuilder()
                .folder(toFolder)
                .originalFolder(originalFolderToSave)  // Preserve or set original folder
                .build();

        // If moving to trash, set deletedAt
        if (toFolder.equals("trash")) {
            updatedEmail = updatedEmail.toBuilder()
                    .deletedAt(LocalDateTime.now())
                    .build();
        }

        emailRepository.moveEmail(username, messageId, fromFolder, toFolder);

        // Save the updated email metadata with new folder
        emailRepository.saveEmail(username, updatedEmail);

        log.info("Email {} moved from {} to {}, original folder tracked as: {}",
                messageId, fromFolder, toFolder, originalFolderToSave);
    }

    // DELETE EMAIL (Move to trash)
    public void deleteEmail(String username, String messageId) throws IOException {
        Email email = getEmail(username, messageId);
        String currentFolder = email.getFolder();

        if (!currentFolder.equals("trash")) {
            emailRepository.moveEmail(username, messageId, currentFolder, "trash");

            String originalFolderToPreserve = email.getOriginalFolder();
            if (originalFolderToPreserve == null || originalFolderToPreserve.isEmpty()) {
                originalFolderToPreserve = currentFolder;
            }

            // Use Builder Pattern to mark as deleted
            Email trashedEmail = email.toBuilder()
                    .inTrash()
                    .originalFolder(originalFolderToPreserve)  // IMPORTANT: Preserve original folder
                    .build();

            emailRepository.saveEmail(username, trashedEmail);
            log.info("Email {} moved to trash by {}, will restore to: {}",
                    messageId, username, originalFolderToPreserve);
        }
    }

    // PERMANENTLY DELETE EMAIL
    public void permanentlyDeleteEmail(String username, String messageId) throws IOException {
        Email email = getEmail(username, messageId);

        if (email == null) {
            throw new IOException("Email not found: " + messageId);
        }

        String folder = email.getFolder();
        if (folder == null || folder.isEmpty()) {
            folder = "inbox"; // Default fallback
        }

        boolean deleted = emailRepository.deleteEmail(username, folder, messageId);

        if (!deleted) {
            log.warn("Failed to permanently delete email {} from folder {}", messageId, folder);
            throw new IOException("Failed to delete email from file system: " + messageId);
        }

        log.info("Email {} permanently deleted from folder {}", messageId, folder);
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
                deleteEmail(username, messageId);  // Move to trash, NOT permanently delete
            } catch (IOException e) {
                log.error("Failed to delete email {}", messageId, e);
            }
        }
        log.info("Bulk deleted {} emails", messageIds.size());
    }

    public void bulkPermanentlyDelete(String username, List<String> messageIds) throws IOException {
        int successCount = 0;
        int failureCount = 0;

        for (String messageId : messageIds) {
            try {
                Email email = getEmail(username, messageId);
                String folder = email.getFolder();

                boolean deleted = emailRepository.deleteEmail(username, folder, messageId);

                if (deleted) {
                    successCount++;
                    log.info("Permanently deleted email {}", messageId);
                } else {
                    failureCount++;
                    log.error("Failed to permanently delete email {}", messageId);
                }

            } catch (IOException e) {
                failureCount++;
                log.error("Failed to permanently delete email {}: {}", messageId, e.getMessage(), e);
            }
        }

        log.info("Bulk permanently deleted {} emails - Success: {}, Failures: {}", messageIds.size(), successCount, failureCount);

        if (failureCount > 0) {
            throw new IOException("Failed to delete " + failureCount + " emails. See logs for details.");
        }
    }

    // CLEANUP TRASH - Auto delete after 30 days
    public void cleanupTrash(String username) throws IOException {
        emailRepository.cleanupTrash(username);
        log.info("Trash cleanup completed for {}", username);
    }


    // Moves email back to the folder it was in before deletion
    public void restoreEmailFromTrash(String username, String messageId) throws IOException {
        Email email = getEmail(username, messageId);

        if (email == null) {
            throw new IOException("Email not found: " + messageId);
        }

        // Check if email is in trash
        if (!email.getFolder().equals("trash")) {
            throw new IOException("Email is not in trash");
        }

        // Determine restore folder - use originalFolder if available, otherwise default to inbox
        String restoreFolder = email.getOriginalFolder();
        if (restoreFolder == null || restoreFolder.isEmpty() || restoreFolder.equals("trash")) {
            restoreFolder = "inbox"; // Default fallback
            log.warn("No original folder found for email {}. Restoring to inbox", messageId);
        }

        log.info("Restoring email {} from trash to original folder: {}", messageId, restoreFolder);

        // Move email back to original folder
        emailRepository.moveEmail(username, messageId, "trash", restoreFolder);

        // Update the email metadata
        Email restoredEmail = email.toBuilder()
                .folder(restoreFolder)
                .deletedAt(null) // Clear the deletion timestamp
                .originalFolder(null) // Clear original folder after restore
                .build();

        emailRepository.saveEmail(username, restoredEmail);
        log.info("Email {} successfully restored to {}", messageId, restoreFolder);
    }

    // Restores multiple emails to their original folders
    public void bulkRestoreFromTrash(String username, List<String> messageIds) throws IOException {
        for (String messageId : messageIds) {
            try {
                restoreEmailFromTrash(username, messageId);
            } catch (IOException e) {
                log.error("Failed to restore email {}: {}", messageId, e.getMessage());
                // Continue with next email instead of failing completely
            }
        }
        log.info("Bulk restored {} emails from trash", messageIds.size());
    }

    // GET STARRED EMAILS + sorting
    public Map<String, Object> getStarredEmails(String username, String sortBy) throws IOException {
        List<Email> allEmails = emailRepository.getAllEmails(username);
        List<Email> starred = allEmails.stream()
                .filter(Email::isStarred)
                .collect(Collectors.toList());

        // Apply sorting
        if (sortBy != null && !sortBy.isEmpty()) {
            SortStrategy strategy = getSortStrategy(sortBy);
            starred = strategy.sort(starred);
        }

        // Return in same format
        Map<String, Object> response = new HashMap<>();
        response.put("content", starred);
        response.put("currentPage", 1);
        response.put("pageSize", starred.size());
        response.put("totalPages", 1);
        response.put("totalEmails", starred.size());
        response.put("folder", "starred");

        return response;
    }

    // Also add paginated version for future use
    public Map<String, Object> getStarredEmailsPaginated(String username, int page, int limit, String sortBy) throws IOException {
        List<Email> allEmails = emailRepository.getAllEmails(username);
        List<Email> starred = allEmails.stream()
                .filter(Email::isStarred)
                .collect(Collectors.toList());

        // Apply sorting
        if (sortBy != null && !sortBy.isEmpty()) {
            SortStrategy strategy = getSortStrategy(sortBy);
            starred = strategy.sort(starred);
        }

        return paginate(starred, page, limit, "starred");
    }

    // GET UNREAD EMAIL COUNT
    public int getUnreadCount(String username) throws IOException {
        List<Email> allEmails = emailRepository.getAllEmails(username);
        return (int) allEmails.stream()
                .filter(email -> email.getTo().contains(username+"@jaryn.com"))
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
            case "priority" -> new SortByPriorityStrategy();
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
            case "importance" -> new SearchByImportanceStrategy();
            default -> new SearchAllStrategy();
        };
    }
}