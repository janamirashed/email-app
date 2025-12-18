package com.mail.backend.dps.SearchFilter;

import com.mail.backend.model.Email;
import com.mail.backend.service.HtmlHelper;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class BodyFilter implements SearchFilter {
    private String keyword;
    public BodyFilter(String keyword) {
        this.keyword = keyword;
    }

    @Override
    public List<Email> meetCriteria(List<Email> emails) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return emails;
        }
        String lowerKeyword = keyword.toLowerCase();
        Stream<Email> emailStream = emails.stream();
        Stream<Email> filteredEmailStream = emailStream.filter(email->{
            String plainBody = HtmlHelper.extractPlainText(email.getBody());
            return plainBody.toLowerCase().contains(lowerKeyword);
        });

        return filteredEmailStream.collect(Collectors.toList());
    }
}
