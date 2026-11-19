package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.moderacao.AplicarTimeoutRequest;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.Denuncia;
import com.grupo.tfc.conectapro.model.MotivoDenuncia;
import com.grupo.tfc.conectapro.model.StatusConta;
import com.grupo.tfc.conectapro.model.StatusDenuncia;
import com.grupo.tfc.conectapro.model.TipoNotificacao;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.DenunciaRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ModeracaoServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private DenunciaRepository denunciaRepository;
    @Mock
    private AuditoriaService auditoriaService;
    @Mock
    private NotificacaoService notificacaoService;
    @Mock
    private EmailService emailService;
    @Mock
    private DenunciaService denunciaService;

    @InjectMocks
    private ModeracaoService moderacaoService;

    @AfterEach
    void limpar() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void banir_semAdmin_negaEAudita() {
        UUID alunoId = UUID.randomUUID();
        autenticar(alunoId);
        when(usuarioRepository.findById(alunoId)).thenReturn(Optional.of(usuario(alunoId, false)));

        ResponseStatusException excecao = assertThrows(ResponseStatusException.class,
                () -> moderacaoService.banir(UUID.randomUUID()));

        assertThat(excecao.getStatusCode().value()).isEqualTo(403);
        verify(usuarioRepository, never()).save(any());
        verify(auditoriaService).registrar(
                eq(AcaoAuditoria.ACESSO_NEGADO), eq(alunoId), eq("MODERACAO"), isNull(), any());
    }

    @Test
    void banir_adminInativaContaEInvalidaBloqueioTemporario() {
        UUID adminId = UUID.randomUUID();
        UUID alvoId = UUID.randomUUID();
        autenticar(adminId);
        Usuario admin = usuario(adminId, true);
        Usuario alvo = usuario(alvoId, false);
        when(usuarioRepository.findById(adminId)).thenReturn(Optional.of(admin));
        when(usuarioRepository.findById(alvoId)).thenReturn(Optional.of(alvo));
        when(usuarioRepository.save(alvo)).thenReturn(alvo);

        var resposta = moderacaoService.banir(alvoId);

        assertThat(alvo.getStatusConta()).isEqualTo(StatusConta.BANIDO);
        assertThat(alvo.getBloqueadoAte()).isNull();
        assertThat(resposta.statusConta()).isEqualTo(StatusConta.BANIDO);
        verify(auditoriaService).registrar(
                eq(AcaoAuditoria.USUARIO_BANIDO), eq(adminId), eq("USUARIO"), eq(alvoId.toString()), any());
    }

    @Test
    void aplicarTimeout_duracaoForaDaLista_deveFalhar() {
        UUID adminId = UUID.randomUUID();
        autenticar(adminId);
        when(usuarioRepository.findById(adminId)).thenReturn(Optional.of(usuario(adminId, true)));

        ResponseStatusException excecao = assertThrows(ResponseStatusException.class,
                () -> moderacaoService.aplicarTimeout(UUID.randomUUID(), new AplicarTimeoutRequest(12)));

        assertThat(excecao.getStatusCode().value()).isEqualTo(400);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void recomendarBoletim_enviaTextoOficialEMarcaEncaminhada() {
        UUID adminId = UUID.randomUUID();
        UUID denunciaId = UUID.randomUUID();
        autenticar(adminId);
        Usuario denunciante = usuario(UUID.randomUUID(), false);
        denunciante.setEmail("autor@aluno.test");
        denunciante.setNomeCompleto("Autor Aluno");
        Denuncia denuncia = Denuncia.builder()
                .id(denunciaId)
                .denunciante(denunciante)
                .denunciado(usuario(UUID.randomUUID(), false))
                .motivo(MotivoDenuncia.ASSEDIO)
                .descricao("Relato de conduta grave na aula.")
                .status(StatusDenuncia.PENDENTE)
                .build();
        when(usuarioRepository.findById(adminId)).thenReturn(Optional.of(usuario(adminId, true)));
        when(denunciaRepository.findById(denunciaId)).thenReturn(Optional.of(denuncia));
        when(denunciaRepository.save(denuncia)).thenReturn(denuncia);

        moderacaoService.recomendarBoletim(denunciaId);

        assertThat(denuncia.getStatus()).isEqualTo(StatusDenuncia.ENCAMINHADA);
        verify(notificacaoService).criarNotificacao(
                eq(denunciante),
                any(),
                eq(ModeracaoService.TEXTO_BO),
                eq(TipoNotificacao.MODERACAO),
                eq(denunciaId));
        verify(emailService).enviarRecomendacaoBoletim(
                eq("autor@aluno.test"), eq("Autor Aluno"), eq(ModeracaoService.TEXTO_BO));
        verify(auditoriaService).registrar(
                eq(AcaoAuditoria.DENUNCIA_BO_RECOMENDADO), eq(adminId), eq("DENUNCIA"), eq(denunciaId.toString()), any());
    }

    private void autenticar(UUID usuarioId) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(usuarioId, null, List.of()));
    }

    private Usuario usuario(UUID id, boolean admin) {
        return Usuario.builder()
                .id(id)
                .nomeCompleto("Pessoa")
                .email(id + "@conectapro.test")
                .admin(admin)
                .statusConta(StatusConta.ATIVO)
                .build();
    }
}
