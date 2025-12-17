package com.mail.backend.dps.command;

import com.mail.backend.model.Email;
import com.mail.backend.model.Filter;

public interface Action {
    Email execute(Email email, Filter filter) throws Exception;
}
