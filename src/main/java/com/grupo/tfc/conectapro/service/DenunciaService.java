package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.config.EmailProperties;
import com.grupo.tfc.conectapro.config.UsuarioAutenticado;
import com.grupo.tfc.conectapro.dto.chat.ParticipanteChatResponse;
import com.grupo.tfc.conectapro.dto.denuncia.DenunciaResponse;
import com.grupo.tfc.conectapro.dto.denuncia.RegistrarDenunciaRequest;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.Denuncia;
import com.grupo.tfc.conectapro.model.StatusDenuncia;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.DenunciaRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class DenunciaService {

    private static final Logger logger = LoggerFactory.getLogger(DenunciaService.class);

    private final DenunciaRepository denunciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;
    private final EmailService emailService;
    private final EmailProperties emailProperties;

    public DenunciaService(DenunciaRepository denunciaRepository,
                           UsuarioRepository usuarioRepository,
                           AuditoriaService auditoriaService,
                           EmailService emailService,
                           EmailProperties emailProperties) {
        this.denunciaRepository = denunciaRepository;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
        this.emailService = emailService;
        this.emailProperties = emailProperties;
    }

    @Transactional
    public DenunciaResponse registrar(RegistrarDenunciaRequest request) {
        UUID idUsuarioLogado = UsuarioAutenticado.exigirUsuarioId();
        Usuario denunciante = usuarioRepository.findById(idUsuarioLogado)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));

        Usuario denunciado = usuarioRepository.findById(request.denunciadoId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário denunciado não encontrado"));

        if (idUsuarioLogado.equals(denunciado.getId())) {
            throw new ResponseStatusException(BAD_REQUEST, "Não é possível registrar uma denúncia contra si mesmo");
        }

        Denuncia denuncia = Denuncia.builder()
                .denunciante(denunciante)
                .denunciado(denunciado)
                .motivo(request.motivo())
                .descricao(request.descricao().trim())
                .status(StatusDenuncia.PENDENTE)
                .build();

        Denuncia salva = denunciaRepository.save(denuncia);
        logger.info("Denuncia registrada. denunciaId={} denuncianteId={} denunciadoId={} tipoDenunciado={}",
                salva.getId(), idUsuarioLogado, denunciado.getId(), denunciado.getTipo());
        auditoriaService.registrar(AcaoAuditoria.DENUNCIA_REGISTRADA, idUsuarioLogado, "DENUNCIA",
                salva.getId().toString(),
                "denunciadoId=" + denunciado.getId() + " tipo=" + nomeTipo(denunciado.getTipo()));

        emailService.enviarAlertaDenuncia(salva, emailProperties.adminAddress());

        return paraResponse(salva);
    }

    @Transactional(readOnly = true)
    public List<DenunciaResponse> listar() {
        UUID idUsuarioLogado = UsuarioAutenticado.exigirUsuarioId();
        Usuario solicitante = usuarioRepository.findById(idUsuarioLogado)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));
        if (!solicitante.isAdmin()) {
            throw new ResponseStatusException(FORBIDDEN, "Apenas administradores podem consultar denúncias");
        }

        return denunciaRepository.findAllByOrderByDataCriacaoDesc().stream()
                .map(this::paraResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DenunciaResponse> listarPorPapel(TipoUsuario papel) {
        UUID idUsuarioLogado = UsuarioAutenticado.exigirUsuarioId();
        Usuario solicitante = usuarioRepository.findById(idUsuarioLogado)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));
        if (!solicitante.isAdmin()) {
            auditoriaService.registrar(AcaoAuditoria.ACESSO_NEGADO, idUsuarioLogado, "DENUNCIA",
                    null, "consulta tipo=" + papel.name());
            throw new ResponseStatusException(FORBIDDEN, "Apenas administradores podem consultar denúncias");
        }

        List<DenunciaResponse> denuncias = denunciaRepository
                .findByDenunciado_TipoOrderByDataCriacaoDesc(papel).stream()
                .map(this::paraResponse)
                .toList();
        auditoriaService.registrar(AcaoAuditoria.DENUNCIA_CONSULTADA, idUsuarioLogado, "DENUNCIA",
                null, "tipo=" + papel.name() + " quantidade=" + denuncias.size());
        return denuncias;
    }

    private String nomeTipo(TipoUsuario tipo) {
        return tipo == null ? "INDEFINIDO" : tipo.name();
    }

    // LGPD: filtra os dados sensiveis no DTO
    public DenunciaResponse paraResponse(Denuncia denuncia) {
        Usuario denunciante = denuncia.getDenunciante();
        Usuario denunciado = denuncia.getDenunciado();
        return new DenunciaResponse(
                denuncia.getId(),
                new ParticipanteChatResponse(denunciante.getId(), denunciante.getNomeCompleto(), denunciante.getAvatarUrl()),
                denunciado.getId(),
                denunciado.getNomeCompleto(),
                denunciado.getAvatarUrl(),
                denuncia.getMotivo(),
                denuncia.getDescricao(),
                denuncia.getStatus(),
                denuncia.getDataCriacao(),
                denunciado.getTipo(),
                denuncia.getNotasModeracao()
        );
    }
}
