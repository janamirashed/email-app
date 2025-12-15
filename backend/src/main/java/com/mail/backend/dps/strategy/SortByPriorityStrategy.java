package com.mail.backend.dps.strategy;

import com.mail.backend.model.Email;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

public class SortByPriorityStrategy implements SortStrategy {
    @Override
    public List<Email> sort(List<Email> emails) {

        Comparator<Email> comparator = Comparator.comparing(Email::getPriority).reversed().thenComparing(Email::getTimestamp).reversed();
        PriorityQueue<Email> pq = new PriorityQueue<>(comparator);

        pq.addAll(emails);

        List<Email> sorted = new ArrayList<>();
        while (!pq.isEmpty()) {
            sorted.add(pq.poll());
        }
        for (Email email : sorted) {
            System.out.println(sorted.indexOf(email));
        }
        return sorted;
    }
}