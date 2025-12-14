package com.mail.backend.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

public class PlainTextExtractor {
    public static String extractPlainText(String htmlContent) {
        Document doc = Jsoup.parse(htmlContent);
        return doc.text();
    }
}
