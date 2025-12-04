package com.mail.backend.dps.contactStrategy;

import com.mail.backend.model.Contact;

import java.util.List;

public interface ContactSearchStrategy {
    List<Contact> search(List<Contact> contacts, String keyword);
}
