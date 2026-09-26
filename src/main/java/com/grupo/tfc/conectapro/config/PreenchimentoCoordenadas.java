package com.grupo.tfc.conectapro.config;

import com.grupo.tfc.conectapro.service.EnderecoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class PreenchimentoCoordenadas {

    private static final Logger logger = LoggerFactory.getLogger(PreenchimentoCoordenadas.class);

    private final EnderecoService enderecoService;

    public PreenchimentoCoordenadas(EnderecoService enderecoService) {
        this.enderecoService = enderecoService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void preencher() {
        try {
            enderecoService.preencherCoordenadasPendentes();
        } catch (RuntimeException exception) {
            logger.warn("Nao foi possivel preencher as coordenadas pendentes. motivo={}", exception.getMessage());
        }
    }
}
