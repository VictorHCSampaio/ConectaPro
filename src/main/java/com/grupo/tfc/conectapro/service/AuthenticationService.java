package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.config.SessaoUsuario;
import com.grupo.tfc.conectapro.dto.auth.RegisterRequest;
import com.grupo.tfc.conectapro.dto.auth.TotpSetupResponse;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Objects;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class AuthenticationService {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);
    private final UsuarioRepository usuarioRepository;
    private final TotpService totpService;
    private final SenhaService senhaService;
    private final AuditoriaService auditoriaService;

    public AuthenticationService(UsuarioRepository usuarioRepository, TotpService totpService, SenhaService senhaService, AuditoriaService auditoriaService) {
        this.usuarioRepository = usuarioRepository;
        this.totpService = totpService;
        this.senhaService = senhaService;
        this.auditoriaService = auditoriaService;
    }

    public TotpSetupResponse register(RegisterRequest request){
        usuarioRepository.findByEmail(request.email()).ifPresent(user -> {
            throw new ResponseStatusException(BAD_REQUEST, "Email ja cadastrado");
        });

        String secret = totpService.secretGenerator();

        Usuario usuario = Usuario.builder()
                .nomeCompleto(request.nome())
                .email(request.email())
                .senhaHash(senhaService.senhaHash(request.password()))
                .tipo(resolverTipo(request.role()))
                .build();
        Usuario savedUsuario = Objects.requireNonNull(usuarioRepository.save(usuario));
        logger.info("Usuário registrado com sucesso. usuarioId={}", savedUsuario.getId());
        auditoriaService.registrar(AcaoAuditoria.CADASTRO, savedUsuario.getId(), "USUARIO", savedUsuario.getId().toString(), "tipo=" + savedUsuario.getTipo());

        return new TotpSetupResponse(
                secret,
                totpService.qrUriGenerator(savedUsuario.getEmail(), secret)
        );
    }

    private TipoUsuario resolverTipo(String role) {
        if (role == null || role.isBlank()) {
            return TipoUsuario.ALUNO;
        }
        try {
            return TipoUsuario.valueOf(role.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(BAD_REQUEST, "Tipo de usuário inválido");
        }
    }

    public Usuario login(String email, String senha, HttpSession session){
        logger.info("Tentativa de login. email={}", email);

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.warn("Falha no login, usuário não encontrado");
                    auditoriaService.registrar(AcaoAuditoria.LOGIN_FALHA, null, "USUARIO", null, "usuário não encontrado. email=" + email);
                    return new ResponseStatusException(UNAUTHORIZED, "Credênciais inválidas");
                });

        if (!senhaService.match(senha, usuario.getSenhaHash())){
            logger.warn("Falha ao realizar o login, senha inválida");
            auditoriaService.registrar(AcaoAuditoria.LOGIN_FALHA, usuario.getId(), "USUARIO", usuario.getId().toString(), "senha inválida");
            throw new ResponseStatusException(UNAUTHORIZED, "Credênciais inválidas");
        }

        session.setAttribute(SessaoUsuario.ATRIBUTO, usuario.getId());
        logger.info("Login realizado com sucesso");
        auditoriaService.registrar(AcaoAuditoria.LOGIN_SUCESSO, usuario.getId(), "USUARIO", usuario.getId().toString(), null);
        return usuario;
    }

    public void logout(HttpSession session){
        if (session == null) {
            return;
        }
        if (session.getAttribute(SessaoUsuario.ATRIBUTO) instanceof UUID usuarioId) {
            auditoriaService.registrar(AcaoAuditoria.LOGOUT, usuarioId, "USUARIO", usuarioId.toString(), null);
        }
        session.invalidate();
    }

    public Usuario buscarUsuarioDaSessao(HttpSession session){
        UUID usuarioId = SessaoUsuario.exigirUsuarioId(session);
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Sessão expirada. Entre novamente."));
    }
}
