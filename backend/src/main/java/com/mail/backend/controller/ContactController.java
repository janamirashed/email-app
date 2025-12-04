package com.mail.backend.controller;

import com.mail.backend.model.Contact;
import com.mail.backend.repository.ContactRepository;
import com.mail.backend.service.ContactService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.service.annotation.PutExchange;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    @Autowired
    private ContactService contactService;

    private String getCurrentUserName(Authentication authentication) {
        return authentication.getName();
    }

    @PostMapping
    public ResponseEntity<?> addContact(@RequestBody Contact contact, Authentication authentication) throws IOException {
        try{
            String username = getCurrentUserName(authentication);
            Contact savedContact = contactService.addContact(username, contact);
            log.info(String.valueOf(savedContact));
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Contact added successfully");
            response.put("contact", savedContact);

            log.info("Contact {} added by {}", savedContact.getId(), username);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            log.error("Invalid contact: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        } catch (IOException e) {
            log.error("Failed to add contact: ", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to add contact");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @PutMapping("/{contactId}")
    public ResponseEntity<?> updateContact(
            @PathVariable String contactId,
            @RequestBody Contact contact,
            Authentication authentication){
        try{
            String username = getCurrentUserName(authentication);
            Contact updatedContact = contactService.updateContact(username, contactId, contact);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Contact updated successfully");
            response.put("contact", updatedContact);
            log.info("Contact {} updated by {}", updatedContact.getId(), username);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Failed to update contact: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to update contact");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{contactId}")
    public ResponseEntity<?> deleteContact(
            @PathVariable String contactId,
            Authentication authentication){
        try{
            String username = getCurrentUserName(authentication);
            contactService.deleteContact(username, contactId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Contact deleted successfully");
            log.info("Contact {} deleted by {}", contactId, username);
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (IOException e) {
            log.error("Failed to delete contact: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to delete contact");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{contactId}")
    public ResponseEntity<?> getContact(@PathVariable String contactId, Authentication authentication) {
        try {
            String username = getCurrentUserName(authentication);
            Contact contact = contactService.getContact(username, contactId);

            return new ResponseEntity<>(contact, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Contact not found: {}", contactId);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Contact not found");
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        }
    }


    @GetMapping
    public ResponseEntity<?> listContacts(
            @RequestParam(required = false) String sortBy,
            Authentication authentication) {
        try {
            String username = getCurrentUserName(authentication);
            List<Contact> contacts = contactService.listContacts(username, sortBy);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("totalContacts", contacts.size());
            response.put("sortBy", sortBy);
            response.put("contacts", contacts);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Failed to list contacts: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to list contacts");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/search")
    public ResponseEntity<?> searchContacts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "all") String searchIn,
            @RequestParam(required = false) String sortBy,
            Authentication authentication) {
        try {
            String username = getCurrentUserName(authentication);
            List<Contact> results = contactService.searchContacts(username, keyword, searchIn, sortBy);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("keyword", keyword);
            response.put("searchIn", searchIn);
            response.put("sortBy", sortBy);
            response.put("totalResults", results.size());
            response.put("results", results);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Search failed: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Search failed");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/autocomplete")
    public ResponseEntity<?> autocomplete(
            @RequestParam String email,
            Authentication authentication) {
        try {
            String username = getCurrentUserName(authentication);
            List<Contact> matches = contactService.findContactsByEmail(username, email);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("prefix", email);
            response.put("matches", matches);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Autocomplete failed: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Autocomplete failed");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping("/count")
    public ResponseEntity<?> getContactCount(Authentication authentication) {
        try {
            String username = getCurrentUserName(authentication);
            int count = contactService.getContactCount(username);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", count);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Failed to get contact count: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to get contact count");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}
