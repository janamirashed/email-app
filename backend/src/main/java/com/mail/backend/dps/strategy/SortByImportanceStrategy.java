package com.mail.backend.dps.strategy;

import com.mail.backend.model.Email;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class SortByImportanceStrategy implements SortStrategy {
    @Override
    public List<Email> sort(List<Email> emails) {
        return emails.stream()
                .sorted(Comparator.comparing(Email::getPriority,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());
    }
}