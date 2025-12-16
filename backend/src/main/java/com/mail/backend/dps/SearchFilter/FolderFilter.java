package com.mail.backend.dps.SearchFilter;

import com.mail.backend.model.Email;

import java.util.List;
import java.util.stream.Collectors;

public class FolderFilter implements SearchFilter {
    private String folderName;
    public FolderFilter(String folderName) {
        this.folderName = folderName;
    }

    @Override
    public List<Email> meetCriteria(List<Email> emails) {
        if (folderName == null || folderName.isEmpty() || folderName.equalsIgnoreCase("all")) {
            return emails;
        }
        return emails.stream()
                .filter(email -> email.getFolder().equalsIgnoreCase(folderName))
                .collect(Collectors.toList());
    }
}
