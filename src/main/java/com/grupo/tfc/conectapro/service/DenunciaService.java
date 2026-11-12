package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.config.UsuarioAutenticado;
import com.grupo.tfc.conectapro.dto.chat.ParticipanteChatResponse;
import com.grupo.tfc.conectapro.dto.denuncia.DenunciaResponse;
import com.grupo.tfc.conectapro.dto.denuncia.RegistrarDenunciaRequest;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.Denuncia;
import com.grupo.tfc.conectapro.model.Professor;
import com.grupo.tfc.conectapro.model.StatusDenuncia;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.DenunciaRepository;
import com.grupo.tfc.conectapro.repository.ProfessorRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class DenunciaService {

    private static final Logger logger = LoggerFactory.getLogger(DenunciaService.class);

    private final DenunciaRepository denunciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProfessorRepository professorRepository;
    private final AuditoriaService auditoriaService;

    public DenunciaService(DenunciaRepository denunciaRepository,
                           UsuarioRepository usuarioRepository,
                           ProfessorRepository professorRepository,
                           AuditoriaService auditoriaService) {
        this.denunciaRepository = denunciaRepository;
        this.usuarioRepository = usuarioRepository;
        this.professorRepository = professorRepository;
        this.auditoriaService = auditoriaService;
    }

    @Transactional
    public DenunciaResponse registrar(RegistrarDenunciaRequest request) {
        // pega o user logado do token pra evitar fraude
        UUID idUsuarioLogado = UsuarioAutenticado.exigirUsuarioId();
        Usuario denunciante = usuarioRepository.findById(idUsuarioLogado)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));

        Professor denunciado = professorRepository.findById(request.professorId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Professor não encontrado"));

        if (denunciado.getUsuario() != null && idUsuarioLogado.equals(denunciado.getUsuario().getId())) {
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
        // so id de rastreio. texto da denuncia nao vai pro log
        logger.info("Denuncia registrada. denunciaId={} denuncianteId={} professorId={}",
                salva.getId(), idUsuarioLogado, denunciado.getId());
        auditoriaService.registrar(AcaoAuditoria.DENUNCIA_REGISTRADA, idUsuarioLogado, "DENUNCIA",
                salva.getId().toString(), "professorId=" + denunciado.getId());

        return paraResponse(salva);
    }

    // LGPD: filtra os dados sensiveis no DTO
    private DenunciaResponse paraResponse(Denuncia denuncia) {
        Usuario denunciante = denuncia.getDenunciante();
        Professor professor = denuncia.getDenunciado();
        Usuario usuarioProfessor = professor.getUsuario();
        return new DenunciaResponse(
                denuncia.getId(),
                new ParticipanteChatResponse(denunciante.getId(), denunciante.getNomeCompleto(), avatarDe(denunciante.getId())),
                professor.getId(),
                usuarioProfessor == null ? null : usuarioProfessor.getNomeCompleto(),
                avatarDe(professor),
                denuncia.getMotivo(),
                denuncia.getDescricao(),
                denuncia.getStatus(),
                denuncia.getDataCriacao()
        );
    }

    private String avatarDe(UUID usuarioId) {
        Optional<Professor> perfil = professorRepository.findByUsuarioId(usuarioId);
        if (perfil == null || perfil.isEmpty()) {
            return null;
        }
        return avatarDe(perfil.get());
    }

    private String avatarDe(Professor professor) {
        if (professor == null || professor.getAvatarUrl() == null || professor.getAvatarUrl().isBlank()) {
            return null;
        }
        return professor.getAvatarUrl();
    }
}
