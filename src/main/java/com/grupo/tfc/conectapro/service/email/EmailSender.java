package com.grupo.tfc.conectapro.service.email;

public interface EmailSender {

    void enviar(String destinatario, String assunto, String corpo, boolean html);
}
