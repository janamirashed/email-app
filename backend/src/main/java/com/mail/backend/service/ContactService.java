package com.mail.backend.service;


import com.mail.backend.dps.contactStrategy.*;
import com.mail.backend.model.Contact;
import com.mail.backend.repository.ContactRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import java.io.IOException;

@Service
@Slf4j
public class ContactService {
    @Autowired
    private ContactRepository contactRepository;

    private ContactSortStrategy getContactSortStrategy(String sortBy) {
        if (sortBy == null) {
            return new SortContactsByName();
        }
        return switch (sortBy.toLowerCase()) {
            case "name" -> new SortContactsByName();
            case "date" -> new SortContactsByDate();
            default -> new SortContactsByName();
        };
    }

    private ContactSearchStrategy getContactSearchStrategy(String searchBy) {
        if (searchBy == null) {
            return new SearchContactsAll();
        }

        return switch (searchBy.toLowerCase()) {
            case "name" -> new SearchContactsByName();
            case "email" -> new SearchContactsByEmail();
            case "all" -> new SearchContactsAll();
            default -> new SearchContactsAll();
        };
    }


    public Contact addContact(String username, Contact contact) throws IOException {
        if (contact.getName() == null || contact.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Contact name cannot be empty");
        }
        if (contact.getEmail() == null || contact.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Contact email cannot be empty");
        }

        //Generate ID for the contact if not provided
        if (contact.getId() == null) {
            contact.setId("contact-" + UUID.randomUUID().toString().substring(0, 8));
        }

        contact.setCreatedAt(LocalDateTime.now());
        contact.setUpdatedAt(LocalDateTime.now());

        contactRepository.saveContact(username, contact);
        log.info("Contact {} added for user {}", contact.getId(), username);
        return contact;
    }

    public Contact updateContact(String username, String contactId, Contact updatedContact) throws IOException {
        if (!contactRepository.contactExists(username, contactId)) {
            throw new IOException("Contact not found: " + contactId);
        }
        Contact existingContact = contactRepository.getContact(username, contactId);
        existingContact.setName(updatedContact.getName());
        existingContact.setEmail(updatedContact.getEmail());
        existingContact.setUpdatedAt(LocalDateTime.now());

        contactRepository.saveContact(username, existingContact);
        log.info("Contact {} updated for user {}", contactId, username);
        return existingContact;
    }

    public void deleteContact(String username, String contactId) throws IOException {
        if (!contactRepository.contactExists(username, contactId)) {
            throw new IOException("Contact not found: " + contactId);
        }
        contactRepository.deleteContact(username, contactId);
        log.info("Contact {} deleted for user {}", contactId, username);
    }


    public Contact getContact(String username, String contactId) throws IOException {
        return contactRepository.getContact(username, contactId);
    }

    public List<Contact> listContacts(String username, String sortBy) throws IOException {
        List<Contact> contacts = contactRepository.listContacts(username);

        //Apply Sorting
        if(sortBy != null && !sortBy.isEmpty()) {
            ContactSortStrategy contactSortStrategy = getContactSortStrategy(sortBy);
            contacts = contactSortStrategy.sort(contacts);
        }
        return contacts;
    }

    public List<Contact> searchContacts(String username, String keyword, String searchIn, String sortBy) throws IOException {
        List<Contact> allContacts = contactRepository.listContacts(username);

        // Apply search strategy
        ContactSearchStrategy searchStrategy = getContactSearchStrategy(searchIn);
        List<Contact> results = searchStrategy.search(allContacts, keyword);

        // Apply sorting strategy if specified
        if (sortBy != null && !sortBy.isEmpty()) {
            ContactSortStrategy sortStrategy = getContactSortStrategy(sortBy);
            results = sortStrategy.sort(results);
        }

        return results;
    }

    public List<Contact> findContactsByEmail(String username, String emailPrefix) throws IOException {
        List<Contact> allContacts = contactRepository.listContacts(username);
        String lowerPrefix = emailPrefix.toLowerCase();

        return allContacts.stream()
                .filter(contact -> contact.getEmail().
                        toLowerCase().startsWith(lowerPrefix))
                .toList();
    }

    public int getContactCount(String username) throws IOException {
        return contactRepository.listContacts(username).size();
    }
}
