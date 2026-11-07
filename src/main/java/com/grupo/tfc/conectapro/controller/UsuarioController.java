package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.config.UsuarioAutenticado;
import com.grupo.tfc.conectapro.dto.auth.LoginRequest;
import com.grupo.tfc.conectapro.dto.auth.LoginResponse;
import com.grupo.tfc.conectapro.dto.auth.MensagemAutenticacaoResponse;
import com.grupo.tfc.conectapro.dto.auth.RegisterRequest;
import com.grupo.tfc.conectapro.dto.auth.TotpAtivacaoRequest;
import com.grupo.tfc.conectapro.dto.auth.TotpConfiguracaoResponse;
import com.grupo.tfc.conectapro.dto.auth.TotpVerificacaoRequest;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.service.AuthenticationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class UsuarioController {

    private final AuthenticationService authService;

    public UsuarioController(AuthenticationService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<TotpConfiguracaoResponse> cadastro(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request.email(), request.senha());

        if ("TOTP_REQUIRED".equals(response.status())) {
            return ResponseEntity.accepted().body(response);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/2fa/verify")
    public ResponseEntity<LoginResponse> verificarTotp(@Valid @RequestBody TotpVerificacaoRequest request,
                                                       @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String preAuthToken = extrairBearerToken(authHeader);
        return ResponseEntity.ok(authService.verificarTotp(request.code(), preAuthToken));
    }

    @PostMapping("/2fa/setup")
    public ResponseEntity<TotpConfiguracaoResponse> obterConfigTotp() {
        UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
        return ResponseEntity.ok(authService.obterConfigTotp(usuarioId));
    }

    @PostMapping("/2fa/activate")
    public ResponseEntity<Map<String, String>> ativarTotp(@Valid @RequestBody TotpAtivacaoRequest request) {
        UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
        authService.ativarTotp(usuarioId, request.totpCode());
        return ResponseEntity.ok(Map.of("message", "2FA ativado com sucesso"));
    }

    @GetMapping("/2fa/status")
    public ResponseEntity<Map<String, Boolean>> statusTotp() {
        UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
        boolean ativo = authService.isTotpAtivo(usuarioId);
        return ResponseEntity.ok(Map.of("totpAtivo", ativo));
    }

    @GetMapping("/me")
    public ResponseEntity<MensagemAutenticacaoResponse> me() {
        Usuario usuario = authService.buscarUsuarioAutenticado();
        return ResponseEntity.ok(new MensagemAutenticacaoResponse(
                "Autenticado",
                usuario.getNomeCompleto(),
                usuario.getTipo(),
                usuario.isAdmin()
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }

    private String extrairBearerToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
