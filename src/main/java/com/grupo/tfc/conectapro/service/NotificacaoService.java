package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.config.UsuarioAutenticado;
import com.grupo.tfc.conectapro.dto.notificacao.NotificacaoResponse;
import com.grupo.tfc.conectapro.model.Notificacao;
import com.grupo.tfc.conectapro.model.TipoNotificacao;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.NotificacaoRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class NotificacaoService {

    private static final Logger logger = LoggerFactory.getLogger(NotificacaoService.class);

    private final NotificacaoRepository notificacaoRepository;
    private final UsuarioRepository usuarioRepository;

    public NotificacaoService(NotificacaoRepository notificacaoRepository,
                              UsuarioRepository usuarioRepository) {
        this.notificacaoRepository = notificacaoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public Notificacao criarNotificacao(Usuario usuario, String titulo, String mensagem, TipoNotificacao tipo) {
        if (usuario == null || usuario.getId() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Destinatário da notificação é obrigatório");
        }
        if (titulo == null || titulo.isBlank() || mensagem == null || mensagem.isBlank() || tipo == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Notificação incompleta");
        }

        Usuario destinatario = usuarioRepository.getReferenceById(usuario.getId());
        Notificacao notificacao = Notificacao.builder()
                .usuario(destinatario)
                .titulo(titulo.trim())
                .mensagem(mensagem.trim())
                .lida(false)
                .tipo(tipo)
                .build();

        Notificacao salva = notificacaoRepository.save(notificacao);
        logger.info("Notificacao criada. notificacaoId={} usuarioId={} tipo={}",
                salva.getId(), usuario.getId(), tipo);
        return salva;
    }

    @Transactional(readOnly = true)
    public List<NotificacaoResponse> listarNotificacoesDoUsuario() {
        UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
        return notificacaoRepository.findByUsuarioIdOrderByDataCriacaoDesc(usuarioId).stream()
                .map(this::paraResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long contarNaoLidasDoUsuario() {
        UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
        return notificacaoRepository.countByUsuarioIdAndLidaFalse(usuarioId);
    }

    @Transactional
    public NotificacaoResponse marcarComoLida(UUID id) {
        UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
        Notificacao notificacao = notificacaoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Notificação não encontrada"));

        if (notificacao.getUsuario() == null || !usuarioId.equals(notificacao.getUsuario().getId())) {
            throw new ResponseStatusException(FORBIDDEN, "Esta notificação não pertence a você");
        }

        notificacao.setLida(true);
        return paraResponse(notificacaoRepository.save(notificacao));
    }

    private NotificacaoResponse paraResponse(Notificacao notificacao) {
        return new NotificacaoResponse(
                notificacao.getId(),
                notificacao.getTitulo(),
                notificacao.getMensagem(),
                notificacao.isLida(),
                notificacao.getDataCriacao(),
                notificacao.getTipo()
        );
    }
}
