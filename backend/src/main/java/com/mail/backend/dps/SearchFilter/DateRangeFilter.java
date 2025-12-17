package com.mail.backend.dps.SearchFilter;

import com.mail.backend.model.Email;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

public class DateRangeFilter implements SearchFilter {
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;

    public DateRangeFilter(String startDateStr, String endDateStr) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        if (startDateStr != null && !startDateStr.isEmpty()) {
            this.startDateTime = LocalDate.parse(startDateStr, formatter).atStartOfDay();
        } else {
            this.startDateTime = LocalDateTime.MIN;
        }

        if (endDateStr != null && !endDateStr.isEmpty()) {
            this.endDateTime = LocalDate.parse(endDateStr, formatter).atTime(LocalTime.MAX);
        } else {
            this.endDateTime = LocalDateTime.MAX;
        }
    }

    @Override
    public List<Email> meetCriteria(List<Email> emails) {
        System.out.println("--- DateRangeFilter Debug ---");
        System.out.println("Range: " + startDateTime + " TO " + endDateTime);

        return emails.stream()
                .filter(email -> {
                    if (email.getTimestamp() == null) {
                        System.out.println("FAIL: Email " + email.getMessageId() + " has NULL timestamp");
                        return false;
                    }

                    boolean isAfterStart = email.getTimestamp().isAfter(startDateTime) || email.getTimestamp().equals(startDateTime);
                    boolean isBeforeEnd = email.getTimestamp().isBefore(endDateTime) || email.getTimestamp().equals(endDateTime);

                    System.out.println("Checking " + email.getTimestamp() + " -> " + (isAfterStart && isBeforeEnd));

                    return isAfterStart && isBeforeEnd;
                })
                .collect(Collectors.toList());
    }
}