package com.mail.backend.service;

import com.mail.backend.dps.command.*;
import com.mail.backend.dps.factory.FilterFactory;
import com.mail.backend.model.Email;
import com.mail.backend.model.Filter;
import com.mail.backend.repository.FilterRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import static com.mail.backend.service.PlainTextExtractor.extractPlainText;

@Service
@Slf4j
public class FilterService {
    @Autowired
    private FilterRepository filterRepository;

    public Filter addFilter(String username,Filter filter) throws IOException {
        if (filter.getProperty() == null || filter.getProperty().trim().isEmpty()) {
            throw new IllegalArgumentException("filter property is empty");
        }
        if (filter.getValue() == null || filter.getValue().trim().isEmpty()) {
            throw new IllegalArgumentException("filter Value is empty");
        }
        if (filter.getMatcher() == null || filter.getMatcher().trim().isEmpty()) {
            throw new IllegalArgumentException("filter Matcher is empty");
        }
        if (filter.getAction().equals("move")&&(filter.getNewFolder() == null || filter.getNewFolder().trim().isEmpty())) {
            throw new IllegalArgumentException("filter property is empty");
        }
        if (filter.getId() == null||filter.getId().trim().isEmpty()) {
            filter.setId("filter-" + UUID.randomUUID().toString().substring(0, 8));
        }
        filterRepository.saveFilter(username,filter);
        log.info("Filter {} added for user {}", filter.getId(), username);
        return filter;

    }
    public List<Filter> listFilters(String username) throws IOException {
        return filterRepository.filterList(username);
    }

    public Filter updateFilter(String username,String filterId,Filter updatedFilter) throws IOException {
        if(!filterRepository.filterExists(username,filterId)){
            throw new IllegalArgumentException("filter does not exist");
        }
        Filter filter = filterRepository.getFilter(username,filterId);
        filter.setName(updatedFilter.getName());
        filter.setProperty(updatedFilter.getProperty());
        filter.setValue(updatedFilter.getValue());
        filter.setMatcher(updatedFilter.getMatcher());
        filter.setAction(updatedFilter.getAction());
        filter.setNewFolder(updatedFilter.getNewFolder());
        filter.setForwardedTo(updatedFilter.getForwardedTo());
        filterRepository.saveFilter(username,filter);
        log.info("Filter {} updated for user {}", filter.getId(), username);
        return filter;
    }

    public void deleteFilter (String username, String filterId) throws IOException {
        if (!filterRepository.filterExists(username, filterId)) {
            throw new IOException("Filter not found: " + filterId);
        }
        filterRepository.deleteFilter(username, filterId);
        log.info("Filter {} deleted for user {}", filterId, username);
    }

    private static final Map<String, Function<Email, Object>> PROPERTY_EXTRACTORS = Map.of(
            "subject", Email::getSubject,
            "body", Email::getBody,
            "from", Email::getFrom,
            "to", Email::getTo,
            "receiver", Email::getTo,
            "composite", email -> email
    );
    private static final Map<String, Action> ACTIONS = Map.of(
            "move", new Move(),
            "star", new Star(),
            "delete", new Delete(),
            "markread", new MarkRead(),
            "forward", new Forward()
    );

    public Email applyFilters(String username, Email email) throws Exception {
        List<Filter> filterList = this.listFilters(username);
        for (Filter filter : filterList) {
            Function<Email, Object> extractor =
                    PROPERTY_EXTRACTORS.get(filter.getProperty().toLowerCase());
            if (extractor == null) continue;
            Object rawValue = extractor.apply(email);

            if ("body".equalsIgnoreCase(filter.getProperty()) && rawValue instanceof String) {
                rawValue = extractPlainText((String) rawValue);
            }

            FilterFactory factory = new FilterFactory(filter.getMatcher());

            if (factory.filter(rawValue, filter.getValue())) {
                Action action = ACTIONS.get(filter.getAction().toLowerCase());

                if (action != null) {
                    return action.execute(username, email, filter);
                }
            }

        }
        return email;
    }


}
