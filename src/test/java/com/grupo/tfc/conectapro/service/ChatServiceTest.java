package com.grupo.tfc.conectapro.service;

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
                new EnviarMensagemRequest(destinatarioId, "  Olá, professor  "));

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
                eq(TipoNotificacao.CHAT));
    }

    @Test
    void enviarMensagem_semToken_deveFalhar() {
        SecurityContextHolder.clearContext();

        ResponseStatusException excecao = assertThrows(ResponseStatusException.class,
                () -> chatService.enviarMensagem(new EnviarMensagemRequest(destinatarioId, "oi")));

        assertThat(excecao.getStatusCode().value()).isEqualTo(401);
        verify(mensagemRepository, never()).save(any());
        verify(notificacaoService, never()).criarNotificacao(any(), any(), any(), any());
    }

    @Test
    void enviarMensagem_paraSiMesmo_deveFalhar() {
        ResponseStatusException excecao = assertThrows(ResponseStatusException.class,
                () -> chatService.enviarMensagem(new EnviarMensagemRequest(idUsuarioLogado, "oi")));

        assertThat(excecao.getStatusCode().value()).isEqualTo(400);
        verify(mensagemRepository, never()).save(any());
    }

    @Test
    void enviarMensagem_destinatarioInexistente_deveFalhar() {
        when(usuarioRepository.findById(idUsuarioLogado)).thenReturn(Optional.of(remetente));
        when(usuarioRepository.findById(destinatarioId)).thenReturn(Optional.empty());

        ResponseStatusException excecao = assertThrows(ResponseStatusException.class,
                () -> chatService.enviarMensagem(new EnviarMensagemRequest(destinatarioId, "oi")));

        assertThat(excecao.getStatusCode().value()).isEqualTo(404);
    }

    @Test
    void obterHistoricoSeguro_ignoraMensagemDeTerceiro() {
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

        List<MensagemResponse> historico = chatService.obterHistoricoSeguro(destinatarioId);

        assertThat(historico).hasSize(1);
        assertThat(historico.getFirst().conteudo()).isEqualTo("Pode ser amanhã");
        assertThat(historico.getFirst().remetente().id()).isEqualTo(destinatarioId);
        assertThat(historico.getFirst().toString()).doesNotContain("paulo@prof.com");
        verify(mensagemRepository).buscarConversaDoUsuario(idUsuarioLogado, destinatarioId);
    }

    private void autenticar(UUID usuarioId) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(usuarioId, null, List.of()));
    }
}
