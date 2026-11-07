package com.grupo.tfc.conectapro.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class TestEncryptionConfig {

    static {
        System.setProperty("ENCRYPTION_KEY", "VGVzdEVuY3J5cHRpb25LZXkzMkJ5dGVzTG9uZyEhISE=");
    }
}