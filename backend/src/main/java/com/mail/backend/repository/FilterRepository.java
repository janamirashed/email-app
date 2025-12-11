package com.mail.backend.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.mail.backend.model.Filter;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

@Slf4j
@Repository
public class FilterRepository {
    @Getter
    @Value("${mail.filter-root:data/filters}")
    private String filterRoot;
    private final ObjectMapper objectMapper;

    public FilterRepository() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    public void createDirectory(String username) throws IOException {
        Files.createDirectories(Paths.get(filterRoot + "/" + username));
    }

    public void saveFilter(String username, Filter filter) throws IOException {
        createDirectory(username);
        String filterJson = objectMapper.writerWithDefaultPrettyPrinter()
                .writeValueAsString(filter);
        Files.writeString(
                Paths.get(filterRoot + "/" + username,
                        filter.getId()+".json"),
                        filterJson,
                         StandardOpenOption.CREATE,
                         StandardOpenOption.TRUNCATE_EXISTING
                );

        log.info("Saved filter {}",filter.getId());
    }

    public Filter getFilter(String username,String filterId) throws IOException {
        Path path = Paths.get(filterRoot + "/" + username,
                filterId+".json");
        if (!Files.exists(path)) {
            throw new IOException("Filter not found: " + filterId);
        }

        String filterJson = Files.readString(path);
        return objectMapper.readValue(filterJson, Filter.class);
    }

    public void deleteFilter(String username, String filterId) throws IOException {
        Path filterPath = Paths.get(filterRoot + "/" + username).resolve(filterId + ".json");
        if(!Files.exists(filterPath)){
            throw new IOException("Filter not found: " + filterId);
        }
        Files.delete(filterPath);
        log.info("Deleted Filter {} for user {} ", filterId, username);
    }

public List<Filter> filterList(String username) throws IOException {
    Path filterPath = Paths.get(filterRoot + "/" + username);
        if(!Files.exists(filterPath)){
        return new ArrayList<>();
    }

    try(Stream<Path> files = Files.list(filterPath)){
        return files
                .filter(p -> p.toString().endsWith(".json"))
                .map(p -> {
                    try{
                        String json = Files.readString(p);
                        return objectMapper.readValue(json, Filter.class);
                    }catch(IOException e){
                        log.error("Failed to read filter: {} ", p, e);
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .toList();
    }
}


    public boolean filterExists(String username, String filterId) {
        Path path = Paths.get(filterRoot + "/" + username,
                filterId+".json");
        return Files.exists(path);
    }
}
