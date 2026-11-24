package com.grupo.tfc.conectapro.service;

import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private final Map<String, Janela> janelas = new ConcurrentHashMap<>();

    public void verificar(String chave, int maxTentativas, Duration duracaoJanela) {
        Instant agora = Instant.now();
        Janela janela = janelas.compute(chave, (k, atual) -> {
            if (atual == null || agora.isAfter(atual.inicio.plus(duracaoJanela))) {
                return new Janela(agora, 1);
            }
            atual.contador++;
            return atual;
        });

        if (janela.contador > maxTentativas) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Muitas solicitações. Tente novamente mais tarde.");
        }
    }

    @Scheduled(fixedDelay = 3600000)
    public void limparExpirados() {
        Instant limite = Instant.now().minus(Duration.ofHours(1));
        janelas.entrySet().removeIf(entrada -> entrada.getValue().inicio.isBefore(limite));
    }

    private static final class Janela {
        private final Instant inicio;
        private int contador;

        private Janela(Instant inicio, int contador) {
            this.inicio = inicio;
            this.contador = contador;
        }
    }
}
