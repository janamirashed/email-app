package com.mail.backend.dps.factory;

import com.mail.backend.model.Folder;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class CustomFolderFactory extends FolderFactory {

    @Override
    public Folder createFolder(String folderName) {
        if (!validateFolderName(folderName)) {
            throw new IllegalArgumentException("Invalid folder name: " + folderName);
        }

        Folder folder = new Folder();
        folder.setName(folderName);
        folder.setType("CUSTOM");
        folder.setEditable(true);
        folder.setEmailCount(0);
        folder.setUnreadCount(0);

        log.info("Created custom folder metadata: {}", folderName);
        return folder;
    }
}
