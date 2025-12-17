package com.mail.backend.dps.command;

import com.mail.backend.model.Email;
import com.mail.backend.model.Filter;


public class Forward implements Action {
    
    @Override
    public Email execute(String username, Email email, Filter filter) throws Exception {
        email.setForwardedTo(filter.getForwardedTo());
        return email;
    }
}
