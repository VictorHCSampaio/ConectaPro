package com.grupo.tfc.conectapro.controller;

import com.grupo.tfc.conectapro.config.SessaoUsuario;
import com.grupo.tfc.conectapro.model.Materia;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import com.grupo.tfc.conectapro.service.MateriaService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/materia")
public class MateriaController {

    private final MateriaService materiaService;
    private final UsuarioRepository usuarioRepository;

    public MateriaController(MateriaService materiaService, UsuarioRepository usuarioRepository) {
        this.materiaService = materiaService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public ResponseEntity<List<Materia>> getAllMaterias(){
        List<Materia> materia = materiaService.getAllMateriaService();
        return ResponseEntity.ok(materia);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Materia> getMateriaId(@PathVariable Integer id){
        return ResponseEntity.ok(materiaService.getMateriaId(id));
    }

    @PostMapping
    public ResponseEntity<String> addMateria(@RequestBody Materia materia, HttpSession session){
        UUID usuarioId = SessaoUsuario.exigirUsuarioId(session);
        boolean isAdmin = usuarioRepository.findById(usuarioId)
                .map(Usuario::isAdmin)
                .orElse(false);
        if (!isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas administradores podem cadastrar matérias");
        }

        try {
            materiaService.insertMateriaService(materia);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body("Matéria cadastrada com sucesso!");
        }catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Erro ao cadastrar matéria!");
        }
    }
}
