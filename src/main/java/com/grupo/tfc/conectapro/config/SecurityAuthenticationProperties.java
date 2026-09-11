package com.grupo.tfc.conectapro.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "security.auth")
public record SecurityAuthenticationProperties(
        int maxTentativas,
        int tempoDuracao,
        TotpPropriedades totp
) {

    public record TotpPropriedades(String emissor){

    }

}
