package com.grupo.tfc.conectapro.repository;

import com.grupo.tfc.conectapro.model.Mensagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MensagemRepository extends JpaRepository<Mensagem, UUID> {

    // os dois lados exigem o user logado. conversa de terceiro nao entra
    @Query("""
            select m from Mensagem m
            where (m.remetente.id = :idUsuarioLogado and m.destinatario.id = :idOutroUsuario)
               or (m.remetente.id = :idOutroUsuario and m.destinatario.id = :idUsuarioLogado)
            order by m.dataEnvio asc
            """)
    List<Mensagem> buscarConversaDoUsuario(@Param("idUsuarioLogado") UUID idUsuarioLogado,
                                           @Param("idOutroUsuario") UUID idOutroUsuario);
}
