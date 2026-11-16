package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.config.UsuarioAutenticado;
import com.grupo.tfc.conectapro.dto.chat.ParticipanteChatResponse;
import com.grupo.tfc.conectapro.dto.denuncia.DenunciaResponse;
import com.grupo.tfc.conectapro.dto.denuncia.RegistrarDenunciaRequest;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.Denuncia;
import com.grupo.tfc.conectapro.model.StatusDenuncia;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.DenunciaRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class DenunciaService {

    private static final Logger logger = LoggerFactory.getLogger(DenunciaService.class);

    private final DenunciaRepository denunciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;

    public DenunciaService(DenunciaRepository denunciaRepository,
                           UsuarioRepository usuarioRepository,
                           AuditoriaService auditoriaService) {
        this.denunciaRepository = denunciaRepository;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
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
        logger.info("Denuncia registrada. denunciaId={} denuncianteId={} denunciadoId={}",
                salva.getId(), idUsuarioLogado, denunciado.getId());
        auditoriaService.registrar(AcaoAuditoria.DENUNCIA_REGISTRADA, idUsuarioLogado, "DENUNCIA",
                salva.getId().toString(), "denunciadoId=" + denunciado.getId());

        return paraResponse(salva);
    }

    private DenunciaResponse paraResponse(Denuncia denuncia) {
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
                denuncia.getDataCriacao()
        );
    }
}
