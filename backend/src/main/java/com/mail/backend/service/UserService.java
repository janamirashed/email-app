package com.mail.backend.service;


import com.mail.backend.model.Users;
import com.mail.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private BCryptPasswordEncoder PasswordEncoder= new BCryptPasswordEncoder(12);

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private JWTService jwtService;

    public Users findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Users findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public Boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public Users save(Users users) {
        users.setPassword(PasswordEncoder.encode(users.getPassword()));
        return userRepository.save(users);
    }

    public String verify(Users users) {
            Authentication authentication = authManager.authenticate(new UsernamePasswordAuthenticationToken(users.getUsername(), users.getPassword()));
        if (authentication.isAuthenticated()) {
            return jwtService.generateToken(users.getUsername());
        } else {
            return "fail";
        }
    }
//    public void deleteById(Long id) {
//        userRepository.deleteById(id);
//    }
}
