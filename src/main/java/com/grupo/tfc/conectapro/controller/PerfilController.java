package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.config.UsuarioAutenticado;
import com.grupo.tfc.conectapro.dto.usuario.PerfilAlunoRequest;
import com.grupo.tfc.conectapro.dto.usuario.PerfilAlunoResponse;
import com.grupo.tfc.conectapro.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/usuarios")
public class PerfilController {

    private final UsuarioService usuarioService;

    public PerfilController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/{id}/perfil")
    public ResponseEntity<PerfilAlunoResponse> perfilPublico(@PathVariable UUID id) {
        UsuarioAutenticado.exigirUsuarioId();
        return ResponseEntity.ok(usuarioService.buscarPerfilPublico(id));
    }

    @GetMapping("/me/perfil")
    public ResponseEntity<PerfilAlunoResponse> meuPerfil() {
        return ResponseEntity.ok(usuarioService.buscarMeuPerfil());
    }

    @PutMapping("/me/perfil")
    public ResponseEntity<PerfilAlunoResponse> atualizarPerfil(@Valid @RequestBody PerfilAlunoRequest request) {
        return ResponseEntity.ok(usuarioService.atualizarMeuPerfil(request));
    }
}
