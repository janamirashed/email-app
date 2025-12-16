package com.mail.backend.model;

import lombok.Data;

import java.util.List;
@Data
public class SSE {
    private String type;
    private List<String> to;

    public SSE(String type, List<String> to) {
        this.type = type;
        this.to = to;
    }
}
