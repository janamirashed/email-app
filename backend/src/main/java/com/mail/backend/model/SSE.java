package com.mail.backend.model;

import lombok.Data;

import java.util.List;
@Data
public class SSE {
    private String type;
    private String token;
    private List<String> to;

    public SSE(String type, String token, List<String> to) {
        this.type = type;
        this.token = token;
        this.to = to;
    }
}
