package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.config.UsuarioAutenticado;
import com.grupo.tfc.conectapro.dto.chat.ConversaResumoResponse;
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

import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
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

        String chave = chaveIdempotencia(request.idempotencyKey());
        if (chave != null) {
            Optional<Mensagem> existente = mensagemRepository.findByIdempotencyKey(chave);
            if (existente.isPresent()) {
                exigirParticipante(existente.get(), idUsuarioLogado);
                return paraResponse(existente.get(), avataresDaMensagem(existente.get()));
            }
        }

        Usuario remetente = buscarUsuario(idUsuarioLogado);
        Usuario destinatario = buscarUsuario(request.destinatarioId());
        // a conversa é o par de usuários. aula marcada não é pré-requisito.

        Mensagem mensagem = Mensagem.builder()
                .remetente(remetente)
                .destinatario(destinatario)
                .conteudo(request.conteudo().trim())
                .lida(false)
                .idempotencyKey(chave)
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
                TipoNotificacao.CHAT,
                remetente.getId());

        Map<UUID, String> avatares = avataresDe(idUsuarioLogado, destinatario.getId());
        return paraResponse(salva, avatares);
    }

    @Transactional
    public List<ConversaResumoResponse> listarConversas() {
        UUID idUsuarioLogado = UsuarioAutenticado.exigirUsuarioId();
        marcarEntregues(idUsuarioLogado);
        Map<UUID, ConversaEmAberto> porParticipante = new LinkedHashMap<>();

        for (Mensagem mensagem : mensagemRepository.buscarMensagensDoUsuario(idUsuarioLogado)) {
            exigirParticipante(mensagem, idUsuarioLogado);
            boolean euEnviei = idUsuarioLogado.equals(mensagem.getRemetente().getId());
            Usuario outro = euEnviei ? mensagem.getDestinatario() : mensagem.getRemetente();
            ConversaEmAberto conversa = porParticipante.computeIfAbsent(
                    outro.getId(), id -> new ConversaEmAberto(outro));
            if (conversa.ultima == null
                    || mensagem.getDataEnvio().isAfter(conversa.ultima.getDataEnvio())) {
                conversa.ultima = mensagem;
            }
            boolean recebidaPorMim = idUsuarioLogado.equals(mensagem.getDestinatario().getId());
            if (recebidaPorMim && !mensagem.isLida()) {
                conversa.naoLidas++;
            }
        }

        return porParticipante.values().stream()
                .filter(conversa -> conversa.ultima != null)
                .sorted(Comparator.comparing((ConversaEmAberto conversa) -> conversa.ultima.getDataEnvio()).reversed())
                .map(conversa -> paraResumo(conversa, idUsuarioLogado))
                .toList();
    }

    @Transactional
    public List<MensagemResponse> obterHistoricoSeguro(UUID idOutroUsuario) {
        UUID idUsuarioLogado = UsuarioAutenticado.exigirUsuarioId();
        if (idUsuarioLogado.equals(idOutroUsuario)) {
            throw new ResponseStatusException(BAD_REQUEST, "Não é possível consultar uma conversa consigo mesmo");
        }

        buscarUsuario(idUsuarioLogado);
        buscarUsuario(idOutroUsuario);
        Map<UUID, Mensagem> lidasAgora = marcarLidas(idUsuarioLogado, idOutroUsuario);

        // trava pra ninguem bisbilhotar chat alheio
        List<Mensagem> conversa = mensagemRepository
                .buscarConversaDoUsuario(idUsuarioLogado, idOutroUsuario)
                .stream()
                .map(mensagem -> lidasAgora.getOrDefault(mensagem.getId(), mensagem))
                .toList();
        for (Mensagem mensagem : conversa) {
            exigirPar(mensagem, idUsuarioLogado, idOutroUsuario);
        }

        Map<UUID, String> avatares = avataresDe(idUsuarioLogado, idOutroUsuario);
        return conversa.stream()
                .map(mensagem -> paraResponse(mensagem, avatares))
                .toList();
    }

    private void marcarEntregues(UUID idUsuarioLogado) {
        List<Mensagem> pendentes = mensagemRepository.buscarNaoEntregues(idUsuarioLogado);
        if (pendentes.isEmpty()) {
            return;
        }
        for (Mensagem mensagem : pendentes) {
            mensagem.setEntregue(true);
        }
        mensagemRepository.saveAllAndFlush(pendentes);
    }

    private Map<UUID, Mensagem> marcarLidas(UUID idUsuarioLogado, UUID idOutroUsuario) {
        List<Mensagem> pendentes = mensagemRepository.buscarNaoLidasRecebidas(idUsuarioLogado, idOutroUsuario);
        Map<UUID, Mensagem> atualizadas = new HashMap<>();
        if (pendentes.isEmpty()) {
            return atualizadas;
        }
        for (Mensagem mensagem : pendentes) {
            mensagem.setEntregue(true);
            mensagem.setLida(true);
            atualizadas.put(mensagem.getId(), mensagem);
        }
        mensagemRepository.saveAllAndFlush(pendentes);
        return atualizadas;
    }

    private String chaveIdempotencia(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return null;
        }
        return idempotencyKey.trim();
    }

    private Map<UUID, String> avataresDaMensagem(Mensagem mensagem) {
        return avataresDe(mensagem.getRemetente().getId(), mensagem.getDestinatario().getId());
    }

    private boolean participa(Mensagem mensagem, UUID idUsuarioLogado) {
        return idUsuarioLogado.equals(mensagem.getRemetente().getId())
                || idUsuarioLogado.equals(mensagem.getDestinatario().getId());
    }

    private void exigirParticipante(Mensagem mensagem, UUID idUsuarioLogado) {
        if (!participa(mensagem, idUsuarioLogado)) {
            negarAcesso(idUsuarioLogado, mensagem.getId(), "usuario nao participa da mensagem");
        }
    }

    private void exigirPar(Mensagem mensagem, UUID idUsuarioLogado, UUID idOutroUsuario) {
        if (!ehDestaConversa(mensagem, idUsuarioLogado, idOutroUsuario)) {
            negarAcesso(idUsuarioLogado, mensagem.getId(), "mensagem fora do par autenticado");
        }
    }

    private void negarAcesso(UUID usuarioId, UUID mensagemId, String detalhe) {
        logger.warn("Acesso negado ao chat. usuarioId={} mensagemId={}", usuarioId, mensagemId);
        auditoriaService.registrar(AcaoAuditoria.ACESSO_NEGADO, usuarioId, "MENSAGEM",
                mensagemId == null ? null : mensagemId.toString(), detalhe);
        throw new ResponseStatusException(FORBIDDEN, "Acesso negado a esta conversa");
    }

    private ConversaResumoResponse paraResumo(ConversaEmAberto conversa, UUID idUsuarioLogado) {
        Usuario participante = conversa.participante;
        Mensagem ultima = conversa.ultima;
        return new ConversaResumoResponse(
                new ParticipanteChatResponse(participante.getId(), participante.getNomeCompleto(), avatarDe(participante.getId())),
                ultima.getConteudo(),
                ultima.getDataEnvio(),
                idUsuarioLogado.equals(ultima.getRemetente().getId()),
                conversa.naoLidas
        );
    }

    private boolean ehDestaConversa(Mensagem mensagem, UUID idUsuarioLogado, UUID idOutroUsuario) {
        UUID remetenteId = mensagem.getRemetente().getId();
        UUID destinatarioId = mensagem.getDestinatario().getId();
        boolean enviou = idUsuarioLogado.equals(remetenteId) && idOutroUsuario.equals(destinatarioId);
        boolean recebeu = idUsuarioLogado.equals(destinatarioId) && idOutroUsuario.equals(remetenteId);
        return enviou || recebeu;
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
                mensagem.isEntregue(),
                mensagem.getDataEnvio()
        );
    }

    private static final class ConversaEmAberto {
        private final Usuario participante;
        private Mensagem ultima;
        private long naoLidas;

        private ConversaEmAberto(Usuario participante) {
            this.participante = participante;
        }
    }
}
