package com.mail.backend.dps.strategy;

import com.mail.backend.model.Email;

import java.util.ArrayList;
import java.util.List;
import java.util.PriorityQueue;

public class SortByPriorityStrategy implements SortStrategy {
    @Override
    public List<Email> sort(List<Email> emails) {

        PriorityQueue<Email> pq = new PriorityQueue<>(
                (a, b) -> Integer.compare(a.getPriority(), b.getPriority())
        );

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