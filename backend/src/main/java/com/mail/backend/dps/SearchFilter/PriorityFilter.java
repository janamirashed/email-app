package com.mail.backend.dps.SearchFilter;

import com.mail.backend.dps.strategy.SortStrategy;
import com.mail.backend.model.Email;

import java.util.List;
import java.util.stream.Collectors;

public class PriorityFilter implements SearchFilter {
    private Integer priority;

    public PriorityFilter(Integer priority) {
        this.priority = priority;
    }

    @Override
    public List<Email> meetCriteria(List<Email> emails) {
        return emails.stream()
                .filter(email -> email.getPriority() != null && email.getPriority().equals(priority))
                .collect(Collectors.toList());
    }
}
