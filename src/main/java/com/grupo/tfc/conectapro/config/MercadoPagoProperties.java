package com.grupo.tfc.conectapro.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "mercadopago")
public record MercadoPagoProperties(
        String accessToken,
        String urlSucesso,
        String urlFalha,
        String urlPendente,
        boolean sandbox
) {}
