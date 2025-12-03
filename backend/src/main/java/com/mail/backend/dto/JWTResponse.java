package com.mail.backend.dto;
import lombok.Data;

@Data
public class JWTResponse {
    public JWTResponse(String token) {
        Token = token;
    }

    private String Token;
}
