package com.mail.backend.dps.command;

import com.mail.backend.model.Email;
import com.mail.backend.model.Filter;

import java.time.LocalDateTime;

public class Delete implements Action{

    @Override
    public Email execute(String username, Email email, Filter filter) throws Exception {
        email.setFolder("trash");
        email.setDeletedAt(LocalDateTime.now());
        return email;
    }
}
