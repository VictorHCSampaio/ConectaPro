package com.grupo.tfc.conectapro;

import com.grupo.tfc.conectapro.config.SecurityAuthenticationProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(SecurityAuthenticationProperties.class)
public class ConectaproApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConectaproApplication.class, args);
	}

}
