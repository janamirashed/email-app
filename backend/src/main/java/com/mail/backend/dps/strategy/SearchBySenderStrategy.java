package com.mail.backend.dps.strategy;

import com.mail.backend.model.Email;
import java.util.List;
import java.util.stream.Collectors;

public class SearchBySenderStrategy implements SearchStrategy {
    @Override
    public List<Email> search(List<Email> emails, String keyword) {
        String lowerKeyword = keyword.toLowerCase();
        return emails.stream()
                .filter(email -> email.getFrom() != null &&
                        email.getFrom().toLowerCase().contains(lowerKeyword))
                .collect(Collectors.toList());
    }
}