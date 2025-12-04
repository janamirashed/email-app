package com.mail.backend.model;


import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class Contact {
    private String id;
    private String name;
    private String email;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Contact(){
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
