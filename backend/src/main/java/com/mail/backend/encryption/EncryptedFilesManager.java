package com.mail.backend.encryption;

import io.github.cdimascio.dotenv.Dotenv;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.crypto.Cipher;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

public class EncryptedFilesManager {

    private final Cipher cipher;
    private final SecretKeySpec secretKeySpec;
    private final boolean enabled;
    private ObjectMapper objectMapper;

    public EncryptedFilesManager (boolean enabled){
        this.enabled = enabled;
        this.objectMapper = new ObjectMapper();
//        System.out.println("Starting encrypted file manager");
        try {
            Dotenv dotenv = Dotenv.load();
            byte[] secretKey = Base64.getDecoder().decode(dotenv.get("EMAIL_ENCRYPTION_SECRET"));
            this.cipher = Cipher.getInstance("AES/GCM/NoPadding");
            this.secretKeySpec = new SecretKeySpec(secretKey, "AES");
        }catch (NoSuchAlgorithmException | NoSuchPaddingException e) {
            System.err.println("Error starting file manager");
            throw new RuntimeException(e);
        }
    }

    public void writeEncrypted(Path path, String str, OpenOption... options) throws Exception {
//        System.out.println("Writing Encrypted");
        String finalStr;
        if (enabled) {
            byte[] iv = new byte[12];
            new SecureRandom().nextBytes(iv);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec, gcmSpec);

            byte[] strBytes = str.getBytes(StandardCharsets.UTF_8);
            byte[] encryptedBytes = cipher.doFinal(strBytes); // Encrypts and adds the GCM tag

            Map<String, Object> map = new HashMap<>();
            map.put("iv", Base64.getEncoder().encodeToString(iv));
            map.put("encrypted", Base64.getEncoder().encodeToString(encryptedBytes));

            finalStr = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(map);
        } else {
            finalStr = str;
        }
        Files.writeString(path, finalStr, options);
    }
    public String readDecrypted(Path path) throws Exception {
//        System.out.println("Reading Decrypted");
        String finalStr;
        String fileStr = Files.readString(path);
//        System.out.println(fileStr);
        if (enabled) {
            Map<String, String> map = objectMapper.readValue(fileStr.trim(), Map.class);

            byte[] iv = Base64.getDecoder().decode(map.get("iv"));

            GCMParameterSpec gcmSpec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec, gcmSpec);

            byte[] encryptedBytes = Base64.getDecoder().decode(map.get("encrypted"));
            byte[] decryptedBytes = cipher.doFinal(encryptedBytes);

            finalStr = new String(decryptedBytes, StandardCharsets.UTF_8);

        }else {
            finalStr = fileStr;
        }
//        System.out.println(finalStr);
        return finalStr;
    }
}
