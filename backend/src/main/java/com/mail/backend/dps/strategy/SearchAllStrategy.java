package com.mail.backend.dps.strategy;

import com.mail.backend.model.Email;
import java.util.List;
import java.util.stream.Collectors;

public class SearchAllStrategy implements SearchStrategy {
    @Override
    public List<Email> search(List<Email> emails, String keyword) {
        String lowerKeyword = keyword.toLowerCase();
        return emails.stream()
                .filter(email ->
                        // Search in subject
                        (email.getSubject() != null && email.getSubject().toLowerCase().contains(lowerKeyword))
                                // Search in body
                                || (email.getBody() != null && email.getBody().toLowerCase().contains(lowerKeyword))
                                // Search in sender
                                || (email.getFrom() != null && email.getFrom().toLowerCase().contains(lowerKeyword))
                                // Search in receivers
                                || (email.getTo() != null && email.getTo().stream()
                                .anyMatch(receiver -> receiver.toLowerCase().contains(lowerKeyword)))
                )
                .collect(Collectors.toList());
    }
}