package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.professor.CertificadoUrlResponse;
import com.grupo.tfc.conectapro.dto.professor.ProfessorPendenteResponse;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.Professor;
import com.grupo.tfc.conectapro.model.StatusComprovacao;
import com.grupo.tfc.conectapro.model.StatusConta;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.ProfessorRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class AdminProfessorService {

    private static final Logger logger = LoggerFactory.getLogger(AdminProfessorService.class);

    private final UsuarioRepository usuarioRepository;
    private final ProfessorRepository professorRepository;
    private final ArmazenamentoS3Service armazenamentoS3Service;
    private final AuditoriaService auditoriaService;

    public AdminProfessorService(UsuarioRepository usuarioRepository,
                                 ProfessorRepository professorRepository,
                                 ArmazenamentoS3Service armazenamentoS3Service,
                                 AuditoriaService auditoriaService) {
        this.usuarioRepository = usuarioRepository;
        this.professorRepository = professorRepository;
        this.armazenamentoS3Service = armazenamentoS3Service;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public List<ProfessorPendenteResponse> listarPendentes() {
        Map<UUID, Usuario> fila = new LinkedHashMap<>();
        usuarioRepository
                .findByTipoAndStatusContaOrderByCriadoEmAsc(TipoUsuario.PROFESSOR, StatusConta.EM_ANALISE)
                .forEach(usuario -> fila.put(usuario.getId(), usuario));

        professorRepository.findByStatusComprovacaoWithUsuario(StatusComprovacao.PENDENTE)
                .forEach(professor -> incluirComprovacaoPendente(fila, professor));

        return fila.values().stream().map(this::paraPendente).toList();
    }

    private void incluirComprovacaoPendente(Map<UUID, Usuario> fila, Professor professor) {
        Usuario usuario = professor.getUsuario();
        if (usuario == null || usuario.getTipo() != TipoUsuario.PROFESSOR) {
            return;
        }
        StatusConta status = usuario.getStatusConta();
        if (status == StatusConta.ATIVO
                || status == StatusConta.PENDENTE_PAGAMENTO
                || status == StatusConta.EM_ANALISE) {
            fila.putIfAbsent(usuario.getId(), usuario);
        }
    }

    private ProfessorPendenteResponse paraPendente(Usuario usuario) {
        Professor professor = professorRepository.findByUsuarioId(usuario.getId()).orElse(null);
        String certificadoNome = professor == null ? null : professor.getCertificadoNome();
        String justificativa = professor == null ? null : professor.getJustificativaSemCertificado();
        return new ProfessorPendenteResponse(
                usuario.getId().toString(),
                usuario.getNomeCompleto(),
                usuario.getEmail(),
                textoPreenchido(certificadoNome),
                certificadoNome,
                justificativa,
                solicitarConversaAdmin(professor),
                usuario.getStatusConta().name(),
                usuario.getCriadoEm());
    }

    @Transactional(readOnly = true)
    public CertificadoUrlResponse gerarUrlCertificado(UUID usuarioId) {
        Professor professor = professorRepository.findByUsuarioId(usuarioId)
                .filter(p -> textoPreenchido(p.getCertificadoNome()))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Certificado nao encontrado"));

        return new CertificadoUrlResponse(armazenamentoS3Service.gerarUrlCertificado(professor.getId()));
    }

    @Transactional
    public void aprovar(UUID usuarioId) {
        Usuario usuario = buscarProfessorModeravel(usuarioId);
        Professor professor = professorRepository.findByUsuarioId(usuarioId).orElse(null);
        if (!comprovacaoInformada(professor)) {
            throw new ResponseStatusException(BAD_REQUEST,
                    "Não é possível aprovar um professor sem certificado enviado e sem solicitação de conversa/justificativa registrada.");
        }
        professor.setStatusComprovacao(StatusComprovacao.APROVADA);
        professor.setComprovacaoVerificada(true);
        professor.setVerificado(true);
        professorRepository.save(professor);

        if (usuario.getStatusConta() == StatusConta.EM_ANALISE) {
            usuario.setStatusConta(StatusConta.PENDENTE_PAGAMENTO);
        }
        usuario.setMotivoRejeicao(null);
        usuarioRepository.save(usuario);

        auditoriaService.registrar(AcaoAuditoria.CADASTRO_APROVADO, usuarioId, "USUARIO", usuarioId.toString(), null);
        logger.info("Cadastro de professor aprovado. usuarioId={}", usuarioId);
    }

    @Transactional
    public void rejeitar(UUID usuarioId, String motivo) {
        Usuario usuario = buscarProfessorModeravel(usuarioId);
        Professor professor = professorRepository.findByUsuarioId(usuarioId).orElse(null);
        if (professor != null) {
            professor.setStatusComprovacao(StatusComprovacao.REJEITADA);
            professor.setComprovacaoVerificada(false);
            professor.setVerificado(false);
            professorRepository.save(professor);
        } else if (usuario.getStatusConta() != StatusConta.EM_ANALISE) {
            throw new ResponseStatusException(NOT_FOUND, "Professor nao encontrado");
        }

        usuario.setMotivoRejeicao(motivo.trim());
        if (usuario.getStatusConta() == StatusConta.EM_ANALISE) {
            usuario.setStatusConta(StatusConta.REJEITADO);
        }
        usuarioRepository.save(usuario);

        auditoriaService.registrar(AcaoAuditoria.CADASTRO_REJEITADO, usuarioId, "USUARIO", usuarioId.toString(), motivo.trim());
        logger.info("Cadastro de professor rejeitado. usuarioId={}", usuarioId);
    }

    private Usuario buscarProfessorModeravel(UUID usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuario nao encontrado"));
        if (usuario.getTipo() != TipoUsuario.PROFESSOR) {
            throw new ResponseStatusException(BAD_REQUEST, "Usuario nao e professor");
        }
        StatusConta status = usuario.getStatusConta();
        if (status != StatusConta.EM_ANALISE
                && status != StatusConta.ATIVO
                && status != StatusConta.PENDENTE_PAGAMENTO) {
            throw new ResponseStatusException(BAD_REQUEST, "Cadastro nao esta em analise");
        }
        return usuario;
    }

    private boolean solicitarConversaAdmin(Professor professor) {
        if (professor == null) {
            return false;
        }
        return !textoPreenchido(professor.getCertificadoNome())
                && textoPreenchido(professor.getJustificativaSemCertificado());
    }

    private boolean comprovacaoInformada(Professor professor) {
        if (professor == null) {
            return false;
        }
        return textoPreenchido(professor.getCertificadoNome())
                || textoPreenchido(professor.getJustificativaSemCertificado());
    }

    private boolean textoPreenchido(String valor) {
        return valor != null && !valor.isBlank();
    }
}
