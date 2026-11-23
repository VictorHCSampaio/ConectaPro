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
                <div style="margin:0;padding:24px;background-color:#f1efe9;font-family:Arial,Helvetica,sans-serif;">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;">
                    <tr><td style="padding:0 0 16px;text-align:center;">
                      <span style="font-size:20px;font-weight:bold;color:#16233b;letter-spacing:0.5px;">ConectaPro</span>
                    </td></tr>
                    <tr><td style="background-color:#ffffff;border:1px solid #e3ded3;border-radius:12px;padding:32px;">
                      <h1 style="margin:0 0 16px;font-size:20px;color:#16233b;">Redefinição de senha</h1>
                      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4a4a4a;">Olá %s,</p>
                      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4a4a4a;">
                        Você solicitou a recuperacao de senha da sua conta no ConectaPro. Clique no botão abaixo para criar uma nova senha.
                      </p>
                      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                        <tr><td style="border-radius:8px;background-color:#16233b;">
                          <a href="%s" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;">Redefinir senha</a>
                        </td></tr>
                      </table>
                      <p style="margin:0 0 8px;font-size:13px;color:#8a8a8a;">Se o botão não funcionar, copie e cole este link no navegador:</p>
                      <p style="margin:0 0 24px;font-size:12px;line-height:1.5;color:#16233b;word-break:break-all;">%s</p>
                      <p style="margin:0 0 4px;font-size:13px;color:#8a8a8a;">Este link é válido por %d minutos.</p>
                      <p style="margin:0;font-size:13px;color:#8a8a8a;">Se você não solicitou esta recuperação, pode ignorar este e-mail com segurança.</p>
                    </td></tr>
                    <tr><td style="padding:16px 0 0;text-align:center;font-size:12px;color:#a0a0a0;">
                      Equipe ConectaPro
                    </td></tr>
                  </table>
                </div>""".formatted(
                escaparHtml(nomeUsuario),
                linkReset,
                linkReset,
                emailProperties.reset().expiracaoMinutos()
        );

        try {
            emailSender.enviar(destinatario, emailProperties.reset().subject(), corpo, true);
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