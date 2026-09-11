package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.auth.RegisterRequest;
import com.grupo.tfc.conectapro.dto.auth.TotpSetupResponse;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Objects;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class AuthenticationService {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);
    private final UsuarioRepository usuarioRepository;
    private final TotpService totpService;
    private final SenhaService senhaService;

    public AuthenticationService(UsuarioRepository usuarioRepository, TotpService totpService, SenhaService senhaService) {
        this.usuarioRepository = usuarioRepository;
        this.totpService = totpService;
        this.senhaService = senhaService;
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
                .build();
        Usuario savedUsuario = Objects.requireNonNull(usuarioRepository.save(usuario));
        logger.info("Usuário registrado com sucesso. usuarioId={}", savedUsuario.getId());

        return new TotpSetupResponse(
                secret,
                totpService.qrUriGenerator(savedUsuario.getEmail(), secret)
        );
    }

    public void login(String email, String senha, HttpSession session){
        logger.info("Tentativa de login. email={}", email);

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.warn("Falha no login, usuário não encontrado");
                    return new ResponseStatusException(UNAUTHORIZED, "Credênciais inválidas");
                });

        if (!senhaService.match(senha, usuario.getSenhaHash())){
            logger.warn("Falha ao realizar o login, senha inválida");
            throw new ResponseStatusException(UNAUTHORIZED, "Credênciais inválidas");
        }

        session.setAttribute("usuario", usuario.getId());
        logger.info("Login realizado com sucesso");
    }
}
