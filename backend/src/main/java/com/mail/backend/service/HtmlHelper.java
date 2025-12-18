package com.mail.backend.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.safety.Safelist;

public class HtmlHelper {
    public static String extractPlainText(String htmlContent) {
        Document doc = Jsoup.parse(htmlContent);
        return doc.text();
    }
    public static String sanitizeHtml(String htmlContent) {
        Safelist emailSafelist = Safelist.relaxed()
                .addAttributes("table", "width", "cellspacing", "cellpadding", "border", "align")
                .addAttributes("td", "align", "valign", "width", "height")
                .addAttributes("img", "width", "height", "border", "style")
                .addAttributes(":all", "style")
                .addAttributes(":all", "data-ogsc")
                .addProtocols("img", "src", "http", "https")
                .addProtocols("a", "href", "http", "https", "mailto");
        htmlContent = Jsoup.clean(htmlContent, emailSafelist);
        return htmlContent;

    }
}
