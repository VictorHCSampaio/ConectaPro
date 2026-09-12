package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.dto.auth.LoginRequest;
import com.grupo.tfc.conectapro.dto.auth.MensagemAutenticacaoResponse;
import com.grupo.tfc.conectapro.dto.auth.RegisterRequest;
import com.grupo.tfc.conectapro.dto.auth.TotpSetupResponse;
import com.grupo.tfc.conectapro.dto.auth.UsuarioAutenticadoResponse;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.service.AuthenticationService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class UsuarioController {

    private final AuthenticationService authService;

    @Autowired
    public UsuarioController(AuthenticationService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<TotpSetupResponse> cadastro(@Valid @RequestBody RegisterRequest request){
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<MensagemAutenticacaoResponse> login(@Valid @RequestBody LoginRequest request, HttpSession session){
        Usuario usuario = authService.login(request.email(), request.senha(), session);
        return ResponseEntity.ok(new MensagemAutenticacaoResponse(
                "Senha validada",
                new UsuarioAutenticadoResponse(
                        usuario.getId(),
                        usuario.getNomeCompleto(),
                        usuario.getEmail(),
                        usuario.getTipo().name()
                )
        ));
    }
}
