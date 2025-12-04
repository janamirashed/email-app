package com.mail.backend.dps.contactStrategy;

import com.mail.backend.model.Contact;

import java.util.List;

public interface ContactSortStrategy {
    List<Contact> sort(List<Contact> contacts);
}
