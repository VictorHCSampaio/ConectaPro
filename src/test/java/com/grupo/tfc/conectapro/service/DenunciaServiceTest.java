package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.denuncia.DenunciaResponse;
import com.grupo.tfc.conectapro.dto.denuncia.RegistrarDenunciaRequest;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.Denuncia;
import com.grupo.tfc.conectapro.model.MotivoDenuncia;
import com.grupo.tfc.conectapro.model.Professor;
import com.grupo.tfc.conectapro.model.StatusDenuncia;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.DenunciaRepository;
import com.grupo.tfc.conectapro.repository.ProfessorRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DenunciaServiceTest {

    @Mock
    private DenunciaRepository denunciaRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private ProfessorRepository professorRepository;
    @Mock
    private AuditoriaService auditoriaService;

    @InjectMocks
    private DenunciaService denunciaService;

    private UUID alunoId;
    private UUID professorUsuarioId;
    private UUID professorId;
    private Usuario aluno;
    private Usuario usuarioProfessor;
    private Professor professor;

    @BeforeEach
    void setUp() {
        alunoId = UUID.randomUUID();
        professorUsuarioId = UUID.randomUUID();
        professorId = UUID.randomUUID();

        aluno = Usuario.builder().id(alunoId).nomeCompleto("Ana Aluna").email("ana@aluno.com").build();
        usuarioProfessor = Usuario.builder()
                .id(professorUsuarioId)
                .nomeCompleto("Paulo Professor")
                .email("paulo@prof.com")
                .build();
        professor = new Professor();
        professor.setId(professorId);
        professor.setUsuario(usuarioProfessor);
        professor.setAvatarUrl("https://cdn.conectapro.test/paulo.png");
    }

    @AfterEach
    void limparToken() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void registrar_usaDenuncianteDoTokenEProfessorDoCorpo() {
        autenticar(alunoId);
        when(usuarioRepository.findById(alunoId)).thenReturn(Optional.of(aluno));
        when(professorRepository.findById(professorId)).thenReturn(Optional.of(professor));
        when(denunciaRepository.save(any(Denuncia.class))).thenAnswer(invocation -> {
            Denuncia denuncia = invocation.getArgument(0);
            denuncia.setId(UUID.randomUUID());
            return denuncia;
        });

        DenunciaResponse response = denunciaService.registrar(new RegistrarDenunciaRequest(
                professorId, MotivoDenuncia.FRAUDE, "  Cobrou e não compareceu à aula combinada.  "));

        ArgumentCaptor<Denuncia> captor = ArgumentCaptor.forClass(Denuncia.class);
        verify(denunciaRepository).save(captor.capture());
        assertThat(captor.getValue().getDenunciante().getId()).isEqualTo(alunoId);
        assertThat(captor.getValue().getDenunciado().getId()).isEqualTo(professorId);
        assertThat(captor.getValue().getMotivo()).isEqualTo(MotivoDenuncia.FRAUDE);
        assertThat(captor.getValue().getStatus()).isEqualTo(StatusDenuncia.PENDENTE);
        assertThat(captor.getValue().getDescricao()).isEqualTo("Cobrou e não compareceu à aula combinada.");
        assertThat(response.denunciante().id()).isEqualTo(alunoId);
        assertThat(response.denunciante().nome()).isEqualTo("Ana Aluna");
        assertThat(response.professorId()).isEqualTo(professorId);
        assertThat(response.professorNome()).isEqualTo("Paulo Professor");
        assertThat(response.professorAvatar()).isEqualTo("https://cdn.conectapro.test/paulo.png");
        assertThat(response.toString()).doesNotContain("ana@aluno.com").doesNotContain("paulo@prof.com");
        verify(auditoriaService).registrar(
                eq(AcaoAuditoria.DENUNCIA_REGISTRADA), eq(alunoId), eq("DENUNCIA"), any(), any());
    }

    @Test
    void registrar_semToken_deveFalhar() {
        ResponseStatusException excecao = assertThrows(ResponseStatusException.class,
                () -> denunciaService.registrar(new RegistrarDenunciaRequest(
                        professorId, MotivoDenuncia.FRAUDE, "Cobrou e não compareceu à aula combinada.")));

        assertThat(excecao.getStatusCode().value()).isEqualTo(401);
        verify(denunciaRepository, never()).save(any());
    }

    @Test
    void registrar_contraSiMesmo_deveFalhar() {
        autenticar(professorUsuarioId);
        when(usuarioRepository.findById(professorUsuarioId)).thenReturn(Optional.of(usuarioProfessor));
        when(professorRepository.findById(professorId)).thenReturn(Optional.of(professor));

        ResponseStatusException excecao = assertThrows(ResponseStatusException.class,
                () -> denunciaService.registrar(new RegistrarDenunciaRequest(
                        professorId, MotivoDenuncia.OUTROS, "Tentativa de denúncia do próprio perfil.")));

        assertThat(excecao.getStatusCode().value()).isEqualTo(400);
        verify(denunciaRepository, never()).save(any());
    }

    @Test
    void registrar_professorInexistente_deveFalhar() {
        autenticar(alunoId);
        when(usuarioRepository.findById(alunoId)).thenReturn(Optional.of(aluno));
        when(professorRepository.findById(professorId)).thenReturn(Optional.empty());

        ResponseStatusException excecao = assertThrows(ResponseStatusException.class,
                () -> denunciaService.registrar(new RegistrarDenunciaRequest(
                        professorId, MotivoDenuncia.ASSEDIO, "Relato de conduta inadequada em aula.")));

        assertThat(excecao.getStatusCode().value()).isEqualTo(404);
    }

    private void autenticar(UUID usuarioId) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(usuarioId, null, List.of()));
    }
}
