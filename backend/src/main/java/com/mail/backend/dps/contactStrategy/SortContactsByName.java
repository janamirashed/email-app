package com.mail.backend.dps.contactStrategy;

import com.mail.backend.model.Contact;

import java.util.Comparator;
import java.util.List;

public class SortContactsByName implements ContactSortStrategy {
    public List<Contact> sort(List<Contact> contacts) {
        return contacts.stream()
                .sorted(Comparator.comparing(Contact::getName,
                        String.CASE_INSENSITIVE_ORDER))
                .toList();
    }
}
