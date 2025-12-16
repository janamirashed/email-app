package com.mail.backend.dps.factory;
import com.mail.backend.model.Email;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
public class FilterFactory {
    private final String matcher;
    public FilterFactory(String matcher) {
        this.matcher = matcher;
    }
    public boolean filter(Object emailValue,String filteringValue) {
        if (emailValue == null || filteringValue == null) {
            return false;
        }

        //complex matcher
        //'filteringValue' -->  "key:val;key:val"
        if ("complex".equalsIgnoreCase(matcher) && emailValue instanceof Email) {
            return matchComplex((Email) emailValue, filteringValue);
        }

        if (emailValue instanceof List<?>) {
            List<?> list = (List<?>) emailValue;
            return list.stream()
                    .map(Object::toString)
                    .anyMatch(item -> matchString(item, filteringValue));
        }
        return matchString(emailValue.toString(), filteringValue);
    }


    private boolean matchComplex(Email email, String rules) {
        String[] conditions = rules.split(";");

        for (String condition : conditions) {
            String[] parts = condition.split(":", 2);
            if (parts.length < 2) continue;

            String key = parts[0].trim().toLowerCase();
            String val = parts[1].trim().toLowerCase();
            String target = "";

            switch (key) {
                case "from": target = email.getFrom(); break;
                case "subject": target = email.getSubject(); break;
                case "body": target = email.getBody(); break;
                case "to":
                case "receiver":
                    if (email.getTo() != null && email.getTo().stream().noneMatch(t -> t.toLowerCase().contains(val))) {
                        return false;
                    }
                    continue;
                default: continue;
            }

            // Standard contains check for strings
            if (target == null || !target.toLowerCase().contains(val)) {
                return false;
            }
        }
        return true;
    }



    private boolean matchString(String text, String query) {
        String lowerText = text.toLowerCase();
        String lowerQuery = query.toLowerCase();

        return switch (matcher.toLowerCase()) {
            case "contains" -> lowerText.contains(lowerQuery);
            case "startswith" -> lowerText.startsWith(lowerQuery);
            case "endswith" -> lowerText.endsWith(lowerQuery);
            case "exactly" -> lowerText.equals(lowerQuery);
            default -> false;
        };
    }
}
