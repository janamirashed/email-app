package com.mail.backend.dps.SearchFilter;

import com.mail.backend.model.Email;

import java.util.List;
import java.util.stream.Collectors;

public class ReadStatusFilter implements SearchFilter {
    private boolean isRead;
    public ReadStatusFilter(boolean read) {
        this.isRead= read;
    }

    @Override
    public List<Email> meetCriteria(List<Email> emails) {
        return emails.stream()
                .filter(email -> email.isRead() == isRead)
                .collect(Collectors.toList());
    }
}
