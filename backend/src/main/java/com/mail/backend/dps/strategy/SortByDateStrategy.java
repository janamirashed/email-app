package com.mail.backend.dps.strategy;

import com.mail.backend.model.Email;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class SortByDateStrategy implements SortStrategy {
    @Override
    public List<Email> sort(List<Email> emails) {
        return emails.stream()
                .sorted(Comparator.comparing(Email::getTimestamp).reversed())
                .collect(Collectors.toList());
    }
}