package com.grupo.tfc.conectapro.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ClientIpResolver {

    private final boolean confiarForwardedFor;

    public ClientIpResolver(@Value("${app.security.trust-forwarded-for:false}") boolean confiarForwardedFor) {
        this.confiarForwardedFor = confiarForwardedFor;
    }

    public String resolver(HttpServletRequest request) {
        if (confiarForwardedFor) {
            String forwardedFor = request.getHeader("X-Forwarded-For");
            if (forwardedFor != null && !forwardedFor.isBlank()) {
                return forwardedFor.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }
}
