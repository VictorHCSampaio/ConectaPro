package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.notificacao.NotificacaoResponse;
import com.grupo.tfc.conectapro.model.Notificacao;
import com.grupo.tfc.conectapro.model.TipoNotificacao;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.NotificacaoRepository;
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
class NotificacaoServiceTest {

    @Mock
    private NotificacaoRepository notificacaoRepository;
    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private NotificacaoService notificacaoService;

    @AfterEach
    void limparToken() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void listar_usaUsuarioDoSecurityContext() {
        UUID usuarioId = UUID.randomUUID();
        autenticar(usuarioId);
        Notificacao notificacao = notificacao(usuarioId, false);
        when(notificacaoRepository.findByUsuarioIdOrderByDataCriacaoDesc(usuarioId)).thenReturn(List.of(notificacao));

        List<NotificacaoResponse> lista = notificacaoService.listarNotificacoesDoUsuario();

        assertThat(lista).hasSize(1);
        assertThat(lista.getFirst().id()).isEqualTo(notificacao.getId());
        assertThat(lista.getFirst().tipo()).isEqualTo(TipoNotificacao.CHAT);
        verify(notificacaoRepository).findByUsuarioIdOrderByDataCriacaoDesc(usuarioId);
    }

    @Test
    void listar_semToken_deveFalhar() {
        ResponseStatusException excecao = assertThrows(ResponseStatusException.class,
                () -> notificacaoService.listarNotificacoesDoUsuario());

        assertThat(excecao.getStatusCode().value()).isEqualTo(401);
    }

    @Test
    void marcarComoLida_doDono_marcaEDevolve() {
        UUID usuarioId = UUID.randomUUID();
        autenticar(usuarioId);
        Notificacao notificacao = notificacao(usuarioId, false);
        when(notificacaoRepository.findById(notificacao.getId())).thenReturn(Optional.of(notificacao));
        when(notificacaoRepository.save(notificacao)).thenReturn(notificacao);

        NotificacaoResponse resposta = notificacaoService.marcarComoLida(notificacao.getId());

        assertThat(resposta.lida()).isTrue();
        assertThat(notificacao.isLida()).isTrue();
    }

    @Test
    void marcarComoLida_deOutroUsuario_deveFalhar() {
        autenticar(UUID.randomUUID());
        Notificacao notificacao = notificacao(UUID.randomUUID(), false);
        when(notificacaoRepository.findById(notificacao.getId())).thenReturn(Optional.of(notificacao));

        ResponseStatusException excecao = assertThrows(ResponseStatusException.class,
                () -> notificacaoService.marcarComoLida(notificacao.getId()));

        assertThat(excecao.getStatusCode().value()).isEqualTo(403);
        verify(notificacaoRepository, never()).save(any());
    }

    private Notificacao notificacao(UUID usuarioId, boolean lida) {
        return Notificacao.builder()
                .id(UUID.randomUUID())
                .usuario(Usuario.builder().id(usuarioId).nomeCompleto("Ana").build())
                .titulo("Nova mensagem")
                .mensagem("Você recebeu uma nova mensagem de Paulo.")
                .lida(lida)
                .dataCriacao(OffsetDateTime.parse("2026-11-12T10:00:00-03:00"))
                .tipo(TipoNotificacao.CHAT)
                .build();
    }

    private void autenticar(UUID usuarioId) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(usuarioId, null, List.of()));
    }
}
