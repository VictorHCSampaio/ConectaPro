package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.config.EmailProperties;
import com.grupo.tfc.conectapro.model.Denuncia;
import com.grupo.tfc.conectapro.model.MotivoDenuncia;
import com.grupo.tfc.conectapro.model.TipoUsuario;
import com.grupo.tfc.conectapro.model.Usuario;
import com.grupo.tfc.conectapro.service.email.EmailSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final EmailSender emailSender;
    private final EmailProperties emailProperties;

    public EmailService(EmailSender emailSender, EmailProperties emailProperties) {
        this.emailSender = emailSender;
        this.emailProperties = emailProperties;
    }

    @Async
    public void enviarEmailResetSenha(String destinatario, String nomeUsuario, String linkReset) {
        String corpo = """
                Olá %s,

                Você solicitou a recuperação de senha da sua conta no ConectaPro.

                Para redefinir sua senha, acesse o link abaixo:

                %s

                Este link é válido por %d minutos.

                Se você não solicitou esta recuperação, ignore este e-mail.

                Atenciosamente,
                Equipe ConectaPro""".formatted(
                nomeUsuario,
                linkReset,
                emailProperties.reset().expiracaoMinutos()
        );

        try {
            emailSender.enviar(destinatario, emailProperties.reset().subject(), corpo, false);
            logger.info("Email de reset de senha enviado. destinatario={}", mascararEmail(destinatario));
        } catch (Exception e) {
            logger.error("Falha ao enviar email de reset de senha. destinatario={}", mascararEmail(destinatario), e);
        }
    }

    @Async
    public void enviarAlertaDenuncia(Denuncia denuncia, String adminEmail) {
        if (adminEmail == null || adminEmail.isBlank()) {
            logger.warn("Alerta de denuncia nao enviado: endereco do admin vazio. denunciaId={}", denuncia.getId());
            return;
        }

        try {
            emailSender.enviar(adminEmail, "Nova denúncia registrada " + denuncia.getId(),
                    corpoAlertaDenuncia(denuncia), true);
            logger.info("Alerta de denuncia enviado. denunciaId={} destinatario={}",
                    denuncia.getId(), mascararEmail(adminEmail));
        } catch (RuntimeException e) {
            logger.error("Falha ao enviar alerta de denuncia. denunciaId={} destinatario={}",
                    denuncia.getId(), mascararEmail(adminEmail), e);
        }
    }

    @Async
    public void enviarRecomendacaoBoletim(String destinatario, String nomeDestinatario, String texto) {
        if (destinatario == null || destinatario.isBlank() || texto == null || texto.isBlank()) {
            logger.warn("Recomendacao de boletim nao enviada: destinatario ou texto vazio");
            return;
        }

        String corpo = """
                Olá %s,

                %s

                Atenciosamente,
                Equipe ConectaPro""".formatted(nomeDestinatario == null ? "" : nomeDestinatario, texto);

        try {
            emailSender.enviar(destinatario, "Recomendação de boletim de ocorrência - ConectaPro", corpo, false);
            logger.info("Recomendacao de boletim enviada. destinatario={}", mascararEmail(destinatario));
        } catch (RuntimeException e) {
            logger.error("Falha ao enviar recomendacao de boletim. destinatario={}", mascararEmail(destinatario), e);
        }
    }

    private String corpoAlertaDenuncia(Denuncia denuncia) {
        Usuario autor = denuncia.getDenunciante();
        Usuario alvo = denuncia.getDenunciado();

        return """
                <p>Uma nova denúncia foi registrada no ConectaPro.</p>
                <ul>
                  <li><strong>ID da denúncia:</strong> %s</li>
                  <li><strong>Autor:</strong> %s (%s)</li>
                  <li><strong>Usuário denunciado:</strong> %s (%s)</li>
                  <li><strong>Perfil denunciado:</strong> %s</li>
                  <li><strong>Motivo:</strong> %s</li>
                </ul>
                <p><strong>Descrição:</strong></p>
                <p>%s</p>
                """.formatted(
                escaparHtml(denuncia.getId() == null ? null : denuncia.getId().toString()),
                escaparHtml(autor == null ? null : autor.getNomeCompleto()),
                escaparHtml(autor == null ? null : autor.getEmail()),
                escaparHtml(alvo == null ? null : alvo.getNomeCompleto()),
                escaparHtml(alvo == null ? null : alvo.getEmail()),
                escaparHtml(rotuloPerfil(alvo)),
                escaparHtml(rotuloMotivo(denuncia.getMotivo())),
                escaparHtml(denuncia.getDescricao()).replace("\n", "<br>")
        );
    }

    private String rotuloPerfil(Usuario usuario) {
        if (usuario == null) {
            return null;
        }
        if (usuario.administrador() || usuario.getTipo() == TipoUsuario.ADMIN) {
            return "Administrador";
        }
        if (usuario.getTipo() == null) {
            return null;
        }
        if (usuario.getTipo() == TipoUsuario.ALUNO) {
            return "Aluno";
        }
        return "Professor";
    }

    private String rotuloMotivo(MotivoDenuncia motivo) {
        if (motivo == null) {
            return null;
        }
        return switch (motivo) {
            case ASSEDIO -> "Assédio";
            case FRAUDE -> "Fraude";
            case CONTEUDO_INADEQUADO -> "Conteúdo inadequado";
            case OUTROS -> "Outros";
        };
    }

    private String escaparHtml(String valor) {
        if (valor == null || valor.isBlank()) {
            return "Não informado";
        }
        return valor
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }

    private String mascararEmail(String email) {
        return com.grupo.tfc.conectapro.util.MascaraEmail.mascarar(email);
    }
}