package com.grupo.tfc.conectapro.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlocklistService {

    private final Map<String, Instant> revogados = new ConcurrentHashMap<>();

    public void revogar(String jti, Instant expiraEm) {
        if (jti == null || jti.isBlank() || expiraEm == null) {
            return;
        }
        revogados.put(jti, expiraEm);
    }

    public boolean estaRevogado(String jti) {
        if (jti == null || jti.isBlank()) {
            return false;
        }
        Instant expiraEm = revogados.get(jti);
        if (expiraEm == null) {
            return false;
        }
        if (Instant.now().isAfter(expiraEm)) {
            revogados.remove(jti);
            return false;
        }
        return true;
    }

    @Scheduled(fixedDelay = 3600000)
    public void limparExpirados() {
        Instant agora = Instant.now();
        revogados.entrySet().removeIf(entrada -> agora.isAfter(entrada.getValue()));
    }
}
