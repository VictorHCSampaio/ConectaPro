package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.config.SecurityAuthenticationProperties;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorConfig;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class TotpService {

    private final GoogleAuthenticator googleAuthenticator;
    private final SecurityAuthenticationProperties securityAuthentication;

    @Autowired
    public TotpService(SecurityAuthenticationProperties securityAuthentication) {
        GoogleAuthenticatorConfig config = new GoogleAuthenticatorConfig.GoogleAuthenticatorConfigBuilder()
                .setWindowSize(1)
                .build();
        this.googleAuthenticator = new GoogleAuthenticator(config);
        this.securityAuthentication = securityAuthentication;
    }

    public String secretGenerator(){
        GoogleAuthenticatorKey key = googleAuthenticator.createCredentials();
        return key.getKey();
    }

    public String qrUriGenerator(String email, String secret){
        String emissor = securityAuthentication.totp().emissor();
        String label = emissor + ":" + email;
        String encodedLabel = URLEncoder.encode(label, StandardCharsets.UTF_8);
        String encodedEmissor = URLEncoder.encode(emissor, StandardCharsets.UTF_8);
        String qrUri = "otpauth://totp/" + encodedLabel + "?secret=" + secret + "&issuer=" + encodedEmissor;
        System.out.println(qrUri);
        return qrUri;
    }

    public boolean verifyCode(String secret, int code){
        return googleAuthenticator.authorize(secret, code);
    }
}
