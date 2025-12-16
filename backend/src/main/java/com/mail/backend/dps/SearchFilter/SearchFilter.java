package com.mail.backend.dps.SearchFilter;

import com.mail.backend.model.Email;

import java.util.List;

public interface SearchFilter {
    List<Email> meetCriteria(List<Email> emails);
}
