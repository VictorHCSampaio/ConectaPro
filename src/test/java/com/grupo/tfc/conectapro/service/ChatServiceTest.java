package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.chat.ConversaResumoResponse;
import com.grupo.tfc.conectapro.dto.chat.EnviarMensagemRequest;
import com.grupo.tfc.conectapro.dto.chat.MensagemResponse;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.Mensagem;
import com.grupo.tfc.conectapro.model.TipoNotificacao;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.MensagemRepository;
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

import java.time.OffsetDateTime;
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
class ChatServiceTest {

    @Mock
    private MensagemRepository mensagemRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private ProfessorRepository professorRepository;
    @Mock
    private AuditoriaService auditoriaService;
    @Mock
    private NotificacaoService notificacaoService;

    @InjectMocks
    private ChatService chatService;

    private UUID idUsuarioLogado;
    private UUID destinatarioId;
    private Usuario remetente;
    private Usuario destinatario;

    @BeforeEach
    void setUp() {
        idUsuarioLogado = UUID.randomUUID();
        destinatarioId = UUID.randomUUID();
        remetente = Usuario.builder().id(idUsuarioLogado).nomeCompleto("Ana Aluna").email("ana@aluno.com").build();
        destinatario = Usuario.builder().id(destinatarioId).nomeCompleto("Paulo Professor").email("paulo@prof.com").build();
        autenticar(idUsuarioLogado);
    }

    @AfterEach
    void limparToken() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void enviarMensagem_usaRemetenteDoTokenENaoDoCorpo() {
        when(usuarioRepository.findById(idUsuarioLogado)).thenReturn(Optional.of(remetente));
        when(usuarioRepository.findById(destinatarioId)).thenReturn(Optional.of(destinatario));
        when(mensagemRepository.save(any(Mensagem.class))).thenAnswer(invocation -> {
            Mensagem mensagem = invocation.getArgument(0);
            mensagem.setId(UUID.randomUUID());
            return mensagem;
        });

        MensagemResponse response = chatService.enviarMensagem(
                new EnviarMensagemRequest(destinatarioId, "  Olá, professor  ", null));

        ArgumentCaptor<Mensagem> captor = ArgumentCaptor.forClass(Mensagem.class);
        verify(mensagemRepository).save(captor.capture());
        assertThat(captor.getValue().getRemetente().getId()).isEqualTo(idUsuarioLogado);
        assertThat(captor.getValue().getDestinatario().getId()).isEqualTo(destinatarioId);
        assertThat(captor.getValue().getConteudo()).isEqualTo("Olá, professor");
        assertThat(captor.getValue().isLida()).isFalse();
        assertThat(response.remetente().id()).isEqualTo(idUsuarioLogado);
        assertThat(response.remetente().nome()).isEqualTo("Ana Aluna");
        assertThat(response.remetente().avatarUrl()).isNull();
        assertThat(response.toString()).doesNotContain("ana@aluno.com");
        verify(auditoriaService).registrar(eq(AcaoAuditoria.MENSAGEM_ENVIADA), eq(idUsuarioLogado), eq("MENSAGEM"), any(), any());
        verify(notificacaoService).criarNotificacao(
                eq(destinatario),
                eq("Nova mensagem"),
                eq("Você recebeu uma nova mensagem de Ana Aluna."),
                eq(TipoNotificacao.CHAT),
                eq(idUsuarioLogado));
    }

    @Test
    void enviarMensagem_chaveRepetida_devolveMensagemExistenteSemSalvar() {
        UUID mensagemId = UUID.randomUUID();
        Mensagem existente = Mensagem.builder()
                .id(mensagemId)
                .remetente(remetente)
                .destinatario(destinatario)
                .conteudo("Olá, professor")
                .lida(false)
                .idempotencyKey("chave-1")
                .build();
        when(mensagemRepository.findByIdempotencyKey("chave-1")).thenReturn(Optional.of(existente));

        MensagemResponse response = chatService.enviarMensagem(
                new EnviarMensagemRequest(destinatarioId, "outra tentativa", "chave-1"));

        assertThat(response.id()).isEqualTo(mensagemId);
        assertThat(response.conteudo()).isEqualTo("Olá, professor");
        verify(mensagemRepository, never()).save(any());
        verify(notificacaoService, never()).criarNotificacao(any(), any(), any(), any());
    }

    @Test
    void enviarMensagem_semToken_deveFalhar() {
        SecurityContextHolder.clearContext();

        ResponseStatusException excecao = assertThrows(ResponseStatusException.class,
                () -> chatService.enviarMensagem(new EnviarMensagemRequest(destinatarioId, "oi", null)));

        assertThat(excecao.getStatusCode().value()).isEqualTo(401);
        verify(mensagemRepository, never()).save(any());
        verify(notificacaoService, never()).criarNotificacao(any(), any(), any(), any());
    }

    @Test
    void enviarMensagem_paraSiMesmo_deveFalhar() {
        ResponseStatusException excecao = assertThrows(ResponseStatusException.class,
                () -> chatService.enviarMensagem(new EnviarMensagemRequest(idUsuarioLogado, "oi", null)));

        assertThat(excecao.getStatusCode().value()).isEqualTo(400);
        verify(mensagemRepository, never()).save(any());
    }

    @Test
    void enviarMensagem_destinatarioInexistente_deveFalhar() {
        when(usuarioRepository.findById(idUsuarioLogado)).thenReturn(Optional.of(remetente));
        when(usuarioRepository.findById(destinatarioId)).thenReturn(Optional.empty());

        ResponseStatusException excecao = assertThrows(ResponseStatusException.class,
                () -> chatService.enviarMensagem(new EnviarMensagemRequest(destinatarioId, "oi", null)));

        assertThat(excecao.getStatusCode().value()).isEqualTo(404);
    }

    @Test
    void obterHistoricoSeguro_ignoraMensagemDeTerceiro() {
        when(usuarioRepository.findById(idUsuarioLogado)).thenReturn(Optional.of(remetente));
        when(usuarioRepository.findById(destinatarioId)).thenReturn(Optional.of(destinatario));
        Mensagem daConversa = Mensagem.builder()
                .id(UUID.randomUUID())
                .remetente(destinatario)
                .destinatario(remetente)
                .conteudo("Pode ser amanhã")
                .lida(false)
                .build();
        when(mensagemRepository.buscarNaoLidasRecebidas(idUsuarioLogado, destinatarioId))
                .thenReturn(List.of(daConversa));
        when(mensagemRepository.buscarConversaDoUsuario(idUsuarioLogado, destinatarioId))
                .thenReturn(List.of(daConversa));

        List<MensagemResponse> historico = chatService.obterHistoricoSeguro(destinatarioId);

        assertThat(daConversa.isLida()).isTrue();
        assertThat(daConversa.isEntregue()).isTrue();
        assertThat(historico).hasSize(1);
        assertThat(historico.getFirst().lida()).isTrue();
        assertThat(historico.getFirst().entregue()).isTrue();
        assertThat(historico.getFirst().conteudo()).isEqualTo("Pode ser amanhã");
        assertThat(historico.getFirst().remetente().id()).isEqualTo(destinatarioId);
        assertThat(historico.getFirst().toString()).doesNotContain("paulo@prof.com");
        verify(mensagemRepository).buscarNaoLidasRecebidas(idUsuarioLogado, destinatarioId);
        verify(mensagemRepository).buscarConversaDoUsuario(idUsuarioLogado, destinatarioId);
    }

    @Test
    void obterHistoricoSeguro_mensagemDeTerceiro_deveRetornar403() {
        when(usuarioRepository.findById(idUsuarioLogado)).thenReturn(Optional.of(remetente));
        when(usuarioRepository.findById(destinatarioId)).thenReturn(Optional.of(destinatario));
        Usuario terceiro = Usuario.builder().id(UUID.randomUUID()).nomeCompleto("Outra Pessoa").email("outra@x.com").build();
        Mensagem daConversa = Mensagem.builder()
                .id(UUID.randomUUID())
                .remetente(destinatario)
                .destinatario(remetente)
                .conteudo("Pode ser amanhã")
                .lida(false)
                .build();
        Mensagem alheia = Mensagem.builder()
                .id(UUID.randomUUID())
                .remetente(terceiro)
                .destinatario(destinatario)
                .conteudo("segredo entre terceiros")
                .lida(false)
                .build();
        when(mensagemRepository.buscarConversaDoUsuario(idUsuarioLogado, destinatarioId))
                .thenReturn(List.of(daConversa, alheia));

        ResponseStatusException excecao = assertThrows(ResponseStatusException.class,
                () -> chatService.obterHistoricoSeguro(destinatarioId));

        assertThat(excecao.getStatusCode().value()).isEqualTo(403);
        assertThat(excecao.getReason()).isEqualTo("Acesso negado a esta conversa");
        verify(auditoriaService).registrar(eq(AcaoAuditoria.ACESSO_NEGADO), eq(idUsuarioLogado), eq("MENSAGEM"),
                eq(alheia.getId().toString()), any());
    }

    @Test
    void enviarMensagem_chaveDeOutroRemetente_deveRetornar403() {
        Usuario terceiro = Usuario.builder().id(UUID.randomUUID()).nomeCompleto("Terceiro").email("terceiro@x.com").build();
        Usuario quarto = Usuario.builder().id(UUID.randomUUID()).nomeCompleto("Quarto").email("quarto@x.com").build();
        Mensagem alheia = Mensagem.builder()
                .id(UUID.randomUUID())
                .remetente(terceiro)
                .destinatario(quarto)
                .conteudo("segredo alheio")
                .lida(false)
                .idempotencyKey("chave-alheia")
                .build();
        when(mensagemRepository.findByIdempotencyKey("chave-alheia")).thenReturn(Optional.of(alheia));

        ResponseStatusException excecao = assertThrows(ResponseStatusException.class,
                () -> chatService.enviarMensagem(new EnviarMensagemRequest(destinatarioId, "oi", "chave-alheia")));

        assertThat(excecao.getStatusCode().value()).isEqualTo(403);
        verify(mensagemRepository, never()).save(any());
    }

    @Test
    void listarConversas_agrupaPeloOutroParticipanteEMantemAMaisRecente() {
        OffsetDateTime antiga = OffsetDateTime.parse("2026-11-10T10:00:00Z");
        OffsetDateTime recente = OffsetDateTime.parse("2026-11-15T18:00:00Z");
        Mensagem minhaNaoLida = Mensagem.builder()
                .id(UUID.randomUUID())
                .remetente(remetente)
                .destinatario(destinatario)
                .conteudo("ainda não lida por ele")
                .lida(false)
                .entregue(false)
                .dataEnvio(antiga.minusHours(1))
                .build();
        Mensagem primeira = Mensagem.builder()
                .id(UUID.randomUUID())
                .remetente(remetente)
                .destinatario(destinatario)
                .conteudo("mensagem antiga")
                .lida(true)
                .dataEnvio(antiga)
                .build();
        Mensagem naoLida = Mensagem.builder()
                .id(UUID.randomUUID())
                .remetente(destinatario)
                .destinatario(remetente)
                .conteudo("pode ser amanhã")
                .lida(false)
                .dataEnvio(recente)
                .build();
        when(mensagemRepository.buscarMensagensDoUsuario(idUsuarioLogado))
                .thenReturn(List.of(naoLida, primeira, minhaNaoLida));

        List<ConversaResumoResponse> conversas = chatService.listarConversas();

        assertThat(conversas).hasSize(1);
        assertThat(conversas.getFirst().participante().id()).isEqualTo(destinatarioId);
        assertThat(conversas.getFirst().participante().nome()).isEqualTo("Paulo Professor");
        assertThat(conversas.getFirst().ultimaMensagem()).isEqualTo("pode ser amanhã");
        assertThat(conversas.getFirst().enviadaPorMim()).isFalse();
        assertThat(conversas.getFirst().naoLidas()).isEqualTo(1);
        assertThat(conversas.getFirst().toString()).doesNotContain("paulo@prof.com");
        verify(mensagemRepository).buscarNaoEntregues(idUsuarioLogado);
    }

    private void autenticar(UUID usuarioId) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(usuarioId, null, List.of()));
    }
}
