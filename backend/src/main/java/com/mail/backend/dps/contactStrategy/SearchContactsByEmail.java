package com.mail.backend.dps.contactStrategy;

import com.mail.backend.model.Contact;

import java.util.List;

public class SearchContactsByEmail implements ContactSearchStrategy {
    @Override
    public List<Contact> search(List<Contact> contacts, String keyword) {
        String lowerKeyword = keyword.toLowerCase();
        return contacts.stream()
                .filter(contact -> contact.getEmail() != null &&
                        contact.getEmail().toLowerCase().contains(lowerKeyword))
                .toList();
    }
}
