package com.grupo.tfc.conectapro.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class SenhaService {

    private final PasswordEncoder passwordEncoder;

    public SenhaService(PasswordEncoder passwordEncoder){
        this.passwordEncoder = passwordEncoder;
    }

    public String senhaHash(String rawPassword){
        return passwordEncoder.encode(rawPassword);
    }

    public boolean match(String rawPassword, String senhaHash){
        return passwordEncoder.matches(rawPassword, senhaHash);
    }
}
