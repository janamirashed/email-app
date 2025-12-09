package com.mail.backend.dps.strategy;

import com.mail.backend.model.Email;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class SearchByImportanceStrategy implements SearchStrategy {
    @Override
    public List<Email> search(List<Email> emails,String keyword) {
        return emails.stream()
                .filter(email -> email.getPriority() != null &&
                        email.getPriority().toString().equals(keyword))
                .collect(Collectors.toList());
    }
}