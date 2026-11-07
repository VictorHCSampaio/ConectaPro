package com.grupo.tfc.conectapro.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "security.jwt")
public record JwtProperties(
        String secret,
        long expiracaoMinutos,
        long preAuthExpiracaoMinutos
) {
}
