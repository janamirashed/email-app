package com.mail.backend.controller;
import com.mail.backend.model.Filter;
import com.mail.backend.service.FilterService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Controller
@RequestMapping("/api/filters")
public class FilterController {
    @Autowired
    private FilterService filterService;

    private String getCurrentUserName(Authentication authentication) {
        return authentication.getName();
    }

    @PostMapping
    public ResponseEntity<?> addFilter(@RequestBody Filter filter, Authentication authentication)
    {
        try{
        String username = getCurrentUserName(authentication);
        Filter savedFilter = filterService.addFilter(username, filter);
        log.info(String.valueOf(savedFilter));
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Filter added successfully");
        response.put("filter", savedFilter);

        log.info("filter {} added by {}", savedFilter.getId(), username);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    } catch (IllegalArgumentException e) {
        log.error("Invalid filter: {}", e.getMessage());
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("error", e.getMessage());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    } catch (IOException e) {
        log.error("Failed to add filter: ", e);
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("error", "Failed to add contact");
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    }

    @GetMapping
    public ResponseEntity<?> listFilters(Authentication authentication)
    {
        try {
            String username = getCurrentUserName(authentication);
            List<Filter> filters = filterService.listFilters(username);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("filters", filters);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Failed to list filters: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to list filters");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{filterId}")
    public ResponseEntity<?> updateFilter(@PathVariable String filterId, @RequestBody Filter filter, Authentication authentication) throws IOException {
        try {
            String username = getCurrentUserName(authentication);
            Filter updatedFilter = filterService.updateFilter(username,filterId,filter);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("filter updated successfully", updatedFilter);
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        catch (IOException e) {
            log.error("Failed to update filter: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to update filter");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @DeleteMapping("/{filterId}")
    public ResponseEntity<?> deleteFilter(@PathVariable String filterId, Authentication authentication) throws IOException {
        try {
            String username = getCurrentUserName(authentication);
            filterService.deleteFilter(username,filterId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("filter deleted successfully", filterId);
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        catch (IOException e) {
            log.error("Failed to delete filter: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Failed to delete filter");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
