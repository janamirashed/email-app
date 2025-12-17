package encryption;

import io.github.cdimascio.dotenv.Dotenv;

import javax.crypto.Cipher;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.rmi.RemoteException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

public class EncryptedInputStream extends InputStream{

    private final InputStream stream;
    private final Cipher cipher;
    private final SecretKeySpec secretKeySpec;

    public EncryptedInputStream(InputStream stream) throws NoSuchPaddingException, NoSuchAlgorithmException {
        this.stream = stream;
        try {
            Dotenv dotenv = Dotenv.load();
            byte[] secretKey = Base64.getDecoder().decode(dotenv.get("ATTACHMENT_ENCRYPTION_SECRET"));
            this.cipher = Cipher.getInstance("AES/GCM/NoPadding");
            this.secretKeySpec = new SecretKeySpec(secretKey, "AES");
        }catch (NoSuchAlgorithmException | NoSuchPaddingException e) {
            throw new RuntimeException(e);
        }
    }
    @Override
    public int read() throws IOException {
        return 0;
    }

    @Override
    public long transferTo(OutputStream out) throws IOException {
        long size = 0L;
        byte[] buffer = new byte[1024];
        try {

            byte[] iv = new byte[12];
            int ivBytesRead = stream.readNBytes(iv, 0, 12);
            if (ivBytesRead < 12) {
                throw new IOException("File too short to contain a valid initialization vector");
            }

            GCMParameterSpec gcmSpec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec, gcmSpec);

            int bytesRead;
            while ((bytesRead = stream.read(buffer)) != -1) {
                byte[] encrypted = cipher.update(buffer, 0, bytesRead);
                if (encrypted != null) {
                    out.write(encrypted);
                }
                size += bytesRead;

            }
            byte[] finalBytes = cipher.doFinal();
            if (finalBytes != null){
                out.write(finalBytes);
            }
            return size;
        }
        catch (javax.crypto.AEADBadTagException e) {
            throw new IOException("Decryption failed: Data has been tampered with or wrong key used.", e);
        }
        catch (Exception e){
            throw new RemoteException();
        }
    }
}
