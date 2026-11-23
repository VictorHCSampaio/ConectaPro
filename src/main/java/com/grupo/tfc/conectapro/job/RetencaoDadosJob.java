package com.grupo.tfc.conectapro.job;

import com.grupo.tfc.conectapro.repository.AuditoriaLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Component
public class RetencaoDadosJob {

    private static final Logger logger = LoggerFactory.getLogger(RetencaoDadosJob.class);

    private final AuditoriaLogRepository auditoriaLogRepository;
    private final long retencaoDias;

    public RetencaoDadosJob(AuditoriaLogRepository auditoriaLogRepository,
                            @Value("${app.retencao.auditoria-dias:730}") long retencaoDias) {
        this.auditoriaLogRepository = auditoriaLogRepository;
        this.retencaoDias = retencaoDias;
    }

    @Scheduled(cron = "0 30 3 * * *")
    @Transactional
    public void expurgarLogsAntigos() {
        if (retencaoDias <= 0) {
            return;
        }
        OffsetDateTime limite = OffsetDateTime.now().minusDays(retencaoDias);
        int removidos = auditoriaLogRepository.deletarAnterioresA(limite);
        if (removidos > 0) {
            logger.info("Retencao de dados: {} logs de auditoria anteriores a {} removidos", removidos, limite);
        }
    }
}
