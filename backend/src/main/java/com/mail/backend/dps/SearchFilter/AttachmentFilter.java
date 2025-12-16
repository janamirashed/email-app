package com.mail.backend.dps.SearchFilter;

import com.mail.backend.model.Email;

import java.util.List;
import java.util.stream.Collectors;

public class AttachmentFilter implements SearchFilter {
    private boolean hasAttachment;

    public AttachmentFilter(boolean hasAttachment) {
        this.hasAttachment = hasAttachment;
    }

    @Override
    public List<Email> meetCriteria(List<Email> emails) {
        return emails.stream()
                .filter(email -> {
                    boolean emailHasAttachments = email.getAttachments() != null && !email.getAttachments().isEmpty();
                    return hasAttachment ? emailHasAttachments : !emailHasAttachments;
                })
                .collect(Collectors.toList());
    }
}
