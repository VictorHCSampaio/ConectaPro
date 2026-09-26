package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.config.SessaoUsuario;
import com.grupo.tfc.conectapro.dto.auditoria.AuditoriaLogResponse;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.service.AuditoriaService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/auditoria")
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    public AuditoriaController(AuditoriaService auditoriaService) {
        this.auditoriaService = auditoriaService;
    }

    @GetMapping
    public ResponseEntity<List<AuditoriaLogResponse>> listar(@RequestParam(required = false) UUID usuarioId,
                                                             @RequestParam(required = false) AcaoAuditoria acao,
                                                             @RequestParam(defaultValue = "0") int pagina,
                                                             @RequestParam(defaultValue = "50") int tamanho,
                                                             HttpSession session) {
        UUID usuarioSessaoId = SessaoUsuario.exigirUsuarioId(session);
        return ResponseEntity.ok(auditoriaService.listar(usuarioSessaoId, usuarioId, acao, pagina, tamanho));
    }
}
