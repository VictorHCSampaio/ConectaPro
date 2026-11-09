package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.config.SecurityAuthenticationProperties;
import com.grupo.tfc.conectapro.config.UsuarioAutenticado;
import com.grupo.tfc.conectapro.dto.auth.LoginResponse;
import com.grupo.tfc.conectapro.dto.auth.RegisterRequest;
import com.grupo.tfc.conectapro.dto.auth.TotpConfiguracaoResponse;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.StatusConta;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
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
    private final JwtService jwtService;
    private final SecurityAuthenticationProperties authProperties;

    public AuthenticationService(UsuarioRepository usuarioRepository, TotpService totpService,
                                 SenhaService senhaService, AuditoriaService auditoriaService,
                                 JwtService jwtService, SecurityAuthenticationProperties authProperties) {
        this.usuarioRepository = usuarioRepository;
        this.totpService = totpService;
        this.senhaService = senhaService;
        this.auditoriaService = auditoriaService;
        this.jwtService = jwtService;
        this.authProperties = authProperties;
    }

    public TotpConfiguracaoResponse register(RegisterRequest request) {
        usuarioRepository.findByEmail(request.email()).ifPresent(user -> {
            throw new ResponseStatusException(BAD_REQUEST, "Email ja cadastrado");
        });

        String secret = totpService.gerarSegredo();

        TipoUsuario tipo = resolverTipo(request.role());

        Usuario usuario = Usuario.builder()
                .nomeCompleto(request.nome())
                .email(request.email())
                .senhaHash(senhaService.senhaHash(request.password()))
                .tipo(tipo)
                .segredoTotp(secret)
                .statusConta(tipo == TipoUsuario.PROFESSOR ? StatusConta.PENDENTE_PAGAMENTO : StatusConta.ATIVO)
                .criadoEm(OffsetDateTime.now())
                .build();
        Usuario savedUsuario = Objects.requireNonNull(usuarioRepository.save(usuario));
        logger.info("Usuário registrado com sucesso. usuarioId={}", savedUsuario.getId());
        auditoriaService.registrar(AcaoAuditoria.CADASTRO, savedUsuario.getId(), "USUARIO", savedUsuario.getId().toString(), "tipo=" + savedUsuario.getTipo());

        return new TotpConfiguracaoResponse(
                secret,
                totpService.gerarQrUri(savedUsuario.getEmail(), secret)
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

    public LoginResponse login(String email, String senha) {
        logger.info("Tentativa de login. email={}", email);

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.warn("Falha no login, usuário não encontrado");
                    auditoriaService.registrar(AcaoAuditoria.LOGIN_FALHA, null, "USUARIO", null, "usuário não encontrado. email=" + email);
                    return new ResponseStatusException(UNAUTHORIZED, "Credênciais inválidas");
                });

        verificarBloqueio(usuario);

        if (!senhaService.match(senha, usuario.getSenhaHash())) {
            registrarFalhaLogin(usuario);
            throw new ResponseStatusException(UNAUTHORIZED, "Credênciais inválidas");
        }

        resetarTentativas(usuario);

        if (usuario.isTotpAtivo()) {
            String preAuthToken = jwtService.gerarPreAuthToken(usuario.getId());
            logger.info("Login primário realizado. TOTP exigido. usuarioId={}", usuario.getId());
            return LoginResponse.totpRequired(preAuthToken);
        }

        String token = jwtService.gerarToken(usuario.getId(), usuario.getTipo().name(), usuario.isAdmin());
        logger.info("Login realizado com sucesso");
        auditoriaService.registrar(AcaoAuditoria.LOGIN_SUCESSO, usuario.getId(), "USUARIO", usuario.getId().toString(), null);
        return LoginResponse.authenticated(token, usuario.getNomeCompleto(), usuario.getTipo(), usuario.isAdmin(), usuario.getStatusConta());
    }

    private void verificarBloqueio(Usuario usuario) {
        if (usuario.getBloqueadoAte() == null) return;

        if (OffsetDateTime.now().isBefore(usuario.getBloqueadoAte())) {
            logger.warn("Login bloqueado temporariamente. usuarioId={}", usuario.getId());
            auditoriaService.registrar(AcaoAuditoria.LOGIN_FALHA, usuario.getId(), "USUARIO", usuario.getId().toString(), "conta bloqueada temporariamente");
            throw new ResponseStatusException(UNAUTHORIZED,
                    "Conta bloqueada temporariamente. Tente novamente em " + authProperties.tempoDuracao() + " minutos.");
        }

        usuario.setTentativasLoginFalha(0);
        usuario.setBloqueadoAte(null);
        usuarioRepository.save(usuario);
    }

    private void registrarFalhaLogin(Usuario usuario) {
        int tentativas = usuario.getTentativasLoginFalha() + 1;
        usuario.setTentativasLoginFalha(tentativas);

        if (tentativas >= authProperties.maxTentativas()) {
            usuario.setBloqueadoAte(OffsetDateTime.now().plusMinutes(authProperties.tempoDuracao()));
            logger.warn("Conta bloqueada após {} tentativas. usuarioId={}", tentativas, usuario.getId());
            auditoriaService.registrar(AcaoAuditoria.LOGIN_FALHA, usuario.getId(), "USUARIO", usuario.getId().toString(),
                    "conta bloqueada por " + authProperties.tempoDuracao() + " min após " + tentativas + " tentativas");
        } else {
            logger.warn("Falha no login ({}/{}). usuarioId={}", tentativas, authProperties.maxTentativas(), usuario.getId());
            auditoriaService.registrar(AcaoAuditoria.LOGIN_FALHA, usuario.getId(), "USUARIO", usuario.getId().toString(),
                    "senha inválida (" + tentativas + "/" + authProperties.maxTentativas() + ")");
        }

        usuarioRepository.save(usuario);
    }

    private void resetarTentativas(Usuario usuario) {
        if (usuario.getTentativasLoginFalha() > 0) {
            usuario.setTentativasLoginFalha(0);
            usuario.setBloqueadoAte(null);
            usuarioRepository.save(usuario);
        }
    }

    public LoginResponse verificarTotp(int totpCode, String preAuthToken) {
        DecodedJWT jwt = preAuthToken != null ? jwtService.validarToken(preAuthToken) : null;
        if (jwt == null) {
            logger.warn("Tentativa de validação de 2FA com token inválido");
            throw new ResponseStatusException(UNAUTHORIZED, "Token de pré-autenticação inválido ou expirado");
        }

        if (!JwtService.SCOPE_PRE_AUTH.equals(jwtService.extrairScope(jwt))) {
            throw new ResponseStatusException(UNAUTHORIZED, "Token inválido para esta operação");
        }

        UUID userId = jwtService.extrairUserId(jwt);

        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Usuário não encontrado"));

        if (!totpService.verificarCodigo(usuario.getSegredoTotp(), totpCode)) {
            logger.warn("Falha na verificação TOTP. usuarioId={}", usuario.getId());
            auditoriaService.registrar(AcaoAuditoria.TOTP_FALHA, usuario.getId(), "USUARIO", usuario.getId().toString(), "código TOTP inválido");
            throw new ResponseStatusException(UNAUTHORIZED, "Código TOTP inválido");
        }

        String token = jwtService.gerarToken(usuario.getId(), usuario.getTipo().name(), usuario.isAdmin());
        logger.info("TOTP verificado com sucesso. usuarioId={}", usuario.getId());
        auditoriaService.registrar(AcaoAuditoria.TOTP_VERIFICADO, usuario.getId(), "USUARIO", usuario.getId().toString(), null);
        auditoriaService.registrar(AcaoAuditoria.LOGIN_SUCESSO, usuario.getId(), "USUARIO", usuario.getId().toString(), "login com 2FA");
        return LoginResponse.authenticated(token, usuario.getNomeCompleto(), usuario.getTipo(), usuario.isAdmin(), usuario.getStatusConta());
    }

    public void ativarTotp(UUID usuarioId, int totpCode) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Autenticação necessária. Faça login."));

        if (usuario.isTotpAtivo()) {
            throw new ResponseStatusException(BAD_REQUEST, "2FA já está ativado");
        }

        if (usuario.getSegredoTotp() == null || usuario.getSegredoTotp().isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Segredo TOTP não configurado. Recadastre-se.");
        }

        if (!totpService.verificarCodigo(usuario.getSegredoTotp(), totpCode)) {
            logger.warn("Falha na ativação TOTP. Código inválido. usuarioId={}", usuarioId);
            auditoriaService.registrar(AcaoAuditoria.TOTP_FALHA, usuarioId, "USUARIO", usuarioId.toString(), "ativação: código inválido");
            throw new ResponseStatusException(BAD_REQUEST, "Código TOTP inválido. Verifique seu app autenticador.");
        }

        usuario.setTotpAtivo(true);
        usuarioRepository.save(usuario);
        logger.info("2FA ativado com sucesso. usuarioId={}", usuarioId);
        auditoriaService.registrar(AcaoAuditoria.TOTP_VERIFICADO, usuarioId, "USUARIO", usuarioId.toString(), "2FA ativado");
    }

    public TotpConfiguracaoResponse obterConfigTotp(UUID usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Autenticação necessária. Faça login."));

        return new TotpConfiguracaoResponse(
                usuario.getSegredoTotp(),
                totpService.gerarQrUri(usuario.getEmail(), usuario.getSegredoTotp())
        );
    }

    public boolean isTotpAtivo(UUID usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Autenticação necessária. Faça login."));
        return usuario.isTotpAtivo();
    }

    public Usuario buscarUsuarioAutenticado() {
        UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Autenticação necessária. Faça login."));
    }
}
