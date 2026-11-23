package com.grupo.tfc.conectapro.util;

public final class MascaraEmail {

    private MascaraEmail() {
    }

    public static String mascarar(String email) {
        if (email == null || email.isBlank()) {
            return "***";
        }
        int at = email.indexOf('@');
        if (at < 0) {
            return "***";
        }
        if (at <= 2) {
            return "***" + email.substring(at);
        }
        return email.substring(0, 2) + "***" + email.substring(at);
    }
}
