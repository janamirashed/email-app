package com.mail.backend.controller;

import com.mail.backend.dto.JWTResponse;
import com.mail.backend.model.Users;
import com.mail.backend.service.JWTService;
import com.mail.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/account")
public class AccountController {
    @Autowired
    private UserService userService;

    @Autowired
    private JWTService jwtService;

    @PostMapping("/register")
    public ResponseEntity<HttpStatus> register(@RequestBody Users users) {
        if(!(userService.existsByUsername(users.getUsername()))) {
            users.setEmail(users.getUsername()+"@jaryn.com");
            userService.save(users);
            return new ResponseEntity<>(HttpStatus.CREATED);
        }

        return new ResponseEntity<>(HttpStatus.CONFLICT);
    }

    @PostMapping("/login")
    public ResponseEntity<JWTResponse> login(@RequestBody Users users) {
        if((userService.existsByUsername(users.getUsername()))) {
            String JwtToken=userService.verify(users);
            if(!(JwtToken.equals("Fail"))) {
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