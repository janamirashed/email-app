package com.example.backend.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.CollectionType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Repository
public class JsonRepository {

    private final String DATA_DIR = "data";
    private final String EMAILS_FILE = "emails.json";
    private final String METADATA_FILE = "metadata.json";
    private final String INDEX_FILE = "index.json";

    private final ObjectMapper objectMapper;

    // Singleton-like cache for indices
    private final Map<String, Map<String, Object>> indexCache = new ConcurrentHashMap<>();

    public JsonRepository() {
        this.objectMapper = new ObjectMapper();
        createDataDirectory();
        loadIndexFromCache();
    }

    // Create data directory if it doesn't exist
    private void createDataDirectory() {
        try {
            Files.createDirectories(Paths.get(DATA_DIR));
        } catch (IOException e) {
            log.error("Failed to create data directory", e);
        }
    }

    // Load index cache from index.json file
    private void loadIndexFromCache() {
        try {
            Path indexPath = Paths.get(DATA_DIR, INDEX_FILE);
            if (Files.exists(indexPath)) {
                String content = new String(Files.readAllBytes(indexPath));
                indexCache.clear();
                Map<String, Map<String, Object>> index =
                        objectMapper.readValue(content, new com.fasterxml.jackson.core.type.TypeReference<>() {});
                indexCache.putAll(index);
                log.info("Index cache loaded successfully");
            }
        } catch (IOException e) {
            log.warn("Failed to load index cache, starting fresh", e);
        }
    }

    // Save index cache to index.json file
    private void saveIndexToCache() {
        try {
            Path indexPath = Paths.get(DATA_DIR, INDEX_FILE);
            String jsonContent = objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValueAsString(indexCache);
            Files.write(indexPath, jsonContent.getBytes());
        } catch (IOException e) {
            log.error("Failed to save index cache", e);
        }
    }

     // Get all emails from emails.json
    public <T> List<T> readAllEmails(Class<T> type) {
        try {
            Path path = Paths.get(DATA_DIR, EMAILS_FILE);
            if (!Files.exists(path)) {
                return new ArrayList<>();
            }
            String content = new String(Files.readAllBytes(path));
            CollectionType listType = objectMapper.getTypeFactory()
                    .constructCollectionType(List.class, type);
            return objectMapper.readValue(content, listType);
        } catch (IOException e) {
            log.error("Failed to read emails", e);
            return new ArrayList<>();
        }
    }

     // Get all metadata from metadata.json
    public <T> List<T> readAllMetadata(Class<T> type) {
        try {
            Path path = Paths.get(DATA_DIR, METADATA_FILE);
            if (!Files.exists(path)) {
                return new ArrayList<>();
            }
            String content = new String(Files.readAllBytes(path));
            CollectionType listType = objectMapper.getTypeFactory()
                    .constructCollectionType(List.class, type);
            return objectMapper.readValue(content, listType);
        } catch (IOException e) {
            log.error("Failed to read metadata", e);
            return new ArrayList<>();
        }
    }


     // Write emails to emails.json
    public <T> void writeEmails(List<T> emails) {
        try {
            Path path = Paths.get(DATA_DIR, EMAILS_FILE);
            String jsonContent = objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValueAsString(emails);
            Files.write(path, jsonContent.getBytes());
        } catch (IOException e) {
            log.error("Failed to write emails", e);
        }
    }

    // Write metadata to metadata.json
    public <T> void writeMetadata(List<T> metadata) {
        try {
            Path path = Paths.get(DATA_DIR, METADATA_FILE);
            String jsonContent = objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValueAsString(metadata);
            Files.write(path, jsonContent.getBytes());
        } catch (IOException e) {
            log.error("Failed to write metadata", e);
        }
    }

    // Add to index cache - used for quick lookups
    public void indexAdd(String indexName, String key, Object value) {
        Map<String, Object> index = indexCache.computeIfAbsent(indexName, k -> new ConcurrentHashMap<>());
        index.put(key, value);
        saveIndexToCache();
    }

    // Get from index cache
    public Object indexGet(String indexName, String key) {
        Map<String, Object> index = indexCache.get(indexName);
        return index != null ? index.get(key) : null;
    }

    // Search in index cache
    public List<String> indexSearch(String indexName, String key) {
        Map<String, Object> index = indexCache.get(indexName);
        if (index != null && index.containsKey(key)) {
            Object value = index.get(key);
            if (value instanceof List) {
                return (List<String>) value;
            }
        }
        return new ArrayList<>();
    }

    // Remove from index cache
    public void indexRemove(String indexName, String key) {
        Map<String, Object> index = indexCache.get(indexName);
        if (index != null) {
            index.remove(key);
            saveIndexToCache();
        }
    }

    // Get entire index
    public Map<String, Object> getIndex(String indexName) {
        return indexCache.getOrDefault(indexName, new HashMap<>());
    }

     // Clear all indices
    public void clearIndex(String indexName) {
        indexCache.remove(indexName);
        saveIndexToCache();
    }
}