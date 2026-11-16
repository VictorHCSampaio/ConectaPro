package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.dto.denuncia.DenunciaResponse;
import com.grupo.tfc.conectapro.dto.denuncia.RegistrarDenunciaRequest;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.service.DenunciaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/denuncias")
public class DenunciaController {

    private final DenunciaService denunciaService;

    public DenunciaController(DenunciaService denunciaService) {
        this.denunciaService = denunciaService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DenunciaResponse>> listar() {
        return ResponseEntity.ok(denunciaService.listar());
    }

    @GetMapping("/alunos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DenunciaResponse>> listarAlunos() {
        return ResponseEntity.ok(denunciaService.listarPorPapel(TipoUsuario.ALUNO));
    }

    @GetMapping("/professores")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DenunciaResponse>> listarProfessores() {
        return ResponseEntity.ok(denunciaService.listarPorPapel(TipoUsuario.PROFESSOR));
    }

    @PostMapping
    public ResponseEntity<DenunciaResponse> registrar(@Valid @RequestBody RegistrarDenunciaRequest request) {
        // denunciante sai do token, o body so aponta o professor
        return ResponseEntity.status(HttpStatus.CREATED).body(denunciaService.registrar(request));
    }
}
