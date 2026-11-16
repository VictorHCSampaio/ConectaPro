package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.config.UsuarioAutenticado;
import com.grupo.tfc.conectapro.dto.professor.AvatarResponse;
import com.grupo.tfc.conectapro.dto.professor.CertificadoVisualizacaoResponse;
import com.grupo.tfc.conectapro.dto.professor.JustificativaRequest;
import com.grupo.tfc.conectapro.dto.professor.PerfilProfessorRequest;
import com.grupo.tfc.conectapro.dto.professor.PerfilProfessorResponse;
import com.grupo.tfc.conectapro.dto.professor.ProfessorResumoResponse;
import com.grupo.tfc.conectapro.dto.professor.StatusCadastroResponse;
import com.grupo.tfc.conectapro.service.ProfessorService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/professores")
public class ProfessorController {

  private final ProfessorService professorService;

  public ProfessorController(ProfessorService professorService) {
    this.professorService = professorService;
  }

  @GetMapping
  public ResponseEntity<List<ProfessorResumoResponse>> listar() {
    UUID usuarioId = UsuarioAutenticado.buscarUsuarioId().orElse(null);
    return ResponseEntity.ok(professorService.listarProfessores(usuarioId));
  }

  @GetMapping("/me")
  public ResponseEntity<PerfilProfessorResponse> meuPerfil() {
    UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
    return ResponseEntity.ok(professorService.buscarPerfil(usuarioId));
  }

  @GetMapping("/{id}/certificado")
  public ResponseEntity<CertificadoVisualizacaoResponse> certificadoPublico(@PathVariable UUID id) {
    return ResponseEntity.ok(professorService.visualizarCertificado(id));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ProfessorResumoResponse> detalhe(@PathVariable UUID id) {
    UUID usuarioId = UsuarioAutenticado.buscarUsuarioId().orElse(null);
    return ResponseEntity.ok(professorService.buscarProfessor(id, usuarioId));
  }

  @PutMapping("/me")
  public ResponseEntity<PerfilProfessorResponse> salvarMeuPerfil(@Valid @RequestBody PerfilProfessorRequest request) {
    UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
    return ResponseEntity.ok(professorService.salvarPerfil(usuarioId, request));
  }

  @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<AvatarResponse> enviarAvatar(@RequestParam("file") MultipartFile file) {
    UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
    return ResponseEntity.ok(professorService.enviarAvatar(usuarioId, file));
  }

  @DeleteMapping("/me/avatar")
  public ResponseEntity<Void> removerAvatar() {
    UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
    professorService.removerAvatar(usuarioId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/me/status")
  public ResponseEntity<StatusCadastroResponse> statusCadastro() {
    UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
    return ResponseEntity.ok(professorService.statusCadastro(usuarioId));
  }

  @PostMapping(value = "/me/certificado", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<Void> enviarCertificado(@RequestParam("file") MultipartFile file) {
    UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
    professorService.enviarCertificado(usuarioId, file);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/me/justificativa")
  public ResponseEntity<Void> enviarJustificativa(@Valid @RequestBody JustificativaRequest request) {
    UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
    professorService.enviarJustificativa(usuarioId, request.justificativa());
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/me/reenviar-analise")
  public ResponseEntity<Void> reenviarParaAnalise() {
    UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
    professorService.reenviarParaAnalise(usuarioId);
    return ResponseEntity.noContent().build();
  }
}
