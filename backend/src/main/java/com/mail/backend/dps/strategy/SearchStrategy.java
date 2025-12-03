package com.mail.backend.dps.strategy;

import com.mail.backend.model.Email;
import java.util.List;

public interface SearchStrategy {
    List<Email> search(List<Email> emails, String keyword);
}