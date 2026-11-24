package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.config.UsuarioAutenticado;
import com.grupo.tfc.conectapro.dto.denuncia.DenunciaResponse;
import com.grupo.tfc.conectapro.dto.moderacao.AplicarTimeoutRequest;
import com.grupo.tfc.conectapro.dto.moderacao.AtualizarStatusDenunciaRequest;
import com.grupo.tfc.conectapro.dto.moderacao.ModeracaoUsuarioResponse;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.Denuncia;
import com.grupo.tfc.conectapro.model.StatusConta;
import com.grupo.tfc.conectapro.model.StatusDenuncia;
import com.grupo.tfc.conectapro.model.TipoNotificacao;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.DenunciaRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ModeracaoService {

    public static final String TEXTO_BO =
            "Devido às circunstâncias, recomendamos que você abra um Boletim de Ocorrência. "
                    + "Cooperaremos fornecendo os dados do usuário acusado; após isso, não está mais em nossa alçada.";

    private static final Set<Integer> DURACOES_HORAS = Set.of(24, 168, 720);
    private static final Logger logger = LoggerFactory.getLogger(ModeracaoService.class);

    private final UsuarioRepository usuarioRepository;
    private final DenunciaRepository denunciaRepository;
    private final AuditoriaService auditoriaService;
    private final NotificacaoService notificacaoService;
    private final EmailService emailService;
    private final DenunciaService denunciaService;

    public ModeracaoService(UsuarioRepository usuarioRepository,
                            DenunciaRepository denunciaRepository,
                            AuditoriaService auditoriaService,
                            NotificacaoService notificacaoService,
                            EmailService emailService,
                            DenunciaService denunciaService) {
        this.usuarioRepository = usuarioRepository;
        this.denunciaRepository = denunciaRepository;
        this.auditoriaService = auditoriaService;
        this.notificacaoService = notificacaoService;
        this.emailService = emailService;
        this.denunciaService = denunciaService;
    }

    @Transactional
    public ModeracaoUsuarioResponse banir(UUID usuarioId, String motivo) {
        UUID adminId = exigirAdmin();
        Usuario alvo = carregarAlvoModeravel(usuarioId, adminId);
        alvo.setStatusConta(StatusConta.BANIDO);
        alvo.setBloqueadoAte(null);
        alvo.setMotivoBanimento(motivo);
        usuarioRepository.save(alvo);
        logger.info("Usuario banido. adminId={} usuarioId={} motivo={}", adminId, usuarioId, motivo);
        auditoriaService.registrar(AcaoAuditoria.USUARIO_BANIDO, adminId, "USUARIO",
                usuarioId.toString(), "banimento permanente. motivo=" + motivo);
        return resposta(alvo);
    }

    @Transactional
    public ModeracaoUsuarioResponse desbanir(UUID usuarioId) {
        UUID adminId = exigirAdmin();
        Usuario alvo = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));
        if (alvo.getStatusConta() != StatusConta.BANIDO) {
            throw new ResponseStatusException(BAD_REQUEST, "Usuário não está banido");
        }
        alvo.setStatusConta(StatusConta.ATIVO);
        alvo.setMotivoBanimento(null);
        usuarioRepository.save(alvo);
        logger.info("Usuario desbanido. adminId={} usuarioId={}", adminId, usuarioId);
        auditoriaService.registrar(AcaoAuditoria.USUARIO_BANIDO, adminId, "USUARIO",
                usuarioId.toString(), "desbanimento");
        return resposta(alvo);
    }

    @Transactional
    public ModeracaoUsuarioResponse aplicarTimeout(UUID usuarioId, AplicarTimeoutRequest request) {
        UUID adminId = exigirAdmin();
        if (request.horas() == null || !DURACOES_HORAS.contains(request.horas())) {
            throw new ResponseStatusException(BAD_REQUEST, "Duração de timeout inválida. Use 24, 168 ou 720 horas");
        }
        Usuario alvo = carregarAlvoModeravel(usuarioId, adminId);
        if (alvo.getStatusConta() == StatusConta.BANIDO) {
            throw new ResponseStatusException(BAD_REQUEST, "Usuário banido não recebe timeout");
        }
        OffsetDateTime ate = OffsetDateTime.now().plusHours(request.horas());
        alvo.setBloqueadoAte(ate);
        usuarioRepository.save(alvo);
        logger.info("Timeout aplicado. adminId={} usuarioId={} horas={}", adminId, usuarioId, request.horas());
        auditoriaService.registrar(AcaoAuditoria.USUARIO_TIMEOUT, adminId, "USUARIO",
                usuarioId.toString(), "horas=" + request.horas() + " ate=" + ate);
        return resposta(alvo);
    }

    @Transactional
    public DenunciaResponse recomendarBoletim(UUID denunciaId) {
        UUID adminId = exigirAdmin();
        Denuncia denuncia = carregarDenuncia(denunciaId);
        Usuario denunciante = denuncia.getDenunciante();
        denuncia.setStatus(StatusDenuncia.ENCAMINHADA);
        Denuncia salva = denunciaRepository.save(denuncia);

        notificacaoService.criarNotificacao(
                denunciante,
                "Recomendação de boletim de ocorrência",
                TEXTO_BO,
                TipoNotificacao.MODERACAO,
                salva.getId());
        emailService.enviarRecomendacaoBoletim(denunciante.getEmail(), denunciante.getNomeCompleto(), TEXTO_BO);

        logger.info("Boletim recomendado. adminId={} denunciaId={} denuncianteId={}",
                adminId, denunciaId, denunciante.getId());
        auditoriaService.registrar(AcaoAuditoria.DENUNCIA_BO_RECOMENDADO, adminId, "DENUNCIA",
                denunciaId.toString(), "denuncianteId=" + denunciante.getId() + " status=ENCAMINHADA");
        return denunciaService.paraResponse(salva);
    }

    @Transactional
    public DenunciaResponse atualizarStatus(UUID denunciaId, AtualizarStatusDenunciaRequest request) {
        UUID adminId = exigirAdmin();
        Denuncia denuncia = carregarDenuncia(denunciaId);
        StatusDenuncia anterior = denuncia.getStatus();
        denuncia.setStatus(request.status());
        if (request.notasModeracao() != null) {
            String notas = request.notasModeracao().trim();
            denuncia.setNotasModeracao(notas.isEmpty() ? null : notas);
        }
        Denuncia salva = denunciaRepository.save(denuncia);
        auditoriaService.registrar(AcaoAuditoria.DENUNCIA_STATUS_ATUALIZADO, adminId, "DENUNCIA",
                denunciaId.toString(),
                "de=" + anterior + " para=" + request.status()
                        + (request.notasModeracao() == null ? "" : " notas=atualizadas"));
        return denunciaService.paraResponse(salva);
    }

    private Usuario carregarAlvoModeravel(UUID usuarioId, UUID adminId) {
        if (usuarioId.equals(adminId)) {
            throw new ResponseStatusException(BAD_REQUEST, "Não é possível moderar a própria conta");
        }
        Usuario alvo = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));
        if (alvo.isAdmin()) {
            throw new ResponseStatusException(BAD_REQUEST, "Não é possível moderar um administrador");
        }
        return alvo;
    }

    private Denuncia carregarDenuncia(UUID denunciaId) {
        return denunciaRepository.findById(denunciaId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Denúncia não encontrada"));
    }

    private UUID exigirAdmin() {
        UUID adminId = UsuarioAutenticado.exigirUsuarioId();
        Usuario admin = usuarioRepository.findById(adminId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));
        if (!admin.isAdmin()) {
            auditoriaService.registrar(AcaoAuditoria.ACESSO_NEGADO, adminId, "MODERACAO", null, "ação administrativa");
            throw new ResponseStatusException(FORBIDDEN, "Apenas administradores podem moderar denúncias");
        }
        return adminId;
    }

    private ModeracaoUsuarioResponse resposta(Usuario usuario) {
        return new ModeracaoUsuarioResponse(usuario.getId(), usuario.getStatusConta(), usuario.getBloqueadoAte());
    }
}
