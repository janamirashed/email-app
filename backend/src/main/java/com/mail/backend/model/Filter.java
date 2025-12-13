package com.mail.backend.model;

import lombok.Data;

@Data
public class Filter {
    String id;
    String name;
    String property;
    String matcher;
    String value;
    String action;
    String newFolder;
}
