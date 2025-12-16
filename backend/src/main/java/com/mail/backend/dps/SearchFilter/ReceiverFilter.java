package com.mail.backend.dps.SearchFilter;

import com.mail.backend.model.Email;

import java.util.List;
import java.util.stream.Collectors;

public class ReceiverFilter implements SearchFilter {
    private String receiver;
    public ReceiverFilter(String receiver) {
        this.receiver = receiver;
    }

    @Override
    public List<Email> meetCriteria(List<Email> emails) {
        if (receiver == null || receiver.trim().isEmpty()) {
            return emails;
        }
        String lowerReceiver = receiver.toLowerCase();
        return emails.stream()
                .filter(email -> email.getTo().stream()
                        .anyMatch(to -> to.toLowerCase().contains(lowerReceiver)))
                .collect(Collectors.toList());
    }
}
