package com.mail.backend.dps.command;

import com.mail.backend.model.Email;
import com.mail.backend.model.Filter;

public class MarkRead implements Action {

    @Override
    public Email execute(String username, Email email, Filter filter) throws Exception {
        email.setRead(true);
        return email;
    }
}
