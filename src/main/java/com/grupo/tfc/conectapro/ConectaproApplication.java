package com.grupo.tfc.conectapro;

import com.grupo.tfc.conectapro.config.EmailProperties;
import com.grupo.tfc.conectapro.config.JwtProperties;
import com.grupo.tfc.conectapro.config.MercadoPagoProperties;
import com.grupo.tfc.conectapro.config.SecurityAuthenticationProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
@EnableConfigurationProperties({SecurityAuthenticationProperties.class, JwtProperties.class, MercadoPagoProperties.class, EmailProperties.class})
public class ConectaproApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConectaproApplication.class, args);
	}

}
