package com.mail.backend.service;

import com.mail.backend.model.Users;
import com.mail.backend.model.UserPrincipal;
import com.mail.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class _UserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Users users = userRepo.findByUsername(username);

        if (users == null) {
            throw new UsernameNotFoundException(username+" not found");
        }

        return new UserPrincipal(users);
    }
}
