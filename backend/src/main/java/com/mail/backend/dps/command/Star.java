package com.mail.backend.dps.command;

import com.mail.backend.model.Email;
import com.mail.backend.model.Filter;

public class Star implements Action {

    @Override
    public Email execute(Email email, Filter filter) throws Exception {
        email.setStarred(true);
        return email;
    }
}
