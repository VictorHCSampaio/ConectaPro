package com.grupo.tfc.conectapro.job;

import com.grupo.tfc.conectapro.model.StatusConta;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Component
public class ExpiracaoAssinaturaJob {

    private static final Logger logger = LoggerFactory.getLogger(ExpiracaoAssinaturaJob.class);

    private final UsuarioRepository usuarioRepository;

    public ExpiracaoAssinaturaJob(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Scheduled(cron = "0 15 3 * * *")
    @Transactional
    public void expirarAssinaturasVencidas() {
        List<Usuario> vencidos = usuarioRepository
                .findByStatusContaAndAssinaturaValidaAteBefore(StatusConta.ATIVO, OffsetDateTime.now());
        if (vencidos.isEmpty()) {
            return;
        }
        for (Usuario usuario : vencidos) {
            usuario.setStatusConta(StatusConta.PENDENTE_PAGAMENTO);
            usuarioRepository.save(usuario);
        }
        logger.info("Expiracao de assinatura: {} contas voltaram para PENDENTE_PAGAMENTO", vencidos.size());
    }
}
