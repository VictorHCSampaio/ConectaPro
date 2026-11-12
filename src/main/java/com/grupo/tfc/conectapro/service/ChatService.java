package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.config.UsuarioAutenticado;
import com.grupo.tfc.conectapro.dto.chat.EnviarMensagemRequest;
import com.grupo.tfc.conectapro.dto.chat.MensagemResponse;
import com.grupo.tfc.conectapro.dto.chat.ParticipanteChatResponse;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.Mensagem;
import com.grupo.tfc.conectapro.model.Professor;
import com.grupo.tfc.conectapro.model.TipoNotificacao;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.MensagemRepository;
import com.grupo.tfc.conectapro.repository.ProfessorRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ChatService {

    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);

    private final MensagemRepository mensagemRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProfessorRepository professorRepository;
    private final AuditoriaService auditoriaService;
    private final NotificacaoService notificacaoService;

    public ChatService(MensagemRepository mensagemRepository,
                       UsuarioRepository usuarioRepository,
                       ProfessorRepository professorRepository,
                       AuditoriaService auditoriaService,
                       NotificacaoService notificacaoService) {
        this.mensagemRepository = mensagemRepository;
        this.usuarioRepository = usuarioRepository;
        this.professorRepository = professorRepository;
        this.auditoriaService = auditoriaService;
        this.notificacaoService = notificacaoService;
    }

    @Transactional
    public MensagemResponse enviarMensagem(EnviarMensagemRequest request) {
        // pega o user logado do token pra evitar fraude
        UUID idUsuarioLogado = UsuarioAutenticado.exigirUsuarioId();
        if (idUsuarioLogado.equals(request.destinatarioId())) {
            throw new ResponseStatusException(BAD_REQUEST, "Não é possível enviar mensagem para você mesmo");
        }

        Usuario remetente = buscarUsuario(idUsuarioLogado);
        Usuario destinatario = buscarUsuario(request.destinatarioId());

        Mensagem mensagem = Mensagem.builder()
                .remetente(remetente)
                .destinatario(destinatario)
                .conteudo(request.conteudo().trim())
                .lida(false)
                .build();

        Mensagem salva = mensagemRepository.save(mensagem);
        // so id de rastreio. texto da mensagem nao vai pro log
        logger.info("Mensagem enviada. mensagemId={} remetenteId={} destinatarioId={}",
                salva.getId(), idUsuarioLogado, destinatario.getId());
        auditoriaService.registrar(AcaoAuditoria.MENSAGEM_ENVIADA, idUsuarioLogado, "MENSAGEM",
                salva.getId().toString(), "destinatarioId=" + destinatario.getId());
        notificacaoService.criarNotificacao(
                destinatario,
                "Nova mensagem",
                "Você recebeu uma nova mensagem de " + remetente.getNomeCompleto() + ".",
                TipoNotificacao.CHAT);

        Map<UUID, String> avatares = avataresDe(idUsuarioLogado, destinatario.getId());
        return paraResponse(salva, avatares);
    }

    @Transactional(readOnly = true)
    public List<MensagemResponse> obterHistoricoSeguro(UUID idOutroUsuario) {
        UUID idUsuarioLogado = UsuarioAutenticado.exigirUsuarioId();
        if (idUsuarioLogado.equals(idOutroUsuario)) {
            throw new ResponseStatusException(BAD_REQUEST, "Não é possível consultar uma conversa consigo mesmo");
        }

        buscarUsuario(idUsuarioLogado);
        buscarUsuario(idOutroUsuario);

        // trava pra ninguem bisbilhotar chat alheio
        List<Mensagem> conversa = mensagemRepository
                .buscarConversaDoUsuario(idUsuarioLogado, idOutroUsuario)
                .stream()
                .filter(mensagem -> ehDestaConversa(mensagem, idUsuarioLogado, idOutroUsuario))
                .toList();

        Map<UUID, String> avatares = avataresDe(idUsuarioLogado, idOutroUsuario);
        return conversa.stream()
                .map(mensagem -> paraResponse(mensagem, avatares))
                .toList();
    }

    private boolean ehDestaConversa(Mensagem mensagem, UUID idUsuarioLogado, UUID idOutroUsuario) {
        UUID remetenteId = mensagem.getRemetente().getId();
        UUID destinatarioId = mensagem.getDestinatario().getId();
        boolean enviou = idUsuarioLogado.equals(remetenteId) && idOutroUsuario.equals(destinatarioId);
        boolean recebeu = idUsuarioLogado.equals(destinatarioId) && idOutroUsuario.equals(remetenteId);
        if (enviou || recebeu) {
            return true;
        }
        logger.warn("Mensagem fora da conversa ignorada. mensagemId={} usuarioId={}",
                mensagem.getId(), idUsuarioLogado);
        return false;
    }

    private Usuario buscarUsuario(UUID usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));
    }

    private Map<UUID, String> avataresDe(UUID primeiroId, UUID segundoId) {
        Map<UUID, String> avatares = new HashMap<>();
        avatares.put(primeiroId, avatarDe(primeiroId));
        avatares.put(segundoId, avatarDe(segundoId));
        return avatares;
    }

    private String avatarDe(UUID usuarioId) {
        Optional<Professor> perfil = professorRepository.findByUsuarioId(usuarioId);
        if (perfil == null || perfil.isEmpty()) {
            return null;
        }
        String avatar = perfil.get().getAvatarUrl();
        if (avatar == null || avatar.isBlank()) {
            return null;
        }
        return avatar;
    }

    // LGPD: filtra os dados sensiveis no DTO
    private MensagemResponse paraResponse(Mensagem mensagem, Map<UUID, String> avatares) {
        Usuario remetente = mensagem.getRemetente();
        Usuario destinatario = mensagem.getDestinatario();
        return new MensagemResponse(
                mensagem.getId(),
                new ParticipanteChatResponse(remetente.getId(), remetente.getNomeCompleto(), avatares.get(remetente.getId())),
                new ParticipanteChatResponse(destinatario.getId(), destinatario.getNomeCompleto(), avatares.get(destinatario.getId())),
                mensagem.getConteudo(),
                mensagem.isLida(),
                mensagem.getDataEnvio()
        );
    }
}
