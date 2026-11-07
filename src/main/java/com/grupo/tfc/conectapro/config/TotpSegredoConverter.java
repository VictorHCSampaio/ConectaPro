package com.grupo.tfc.conectapro.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.jasypt.util.text.AES256TextEncryptor;

@Converter
public class TotpSegredoConverter implements AttributeConverter<String, String> {

    private AES256TextEncryptor encryptor() {
        String password = System.getenv("ENCRYPTION_KEY");
        if (password == null || password.isBlank()) {
            password = System.getProperty("ENCRYPTION_KEY");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalStateException("ENCRYPTION_KEY não configurada");
        }
        AES256TextEncryptor enc = new AES256TextEncryptor();
        enc.setPassword(password);
        return enc;
    }

    @Override
    public String convertToDatabaseColumn(String plaintext) {
        if (plaintext == null) return null;
        return encryptor().encrypt(plaintext);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        try {
            return encryptor().decrypt(dbData);
        } catch (Exception e) {
            return dbData;
        }
    }
}
