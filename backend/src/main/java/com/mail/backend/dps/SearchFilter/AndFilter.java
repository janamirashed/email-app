package com.mail.backend.dps.SearchFilter;

import com.mail.backend.model.Email;

import java.util.ArrayList;
import java.util.List;

public class AndFilter implements SearchFilter {
    private SearchFilter filter1;
    private SearchFilter filter2;

    public AndFilter(SearchFilter filter1, SearchFilter filter2) {
        System.out.println("Building AndFilter with: " + filter2.getClass().getSimpleName());
        this.filter1 = filter1;
        this.filter2 = filter2;
    }
    public List<Email> meetCriteria(List<Email> emails) {
        List<Email> firstCriteria = filter1.meetCriteria(emails);
        return filter2.meetCriteria(firstCriteria);
    }
}
