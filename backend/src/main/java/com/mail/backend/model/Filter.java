package com.mail.backend.model;

import lombok.Data;

import java.util.List;

@Data
public class Filter {
    private String id;
    private String name;
    private String property;
    private String matcher;
    private String value;
    private String action;
    private String newFolder;
    private List<String> forwardedTo;
}
