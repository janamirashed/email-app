package com.mail.backend.dps.contactStrategy;

import com.mail.backend.model.Contact;

import java.util.Comparator;
import java.util.List;

public class SortContactsByDate implements ContactSortStrategy {
    @Override
    public List<Contact> sort(List<Contact> contacts) {
        return contacts.stream()
                .sorted(Comparator.comparing(Contact::getCreatedAt).reversed())
                .toList();
    }
}
