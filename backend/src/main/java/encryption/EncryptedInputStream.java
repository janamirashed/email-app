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
    private final byte[] secretKey;

    public EncryptedInputStream(InputStream stream){
        this.stream = stream;
        Dotenv dotenv = Dotenv.load();
        secretKey = Base64.getDecoder().decode(dotenv.get("ENCRYPTION_SECRET"));
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
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");

            byte[] iv = new byte[12];
            int ivBytesRead = stream.readNBytes(iv, 0, 12);
            if (ivBytesRead < 12) {
                throw new IOException("File too short to contain a valid initialization vector");
            }

            SecretKeySpec keySpec = new SecretKeySpec(secretKey, "AES");
            GCMParameterSpec gcmSpec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, gcmSpec);

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
        catch (NoSuchAlgorithmException | NoSuchPaddingException e) {
            throw new RuntimeException(e);
        }
        catch (javax.crypto.AEADBadTagException e) {
            throw new IOException("Decryption failed: Data has been tampered with or wrong key used.", e);
        }
        catch (Exception e){
            throw new RemoteException();
        }
    }
}
