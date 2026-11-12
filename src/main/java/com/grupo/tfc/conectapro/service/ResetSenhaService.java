package com.grupo.tfc.conectapro.service;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.grupo.tfc.conectapro.config.EmailProperties;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

@Service
public class ResetSenhaService {

    private static final Logger logger = LoggerFactory.getLogger(ResetSenhaService.class);

    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final SenhaService senhaService;
    private final EmailService emailService;
    private final AuditoriaService auditoriaService;
    private final EmailProperties emailProperties;

    public ResetSenhaService(UsuarioRepository usuarioRepository, JwtService jwtService,
                             SenhaService senhaService, EmailService emailService,
                             AuditoriaService auditoriaService, EmailProperties emailProperties) {
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
        this.senhaService = senhaService;
        this.emailService = emailService;
        this.auditoriaService = auditoriaService;
        this.emailProperties = emailProperties;
    }

    public void solicitarReset(String email) {
        Optional<Usuario> optUsuario = usuarioRepository.findByEmail(email);
        if (optUsuario.isEmpty()) {
            logger.debug("Solicitação de reset para email inexistente (resposta genérica retornada)");
            return;
        }
        Usuario usuario = optUsuario.get();
        String token = jwtService.gerarPasswordResetToken(
                usuario.getId(),
                usuario.getSenhaHash(),
                emailProperties.reset().expiracaoMinutos()
        );
        String linkReset = emailProperties.frontendBaseUrl() + "/reset-password?token=" + token;
        emailService.enviarEmailResetSenha(usuario.getEmail(), usuario.getNomeCompleto(), linkReset);
        auditoriaService.registrar(
                AcaoAuditoria.RESET_SENHA_SOLICITADO,
                usuario.getId(),
                "USUARIO",
                usuario.getId().toString(),
                null
        );
        logger.info("Token de reset gerado. usuarioId={}", usuario.getId());
    }

    @Transactional
    public void confirmarReset(String token, String novaSenha) {
        UUID userId = extrairUserIdDoToken(token);
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token de recuperação inválido"));
        DecodedJWT jwt = jwtService.validarPasswordResetToken(token, usuario.getSenhaHash());
        if (jwt == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token de recuperação inválido ou expirado");
        }
        usuario.setSenhaHash(senhaService.senhaHash(novaSenha));
        usuarioRepository.save(usuario);
        auditoriaService.registrar(
                AcaoAuditoria.RESET_SENHA_CONFIRMADO,
                usuario.getId(),
                "USUARIO",
                usuario.getId().toString(),
                null
        );
        logger.info("Senha redefinida via reset. usuarioId={}", usuario.getId());
    }

    private UUID extrairUserIdDoToken(String token) {
        try {
            return UUID.fromString(com.auth0.jwt.JWT.decode(token).getSubject());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token de recuperação inválido");
        }
    }
}