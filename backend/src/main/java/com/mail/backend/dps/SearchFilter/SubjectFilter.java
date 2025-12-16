package com.mail.backend.dps.SearchFilter;

import com.mail.backend.model.Email;

import java.util.List;
import java.util.stream.Collectors;

public class SubjectFilter implements SearchFilter {
    private String subject;
    public SubjectFilter(String subject) {
        this.subject = subject;
    }

    @Override
    public List<Email> meetCriteria(List<Email> emails) {
        if (subject == null || subject.trim().isEmpty()) {
            return emails;
        }
        String lowerSubject = subject.toLowerCase();
        return emails.stream()
                .filter(email -> email.getSubject().toLowerCase().contains(lowerSubject))
                .collect(Collectors.toList());
    }
}
