package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.config.EmailProperties;
import com.grupo.tfc.conectapro.model.Denuncia;
import com.grupo.tfc.conectapro.model.MotivoDenuncia;
import com.grupo.tfc.conectapro.model.Professor;
import com.grupo.tfc.conectapro.model.Usuario;
import jakarta.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final EmailProperties emailProperties;

    public EmailService(JavaMailSender mailSender, EmailProperties emailProperties) {
        this.mailSender = mailSender;
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

        SimpleMailMessage mensagem = new SimpleMailMessage();
        mensagem.setFrom(emailProperties.from());
        mensagem.setTo(destinatario);
        mensagem.setSubject(emailProperties.reset().subject());
        mensagem.setText(corpo);

        try {
            mailSender.send(mensagem);
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
            var mensagem = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(mensagem, false, "UTF-8");
            helper.setFrom(emailProperties.from());
            helper.setTo(adminEmail);
            helper.setSubject("Nova denúncia registrada — " + denuncia.getId());
            helper.setText(corpoAlertaDenuncia(denuncia), true);
            mailSender.send(mensagem);
            logger.info("Alerta de denuncia enviado. denunciaId={} destinatario={}",
                    denuncia.getId(), mascararEmail(adminEmail));
        } catch (MessagingException | RuntimeException e) {
            logger.error("Falha ao enviar alerta de denuncia. denunciaId={} destinatario={}",
                    denuncia.getId(), mascararEmail(adminEmail), e);
        }
    }

    private String corpoAlertaDenuncia(Denuncia denuncia) {
        Usuario autor = denuncia.getDenunciante();
        Professor alvo = denuncia.getDenunciado();
        Usuario usuarioAlvo = alvo == null ? null : alvo.getUsuario();

        return """
                <p>Uma nova denúncia foi registrada no ConectaPro.</p>
                <ul>
                  <li><strong>ID da denúncia:</strong> %s</li>
                  <li><strong>Autor:</strong> %s (%s)</li>
                  <li><strong>Professor denunciado:</strong> %s (%s)</li>
                  <li><strong>Motivo:</strong> %s</li>
                </ul>
                <p><strong>Descrição:</strong></p>
                <p>%s</p>
                """.formatted(
                escaparHtml(denuncia.getId() == null ? null : denuncia.getId().toString()),
                escaparHtml(autor == null ? null : autor.getNomeCompleto()),
                escaparHtml(autor == null ? null : autor.getEmail()),
                escaparHtml(usuarioAlvo == null ? null : usuarioAlvo.getNomeCompleto()),
                escaparHtml(usuarioAlvo == null ? null : usuarioAlvo.getEmail()),
                escaparHtml(rotuloMotivo(denuncia.getMotivo())),
                escaparHtml(denuncia.getDescricao()).replace("\n", "<br>")
        );
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
        int at = email.indexOf('@');
        if (at <= 2) {
            return "***" + email.substring(at);
        }
        return email.substring(0, 2) + "***" + email.substring(at);
    }
}