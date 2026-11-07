package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.config.UsuarioAutenticado;
import com.grupo.tfc.conectapro.dto.MateriaDTO;
import com.grupo.tfc.conectapro.service.MateriaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/materias")
public class MateriaController {

    private final MateriaService materiaService;

    public MateriaController(MateriaService materiaService) {
        this.materiaService = materiaService;
    }

    @GetMapping
    public ResponseEntity<List<MateriaDTO>> getAllMaterias() {
        return ResponseEntity.ok(materiaService.getAllMateriaService());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MateriaDTO> getMateriaId(@PathVariable Integer id) {
        return ResponseEntity.ok(materiaService.getMateriaId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MateriaDTO> addMateria(@RequestBody MateriaDTO materia) {
        UUID usuarioId = UsuarioAutenticado.exigirUsuarioId();
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(materiaService.insertMateriaService(materia, usuarioId));
    }
}
