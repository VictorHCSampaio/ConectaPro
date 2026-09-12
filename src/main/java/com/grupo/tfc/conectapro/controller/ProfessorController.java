package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.config.SessaoUsuario;
import com.grupo.tfc.conectapro.dto.professor.PerfilProfessorRequest;
import com.grupo.tfc.conectapro.dto.professor.PerfilProfessorResponse;
import com.grupo.tfc.conectapro.dto.professor.ProfessorResumoResponse;
import com.grupo.tfc.conectapro.service.ProfessorService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/professores")
public class ProfessorController {

    private final ProfessorService professorService;

    public ProfessorController(ProfessorService professorService) {
        this.professorService = professorService;
    }

    /** Diretorio publico: so professores que ja configuraram o perfil. */
    @GetMapping
    public ResponseEntity<List<ProfessorResumoResponse>> listar() {
        return ResponseEntity.ok(professorService.listarProfessores());
    }

    @GetMapping("/me")
    public ResponseEntity<PerfilProfessorResponse> meuPerfil(HttpSession session) {
        UUID usuarioId = SessaoUsuario.exigirUsuarioId(session);
        return ResponseEntity.ok(professorService.buscarPerfil(usuarioId));
    }

    @PutMapping("/me")
    public ResponseEntity<PerfilProfessorResponse> salvarMeuPerfil(@Valid @RequestBody PerfilProfessorRequest request,
                                                                   HttpSession session) {
        UUID usuarioId = SessaoUsuario.exigirUsuarioId(session);
        return ResponseEntity.ok(professorService.salvarPerfil(usuarioId, request));
    }
}
