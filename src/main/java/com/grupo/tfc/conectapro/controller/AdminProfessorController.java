package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.dto.professor.CertificadoUrlResponse;
import com.grupo.tfc.conectapro.dto.professor.ProfessorPendenteResponse;
import com.grupo.tfc.conectapro.dto.professor.RejeicaoRequest;
import com.grupo.tfc.conectapro.service.AdminProfessorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/professores")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProfessorController {

    private final AdminProfessorService adminProfessorService;

    public AdminProfessorController(AdminProfessorService adminProfessorService) {
        this.adminProfessorService = adminProfessorService;
    }

    @GetMapping("/pendentes")
    public ResponseEntity<List<ProfessorPendenteResponse>> listarPendentes() {
        return ResponseEntity.ok(adminProfessorService.listarPendentes());
    }

    @GetMapping("/{usuarioId}/certificado")
    public ResponseEntity<CertificadoUrlResponse> certificado(@PathVariable UUID usuarioId) {
        return ResponseEntity.ok(adminProfessorService.gerarUrlCertificado(usuarioId));
    }

    @PostMapping("/{usuarioId}/aprovar")
    public ResponseEntity<Void> aprovar(@PathVariable UUID usuarioId) {
        adminProfessorService.aprovar(usuarioId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{usuarioId}/rejeitar")
    public ResponseEntity<Void> rejeitar(@PathVariable UUID usuarioId, @Valid @RequestBody RejeicaoRequest request) {
        adminProfessorService.rejeitar(usuarioId, request.motivo());
        return ResponseEntity.noContent().build();
    }
}
