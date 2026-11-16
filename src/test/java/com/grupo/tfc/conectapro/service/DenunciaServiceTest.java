package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.denuncia.DenunciaResponse;
import com.grupo.tfc.conectapro.dto.denuncia.RegistrarDenunciaRequest;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.Denuncia;
import com.grupo.tfc.conectapro.model.MotivoDenuncia;
import com.grupo.tfc.conectapro.model.StatusDenuncia;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.DenunciaRepository;
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
    private AuditoriaService auditoriaService;

    @InjectMocks
    private DenunciaService denunciaService;

    private UUID alunoId;
    private UUID denunciadoId;
    private Usuario aluno;
    private Usuario denunciado;

    @BeforeEach
    void setUp() {
        alunoId = UUID.randomUUID();
        denunciadoId = UUID.randomUUID();

        aluno = Usuario.builder().id(alunoId).nomeCompleto("Ana Aluna").email("ana@aluno.com").build();
        denunciado = Usuario.builder()
                .id(denunciadoId)
                .nomeCompleto("Paulo Professor")
                .email("paulo@prof.com")
                .avatarUrl("https://cdn.conectapro.test/paulo.png")
                .build();
    }

    @AfterEach
    void limparToken() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void registrar_usaDenuncianteDoTokenEDenunciadoDoCorpo() {
        autenticar(alunoId);
        when(usuarioRepository.findById(alunoId)).thenReturn(Optional.of(aluno));
        when(usuarioRepository.findById(denunciadoId)).thenReturn(Optional.of(denunciado));
        when(denunciaRepository.save(any(Denuncia.class))).thenAnswer(invocation -> {
            Denuncia denuncia = invocation.getArgument(0);
            denuncia.setId(UUID.randomUUID());
            return denuncia;
        });

        DenunciaResponse response = denunciaService.registrar(new RegistrarDenunciaRequest(
                denunciadoId, MotivoDenuncia.FRAUDE, "  Cobrou e não compareceu à aula combinada.  "));

        ArgumentCaptor<Denuncia> captor = ArgumentCaptor.forClass(Denuncia.class);
        verify(denunciaRepository).save(captor.capture());
        assertThat(captor.getValue().getDenunciante().getId()).isEqualTo(alunoId);
        assertThat(captor.getValue().getDenunciado().getId()).isEqualTo(denunciadoId);
        assertThat(captor.getValue().getMotivo()).isEqualTo(MotivoDenuncia.FRAUDE);
        assertThat(captor.getValue().getStatus()).isEqualTo(StatusDenuncia.PENDENTE);
        assertThat(captor.getValue().getDescricao()).isEqualTo("Cobrou e não compareceu à aula combinada.");
        assertThat(response.denunciante().id()).isEqualTo(alunoId);
        assertThat(response.denunciante().nome()).isEqualTo("Ana Aluna");
        assertThat(response.denunciadoId()).isEqualTo(denunciadoId);
        assertThat(response.denunciadoNome()).isEqualTo("Paulo Professor");
        assertThat(response.denunciadoAvatar()).isEqualTo("https://cdn.conectapro.test/paulo.png");
        assertThat(response.toString()).doesNotContain("ana@aluno.com").doesNotContain("paulo@prof.com");
        verify(auditoriaService).registrar(
                eq(AcaoAuditoria.DENUNCIA_REGISTRADA), eq(alunoId), eq("DENUNCIA"), any(), any());
    }

    @Test
    void registrar_semToken_deveFalhar() {
        ResponseStatusException excecao = assertThrows(ResponseStatusException.class,
                () -> denunciaService.registrar(new RegistrarDenunciaRequest(
                        denunciadoId, MotivoDenuncia.FRAUDE, "Cobrou e não compareceu à aula combinada.")));

        assertThat(excecao.getStatusCode().value()).isEqualTo(401);
        verify(denunciaRepository, never()).save(any());
    }

    @Test
    void registrar_contraSiMesmo_deveFalhar() {
        autenticar(denunciadoId);
        when(usuarioRepository.findById(denunciadoId)).thenReturn(Optional.of(denunciado));

        ResponseStatusException excecao = assertThrows(ResponseStatusException.class,
                () -> denunciaService.registrar(new RegistrarDenunciaRequest(
                        denunciadoId, MotivoDenuncia.OUTROS, "Tentativa de denúncia do próprio perfil.")));

        assertThat(excecao.getStatusCode().value()).isEqualTo(400);
        verify(denunciaRepository, never()).save(any());
    }

    @Test
    void registrar_usuarioInexistente_deveFalhar() {
        autenticar(alunoId);
        when(usuarioRepository.findById(alunoId)).thenReturn(Optional.of(aluno));
        when(usuarioRepository.findById(denunciadoId)).thenReturn(Optional.empty());

        ResponseStatusException excecao = assertThrows(ResponseStatusException.class,
                () -> denunciaService.registrar(new RegistrarDenunciaRequest(
                        denunciadoId, MotivoDenuncia.ASSEDIO, "Relato de conduta inadequada em aula.")));

        assertThat(excecao.getStatusCode().value()).isEqualTo(404);
    }

    private void autenticar(UUID usuarioId) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(usuarioId, null, List.of()));
    }
}
