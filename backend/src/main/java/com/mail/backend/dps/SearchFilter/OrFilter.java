package com.mail.backend.dps.SearchFilter;

import com.mail.backend.model.Email;

import java.util.ArrayList;
import java.util.List;

public class OrFilter implements SearchFilter {
    private SearchFilter criteria1;
    private SearchFilter criteria2;

    public OrFilter(SearchFilter criteria1, SearchFilter criteria2) {
        this.criteria1 = criteria1;
        this.criteria2 = criteria2;
    }

    @Override
    public List<Email> meetCriteria(List<Email> emails) {
        List<Email> firstCriteriaItems = criteria1.meetCriteria(emails);
        List<Email> secondCriteriaItems = criteria2.meetCriteria(emails);
        //combine both ( union )
        for (Email email : secondCriteriaItems) {
            if (!firstCriteriaItems.contains(email)) {
                firstCriteriaItems.add(email);

            }
        }

        return firstCriteriaItems;
    }
}
