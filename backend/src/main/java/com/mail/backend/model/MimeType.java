package com.mail.backend.model;


import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum MimeType {

    // --- Document and Text Types ---

    /** Plain text data. */
    TEXT_PLAIN("text/plain"),
    /** Comma-separated values. */
    TEXT_CSV("text/csv"),
    /** HTML documents. */
    TEXT_HTML("text/html"),
    /** Cascading Style Sheets. */
    TEXT_CSS("text/css"),
    /** Adobe Portable Document Format. */
    APPLICATION_PDF("application/pdf"),
    /** Older Microsoft Word Document. */
    APPLICATION_MSWORD("application/msword"),
    /** Microsoft Word Document (Open XML). */
    APPLICATION_DOCX("application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
    /** Older Microsoft Excel Spreadsheet. */
    APPLICATION_MSEXCEL("application/vnd.ms-excel"),
    /** Microsoft Excel Spreadsheet (Open XML). */
    APPLICATION_XLSX("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
    /** Older Microsoft PowerPoint Presentation. */
    APPLICATION_MSPOWERPOINT("application/vnd.ms-powerpoint"),
    /** Microsoft PowerPoint Presentation (Open XML). */
    APPLICATION_PPTX("application/vnd.openxmlformats-officedocument.presentationml.presentation"),

    // --- Image Types ---

    /** JPEG image format. */
    IMAGE_JPEG("image/jpeg"),
    /** PNG image format. */
    IMAGE_PNG("image/png"),
    /** GIF image format. */
    IMAGE_GIF("image/gif"),
    /** WebP image format. */
    IMAGE_WEBP("image/webp"),
    /** Scalable Vector Graphics (SVG). */
    IMAGE_SVG("image/svg+xml"),
    /** TIFF image format. */
    IMAGE_TIFF("image/tiff"),

    // --- Compressed and Archive Types ---

    /** ZIP archive format. */
    APPLICATION_ZIP("application/zip"),
    /** RAR compressed archive. */
    APPLICATION_RAR("application/x-rar-compressed"),
    /** 7z compressed archive. */
    APPLICATION_7Z("application/x-7z-compressed"),
    /** TAR archive format. */
    APPLICATION_TAR("application/x-tar"),
    /** GZip compressed file. */
    APPLICATION_GZIP("application/gzip"),

    // --- Audio and Video Types ---

    /** MP3 audio format. */
    AUDIO_MPEG("audio/mpeg"),
    /** WAVE audio format. */
    AUDIO_WAV("audio/wav"),
    /** OGG audio format. */
    AUDIO_OGG("audio/ogg"),
    /** MP4 video format. */
    VIDEO_MP4("video/mp4"),
    /** QuickTime video format. */
    VIDEO_QUICKTIME("video/quicktime"),
    /** AVI video format. */
    VIDEO_AVI("video/x-msvideo"),

    // --- Application and Data Types ---

    /** JavaScript Object Notation. */
    APPLICATION_JSON("application/json"),
    /** Extensible Markup Language. */
    APPLICATION_XML("application/xml"),
    /** Generic binary data (used for unknown file types). */
    APPLICATION_OCTET_STREAM("application/octet-stream");


    @JsonValue
    private final String type;

    /**
     * Private constructor to assign the MIME type string.
     * @param type The standard MIME type string.
     */

    @JsonCreator
    public static MimeType fromValue(String type) {
        // Iterate over all enum constants
        for (MimeType mimeType : MimeType.values()) {
            if (mimeType.type.equalsIgnoreCase(type)) {
                return mimeType;
            }
        }
        return APPLICATION_OCTET_STREAM;
    }

    MimeType(String type) {
        this.type = type;
    }

    /**
     * Returns the standard MIME type string for this enum constant.
     * @return The MIME type string.
     */
    @Override
    public String toString() {
        return type;
    }

    /**
     * Example usage of the enum (optional helper method to demonstrate functionality).
     * @param extension The file extension (e.g., "pdf").
     * @return The matching MimeType or null if not found.
     */
    public static MimeType fromFileExtension(String extension) {
        String ext = extension.toLowerCase();
        return switch (ext) {
            // Text and Document Types
            case "txt" -> TEXT_PLAIN;
            case "csv" -> TEXT_CSV;
            case "html" -> TEXT_HTML;
            case "css" -> TEXT_CSS;
            case "pdf" -> APPLICATION_PDF;
            case "doc" -> APPLICATION_MSWORD;
            case "docx" -> APPLICATION_DOCX;
            case "xls" -> APPLICATION_MSEXCEL;
            case "xlsx" -> APPLICATION_XLSX;
            case "ppt" -> APPLICATION_MSPOWERPOINT;
            case "pptx" -> APPLICATION_PPTX;

            // Image Types
            case "jpg", "jpeg" -> IMAGE_JPEG;
            case "png" -> IMAGE_PNG;
            case "gif" -> IMAGE_GIF;
            case "webp" -> IMAGE_WEBP;
            case "svg" -> IMAGE_SVG;
            case "tif", "tiff" -> IMAGE_TIFF;

            // Compressed and Archive Types
            case "zip" -> APPLICATION_ZIP;
            case "rar" -> APPLICATION_RAR;
            case "7z" -> APPLICATION_7Z;
            case "tar" -> APPLICATION_TAR;
            case "gz" -> APPLICATION_GZIP;

            // Audio and Video Types
            case "mp3" -> AUDIO_MPEG;
            case "wav" -> AUDIO_WAV;
            case "ogg" -> AUDIO_OGG;
            case "mp4" -> VIDEO_MP4;
            case "mov" -> VIDEO_QUICKTIME;
            case "avi" -> VIDEO_AVI;

            // Application and Data Types
            case "json" -> APPLICATION_JSON;
            case "xml" -> APPLICATION_XML;

            default -> APPLICATION_OCTET_STREAM; // Fallback or handle unknown types
        };
    }


    public static String toFileExtension(MimeType mimeType) {
        if (mimeType == null) return null;

        return switch (mimeType) {
            // Text and Document Types
            case TEXT_PLAIN -> "txt";
            case TEXT_CSV -> "csv";
            case TEXT_HTML -> "html";
            case TEXT_CSS -> "css";
            case APPLICATION_PDF -> "pdf";
            case APPLICATION_MSWORD -> "doc";
            case APPLICATION_DOCX -> "docx";
            case APPLICATION_MSEXCEL -> "xls";
            case APPLICATION_XLSX -> "xlsx";
            case APPLICATION_MSPOWERPOINT -> "ppt";
            case APPLICATION_PPTX -> "pptx";

            // Image Types
            case IMAGE_JPEG -> "jpg";
            case IMAGE_PNG -> "png";
            case IMAGE_GIF -> "gif";
            case IMAGE_WEBP -> "webp";
            case IMAGE_SVG -> "svg";
            case IMAGE_TIFF -> "tif";

            // Compressed and Archive Types
            case APPLICATION_ZIP -> "zip";
            case APPLICATION_RAR -> "rar";
            case APPLICATION_7Z -> "7z";
            case APPLICATION_TAR -> "tar";
            case APPLICATION_GZIP -> "gz";

            // Audio and Video Types
            case AUDIO_MPEG -> "mp3";
            case AUDIO_WAV -> "wav";
            case AUDIO_OGG -> "ogg";
            case VIDEO_MP4 -> "mp4";
            case VIDEO_QUICKTIME -> "mov";
            case VIDEO_AVI -> "avi";

            // Application and Data Types
            case APPLICATION_JSON -> "json";
            case APPLICATION_XML -> "xml";

            default -> null; // unknown type
        };
    }

}