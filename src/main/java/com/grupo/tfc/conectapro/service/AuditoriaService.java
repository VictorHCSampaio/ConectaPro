package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.auditoria.AuditoriaLogResponse;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.AuditoriaLog;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.AuditoriaLogRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class AuditoriaService {

    private static final Logger logger = LoggerFactory.getLogger(AuditoriaService.class);
    private static final int LIMITE_TEXTO = 500;
    private static final int LIMITE_IP = 45;
    private static final int TAMANHO_MAXIMO_PAGINA = 200;

    private final AuditoriaLogRepository auditoriaLogRepository;
    private final UsuarioRepository usuarioRepository;
    private final TransactionTemplate transacaoIndependente;

    public AuditoriaService(AuditoriaLogRepository auditoriaLogRepository,
                            UsuarioRepository usuarioRepository,
                            PlatformTransactionManager transactionManager) {
        this.auditoriaLogRepository = auditoriaLogRepository;
        this.usuarioRepository = usuarioRepository;
        this.transacaoIndependente = new TransactionTemplate(transactionManager);
        this.transacaoIndependente.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    public void registrar(AcaoAuditoria acao, UUID usuarioId, String recurso, String recursoId, String detalhes) {
        try {
            AuditoriaLog registro = AuditoriaLog.builder()
                    .usuarioId(usuarioId)
                    .acao(acao)
                    .recurso(recurso)
                    .recursoId(recursoId)
                    .detalhes(limitar(detalhes, LIMITE_TEXTO))
                    .ip(limitar(ipDaRequisicao(), LIMITE_IP))
                    .criadoEm(OffsetDateTime.now())
                    .build();

            transacaoIndependente.executeWithoutResult(status -> auditoriaLogRepository.save(registro));
            logger.info("Auditoria registrada. acao={} usuarioId={} recurso={} recursoId={}", acao, usuarioId, recurso, recursoId);
        } catch (RuntimeException exception) {
            logger.error("Falha ao registrar auditoria. acao={} usuarioId={}", acao, usuarioId, exception);
        }
    }

    public List<AuditoriaLogResponse> listar(UUID usuarioSessaoId, UUID usuarioId, AcaoAuditoria acao, int pagina, int tamanho) {
        Usuario solicitante = usuarioRepository.findById(usuarioSessaoId)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Sessão expirada. Entre novamente."));
        if (!solicitante.isAdmin()) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas administradores podem consultar a auditoria");
        }

        Pageable pageable = PageRequest.of(
                Math.max(pagina, 0),
                Math.min(Math.max(tamanho, 1), TAMANHO_MAXIMO_PAGINA),
                Sort.by(Sort.Direction.DESC, "criadoEm")
        );

        Page<AuditoriaLog> resultado;
        if (usuarioId != null && acao != null) {
            resultado = auditoriaLogRepository.findByUsuarioIdAndAcao(usuarioId, acao, pageable);
        } else if (usuarioId != null) {
            resultado = auditoriaLogRepository.findByUsuarioId(usuarioId, pageable);
        } else if (acao != null) {
            resultado = auditoriaLogRepository.findByAcao(acao, pageable);
        } else {
            resultado = auditoriaLogRepository.findAll(pageable);
        }

        return resultado.getContent().stream()
                .map(this::paraResponse)
                .toList();
    }

    private AuditoriaLogResponse paraResponse(AuditoriaLog registro) {
        return new AuditoriaLogResponse(
                registro.getId(),
                registro.getUsuarioId(),
                registro.getAcao(),
                registro.getRecurso(),
                registro.getRecursoId(),
                registro.getDetalhes(),
                registro.getIp(),
                registro.getCriadoEm()
        );
    }

    private String ipDaRequisicao() {
        if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes atributos)) {
            return null;
        }
        HttpServletRequest requisicao = atributos.getRequest();
        String encaminhado = requisicao.getHeader("X-Forwarded-For");
        if (encaminhado != null && !encaminhado.isBlank()) {
            return encaminhado.split(",")[0].trim();
        }
        return requisicao.getRemoteAddr();
    }

    private String limitar(String texto, int limite) {
        if (texto == null || texto.length() <= limite) {
            return texto;
        }
        return texto.substring(0, limite);
    }
}
