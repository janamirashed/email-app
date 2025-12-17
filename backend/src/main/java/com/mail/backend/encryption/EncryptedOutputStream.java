package com.mail.backend.encryption;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.io.OutputStream;
import java.security.SecureRandom;
import java.util.Base64;
import io.github.cdimascio.dotenv.Dotenv;

public class EncryptedOutputStream extends OutputStream {

    private final OutputStream out;
    private final Cipher cipher;
    private boolean initialized = false;
    private final SecretKeySpec secretKeySpec;

    public EncryptedOutputStream(OutputStream out) {
        this.out = out;
        try {
            Dotenv dotenv = Dotenv.load();
            byte[] secretKey = Base64.getDecoder().decode(dotenv.get("ATTACHMENT_ENCRYPTION_SECRET"));

            this.cipher = Cipher.getInstance("AES/GCM/NoPadding");
            this.secretKeySpec = new SecretKeySpec(secretKey, "AES");
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize Cipher", e);
        }
    }



    private void ensureInitialized() throws IOException {
        if (!initialized) {
            try {
                byte[] iv = new byte[12];
                new SecureRandom().nextBytes(iv);
                out.write(iv); // Prepend IV to the actual file

                GCMParameterSpec spec = new GCMParameterSpec(128, iv);
                cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec, spec);
                initialized = true;
            } catch (Exception e) {
                throw new IOException("Cipher initialization failed", e);
            }
        }
    }

    @Override
    public void write(int b) throws IOException {
        write(new byte[]{(byte) b}, 0, 1);
    }

    @Override
    public void write(byte[] b, int off, int len) throws IOException {
        ensureInitialized();
        byte[] buf = cipher.update(b, off, len);
        if (buf != null) {
            out.write(buf);
        }
    }

    @Override
    public void close() throws IOException {
        try {
            ensureInitialized();
            byte[] finalBuf = cipher.doFinal();
            if (finalBuf != null) {
                out.write(finalBuf);
            }
        } catch (Exception e) {
            throw new IOException("Cipher finalization failed", e);
        } finally {
            out.close();
        }
    }
}