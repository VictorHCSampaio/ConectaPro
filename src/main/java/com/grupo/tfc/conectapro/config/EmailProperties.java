package com.grupo.tfc.conectapro.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.mail")
public record EmailProperties(String from, ResetProperties reset, String frontendBaseUrl) {
    public record ResetProperties(String subject, int expiracaoMinutos) {

    }
}