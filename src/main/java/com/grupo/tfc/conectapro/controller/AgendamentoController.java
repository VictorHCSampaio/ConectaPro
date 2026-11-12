package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.config.UsuarioAutenticado;
import com.grupo.tfc.conectapro.dto.agendamento.AgendamentoResponse;
import com.grupo.tfc.conectapro.dto.agendamento.AgendarRequest;
import com.grupo.tfc.conectapro.dto.agendamento.HorarioDisponivelResponse;
import com.grupo.tfc.conectapro.service.AgendamentoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/agendamentos")
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    public AgendamentoController(AgendamentoService agendamentoService) {
        this.agendamentoService = agendamentoService;
    }

    @PostMapping
    public ResponseEntity<AgendamentoResponse> agendar(@Valid @RequestBody AgendarRequest request) {
        UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
        return ResponseEntity.status(HttpStatus.CREATED).body(agendamentoService.solicitar(usuarioId, request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<AgendamentoResponse>> meusAgendamentos() {
        UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
        return ResponseEntity.ok(agendamentoService.listarDoAluno(usuarioId));
    }

    @GetMapping("/recebidos")
    public ResponseEntity<List<AgendamentoResponse>> agendamentosRecebidos() {
        UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
        return ResponseEntity.ok(agendamentoService.listarDoProfessor(usuarioId));
    }

    @GetMapping("/disponiveis/{professorId}")
    public ResponseEntity<List<HorarioDisponivelResponse>> horariosDisponiveis(@PathVariable UUID professorId) {
        UsuarioAutenticado.exigirUsuarioId();
        return ResponseEntity.ok(agendamentoService.horariosDisponiveis(professorId));
    }

    @PostMapping("/{id}/aprovar")
    public ResponseEntity<AgendamentoResponse> aprovar(@PathVariable UUID id) {
        UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
        return ResponseEntity.ok(agendamentoService.aprovar(usuarioId, id));
    }

    @PostMapping("/{id}/recusar")
    public ResponseEntity<AgendamentoResponse> recusar(@PathVariable UUID id) {
        UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
        return ResponseEntity.ok(agendamentoService.recusar(usuarioId, id));
    }
}
