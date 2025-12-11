package com.mail.backend.controller;

import com.mail.backend.dto.JWTResponse;
import com.mail.backend.model.Users;
import com.mail.backend.service.JWTService;
import com.mail.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.mail.backend.repository.EmailRepository;
import java.io.IOException;

@RestController
@CrossOrigin(origins = "http://localhost:4200/")
@RequestMapping("/account")
public class AccountController {
    @Autowired
    private UserService userService;

    @Autowired
    private JWTService jwtService;
    @Autowired
    private EmailRepository emailRepository;

    @PostMapping("/register")
    public ResponseEntity<HttpStatus> register(@RequestBody Users users) {
        if(!(userService.existsByUsername(users.getUsername()))) {
            users.setEmail(users.getUsername()+"@jaryn.com");
            userService.save(users);
            try {
                emailRepository.createDirectories(users.getUsername());
            } catch (IOException e) {
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
            return new ResponseEntity<>(HttpStatus.CREATED);
        }

        return new ResponseEntity<>(HttpStatus.CONFLICT);
    }

    @PostMapping("/login")
    public ResponseEntity<JWTResponse> login(@RequestBody Users users) {
        if((userService.existsByUsername(users.getUsername()))) {
            String JwtToken=userService.verify(users);
            if(!(JwtToken.equals("Fail"))) {
                try {
                    emailRepository.createDirectories(users.getUsername());
                } catch (IOException e) {
                    System.err.println("Error creating directories on login: " + e.getMessage());
                }
                return new ResponseEntity<>(new JWTResponse(JwtToken),HttpStatus.OK);
            }
            else{
                System.out.println("Invalid Credentials");
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
        }
        System.out.println("Invalid Credentials2");
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

}