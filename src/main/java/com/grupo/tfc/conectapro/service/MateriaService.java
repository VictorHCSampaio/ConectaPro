package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.model.Materia;
import com.grupo.tfc.conectapro.repository.MateriaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class MateriaService {

    private final MateriaRepository materiaRepository;

    public MateriaService(MateriaRepository materiaRepository) {
        this.materiaRepository = materiaRepository;
    }

    public List<Materia> getAllMateriaService(){
        return materiaRepository.findAll();
    }

    public Materia getMateriaId(Integer id){
        return materiaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Matéria não encontrada"));
    }

    public Materia insertMateriaService(Materia materia){
        materia.setAtiva(true);
        return materiaRepository.save(materia);
    }
}
