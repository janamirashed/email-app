package com.mail.backend.dps.factory;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class FilterFactory {
    private final String matcher;
    public FilterFactory(String matcher) {
        this.matcher = matcher;
    }
    public boolean filter(String emailValue,String filteringValue) {
        return switch (matcher.toLowerCase()) {
            case "contains" -> emailValue.contains(filteringValue);
            case "startswith" -> emailValue.startsWith(filteringValue);
            case "endswith" -> emailValue.endsWith(filteringValue);
            case "exactly" -> emailValue.equals(filteringValue);
            default -> false;
        };
    }
}
