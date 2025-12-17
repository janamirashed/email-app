package com.mail.backend.dps.command;

import com.mail.backend.model.Email;
import com.mail.backend.model.Filter;

public class Move implements Action {
    @Override
    public Email execute(Email email, Filter filter) {
        email.setFolder(filter.getNewFolder());
        return email;
    }
}