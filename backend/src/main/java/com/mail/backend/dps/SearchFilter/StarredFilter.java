package com.mail.backend.dps.SearchFilter;

import com.mail.backend.model.Email;

import java.util.List;
import java.util.stream.Collectors;

public class StarredFilter implements SearchFilter {
    @Override
    public List<Email> meetCriteria(List<Email> emails) {
        return emails.stream()
                .filter(Email::isStarred)
                .collect(Collectors.toList());
    }
}
