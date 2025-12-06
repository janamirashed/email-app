package com.mail.backend.dps.factory;

import com.mail.backend.model.Folder;
import lombok.extern.slf4j.Slf4j;

// Abstract Folder Factory for creating custom folders
@Slf4j
public abstract class FolderFactory {
    public abstract Folder createFolder(String folderName);

    protected boolean validateFolderName(String folderName) {
        if (folderName == null || folderName.trim().isEmpty()) {
            return false;
        }
        if (folderName.length() > 50) {
            return false;
        }
        // Ensures the folder name is valid and does not contain special or unsafe characters
        return folderName.matches("^[a-zA-Z0-9\\s_-]+$");
    }
}
