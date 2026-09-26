package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.config.SessaoUsuario;
import com.grupo.tfc.conectapro.dto.professor.PerfilProfessorRequest;
import com.grupo.tfc.conectapro.dto.professor.PerfilProfessorResponse;
import com.grupo.tfc.conectapro.dto.professor.ProfessorResumoResponse;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import com.grupo.tfc.conectapro.service.ProfessorService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/professores")
public class ProfessorController {

  private final ProfessorService professorService;
  private final UsuarioRepository usuarioRepository;

  public ProfessorController(ProfessorService professorService, UsuarioRepository usuarioRepository) {
    this.professorService = professorService;
    this.usuarioRepository = usuarioRepository;
  }

  @GetMapping
  public ResponseEntity<List<ProfessorResumoResponse>> listar(HttpSession session) {
    UUID usuarioId = SessaoUsuario.buscarUsuarioId(session).orElse(null);
    return ResponseEntity.ok(professorService.listarProfessores(usuarioId));
  }

  @GetMapping("/me")
  public ResponseEntity<PerfilProfessorResponse> meuPerfil(HttpSession session) {
    UUID usuarioId = SessaoUsuario.exigirUsuarioId(session);
    return ResponseEntity.ok(professorService.buscarPerfil(usuarioId));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ProfessorResumoResponse> detalhe(@PathVariable UUID id, HttpSession session) {
    UUID usuarioId = SessaoUsuario.buscarUsuarioId(session).orElse(null);
    return ResponseEntity.ok(professorService.buscarProfessor(id, usuarioId));
  }

  @PutMapping("/me")
  public ResponseEntity<PerfilProfessorResponse> salvarMeuPerfil(@Valid @RequestBody PerfilProfessorRequest request,
                                                                 HttpSession session) {
    UUID usuarioId = SessaoUsuario.exigirUsuarioId(session);

    Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão expirada. Entre novamente."));
    if (usuario.getTipo() != TipoUsuario.PROFESSOR) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas professores podem configurar este perfil");
    }

    return ResponseEntity.ok(professorService.salvarPerfil(usuarioId, request));
  }
}