package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.professor.ProfessorPendenteResponse;
import com.grupo.tfc.conectapro.model.Professor;
import com.grupo.tfc.conectapro.model.StatusComprovacao;
import com.grupo.tfc.conectapro.model.StatusConta;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.ProfessorRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminProfessorServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private ProfessorRepository professorRepository;
    @Mock
    private ArmazenamentoS3Service armazenamentoS3Service;
    @Mock
    private AuditoriaService auditoriaService;

    @InjectMocks
    private AdminProfessorService adminProfessorService;

    private UUID usuarioId;
    private Usuario professorUsuario;
    private Professor professor;

    @BeforeEach
    void setUp() {
        usuarioId = UUID.randomUUID();
        professorUsuario = Usuario.builder()
                .id(usuarioId)
                .nomeCompleto("João Silva")
                .email("joao@professor.com")
                .tipo(TipoUsuario.PROFESSOR)
                .statusConta(StatusConta.EM_ANALISE)
                .criadoEm(OffsetDateTime.parse("2026-11-16T10:00:00Z"))
                .build();
        professor = new Professor();
        professor.setId(UUID.randomUUID());
        professor.setUsuario(professorUsuario);
    }

    @Test
    void aprovar_semCertificadoNemJustificativa_retorna400() {
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(professorUsuario));
        when(professorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(professor));

        ResponseStatusException excecao = assertThrows(
                ResponseStatusException.class,
                () -> adminProfessorService.aprovar(usuarioId)
        );

        assertThat(excecao.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(excecao.getReason()).isEqualTo(
                "Não é possível aprovar um professor sem certificado enviado e sem solicitação de conversa/justificativa registrada.");
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void listarPendentes_comJustificativaSemCertificado_marcaSolicitarConversaAdmin() {
        professor.setJustificativaSemCertificado("Quero conversar com um administrador sobre minha experiência.");
        when(usuarioRepository.findByTipoAndStatusContaOrderByCriadoEmAsc(TipoUsuario.PROFESSOR, StatusConta.EM_ANALISE))
                .thenReturn(List.of(professorUsuario));
        when(professorRepository.findByStatusComprovacaoWithUsuario(StatusComprovacao.PENDENTE)).thenReturn(List.of());
        when(professorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(professor));

        List<ProfessorPendenteResponse> pendentes = adminProfessorService.listarPendentes();

        assertThat(pendentes).hasSize(1);
        assertThat(pendentes.getFirst().certificadoEnviado()).isFalse();
        assertThat(pendentes.getFirst().solicitarConversaAdmin()).isTrue();
        assertThat(pendentes.getFirst().statusConta()).isEqualTo("EM_ANALISE");
    }

    @Test
    void listarPendentes_incluiProfessorAtivoComComprovacaoPendente() {
        professorUsuario.setStatusConta(StatusConta.ATIVO);
        professor.setCertificadoNome("diploma.jpg");
        professor.setStatusComprovacao(StatusComprovacao.PENDENTE);
        when(usuarioRepository.findByTipoAndStatusContaOrderByCriadoEmAsc(TipoUsuario.PROFESSOR, StatusConta.EM_ANALISE))
                .thenReturn(List.of());
        when(professorRepository.findByStatusComprovacaoWithUsuario(StatusComprovacao.PENDENTE))
                .thenReturn(List.of(professor));
        when(professorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(professor));

        List<ProfessorPendenteResponse> pendentes = adminProfessorService.listarPendentes();

        assertThat(pendentes).hasSize(1);
        assertThat(pendentes.getFirst().statusConta()).isEqualTo("ATIVO");
        assertThat(pendentes.getFirst().certificadoEnviado()).isTrue();
    }

    @Test
    void aprovar_professorAtivo_mantemContaAtivaEMarcaVerificado() {
        professorUsuario.setStatusConta(StatusConta.ATIVO);
        professor.setCertificadoNome("diploma.jpg");
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(professorUsuario));
        when(professorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(professor));

        adminProfessorService.aprovar(usuarioId);

        assertThat(professorUsuario.getStatusConta()).isEqualTo(StatusConta.ATIVO);
        assertThat(professor.isComprovacaoVerificada()).isTrue();
        assertThat(professor.getStatusComprovacao()).isEqualTo(StatusComprovacao.APROVADA);
        verify(professorRepository).save(professor);
        verify(usuarioRepository).save(professorUsuario);
    }
}
