package com.grupo.tfc.conectapro.service;

import com.grupo.tfc.conectapro.config.EmailProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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

    private String mascararEmail(String email) {
        int at = email.indexOf('@');
        if (at <= 2) {
            return "***" + email.substring(at);
        }
        return email.substring(0, 2) + "***" + email.substring(at);
    }
}