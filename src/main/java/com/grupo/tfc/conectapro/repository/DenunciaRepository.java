package com.grupo.tfc.conectapro.repository;

import com.grupo.tfc.conectapro.model.Denuncia;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface DenunciaRepository extends JpaRepository<Denuncia, UUID> {

    @Query("""
            select d from Denuncia d
            join fetch d.denunciante
            join fetch d.denunciado
            order by d.dataCriacao desc
            """)
    List<Denuncia> findAllByOrderByDataCriacaoDesc();

    List<Denuncia> findByDenuncianteIdOrDenunciadoId(UUID denuncianteId, UUID denunciadoId);

    @Query("""
            select d from Denuncia d
            join fetch d.denunciante
            join fetch d.denunciado
            where d.denunciado.tipo = :tipo
            order by d.dataCriacao desc
            """)
    List<Denuncia> findByDenunciado_TipoOrderByDataCriacaoDesc(@Param("tipo") TipoUsuario tipo);
}
