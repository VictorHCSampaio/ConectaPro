package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.dto.MateriaDTO;
import com.grupo.tfc.conectapro.model.AcaoAuditoria;
import com.grupo.tfc.conectapro.model.Materia;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.repository.MateriaRepository;
import com.grupo.tfc.conectapro.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class MateriaService {

    private final MateriaRepository materiaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;

    public MateriaService(MateriaRepository materiaRepository, UsuarioRepository usuarioRepository, AuditoriaService auditoriaService) {
        this.materiaRepository = materiaRepository;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
    }

    public List<MateriaDTO> getAllMateriaService(){
        return materiaRepository.findAll().stream()
                .map(this::paraDTO)
                .toList();
    }

    public MateriaDTO getMateriaId(Integer id){
        return paraDTO(buscarMateria(id));
    }

    public MateriaDTO insertMateriaService(MateriaDTO dto, UUID usuarioId){
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão expirada. Entre novamente."));
        if (!usuario.isAdmin()) {
            auditoriaService.registrar(AcaoAuditoria.ACESSO_NEGADO, usuarioId, "MATERIA", null, "cadastro de matéria sem permissão de administrador");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas administradores podem cadastrar matérias");
        }

        Materia materia = new Materia();
        materia.setNome(dto.nome());
        materia.setDescricao(dto.descricao());
        materia.setAtiva(true);
        materia.setCriadoEm(OffsetDateTime.now());

        Materia salva = materiaRepository.save(materia);
        auditoriaService.registrar(AcaoAuditoria.MATERIA_CRIADA, usuarioId, "MATERIA", String.valueOf(salva.getId()), "nome=" + salva.getNome());
        return paraDTO(salva);
    }

    private Materia buscarMateria(Integer id) {
        return materiaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Matéria não encontrada"));
    }

    private MateriaDTO paraDTO(Materia materia) {
        return new MateriaDTO(materia.getId(), materia.getNome(), materia.getDescricao(), materia.getArea());
    }
}
