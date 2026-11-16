package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.config.UsuarioAutenticado;
import com.grupo.tfc.conectapro.dto.usuario.ExportacaoDadosDTO;
import com.grupo.tfc.conectapro.dto.usuario.PerfilAlunoRequest;
import com.grupo.tfc.conectapro.dto.usuario.PerfilAlunoResponse;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.service.AuditoriaService;
import com.grupo.tfc.conectapro.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
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
    private final AuditoriaService auditoriaService;

    public PerfilController(UsuarioService usuarioService, AuditoriaService auditoriaService) {
        this.usuarioService = usuarioService;
        this.auditoriaService = auditoriaService;
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

    @GetMapping("/me/dados")
    public ResponseEntity<ExportacaoDadosDTO> exportarMeusDados() {
        var userId = UsuarioAutenticado.exigirUsuarioId();
        auditoriaService.registrar(AcaoAuditoria.DADOS_EXPORTADOS, userId, "Usuario", userId.toString(), "Exportação LGPD solicitada pelo titular");
        return ResponseEntity.ok(usuarioService.exportarMeusDados());
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> excluirMinhaConta() {
        var userId = UsuarioAutenticado.exigirUsuarioId();
        auditoriaService.registrar(AcaoAuditoria.CONTA_EXCLUIDA, userId, "Usuario", userId.toString(), "Exclusão de conta solicitada pelo titular (LGPD)");
        usuarioService.excluirMinhaConta();
        return ResponseEntity.noContent().build();
    }
}
