package com.mail.backend.dps.SearchFilter;

import com.mail.backend.model.Email;

import java.util.List;
import java.util.stream.Collectors;

public class SenderFilter implements SearchFilter {
    private String sender;

    public SenderFilter(String sender) {
        this.sender = sender;
    }

    @Override
    public List<Email> meetCriteria(List<Email> emails) {
        if (sender == null || sender.trim().isEmpty()) {
            return emails;
        }
        String lowerSender = sender.toLowerCase();
        return emails.stream()
                .filter(email -> email.getFrom().toLowerCase().contains(lowerSender))
                .collect(Collectors.toList());
    }

}
