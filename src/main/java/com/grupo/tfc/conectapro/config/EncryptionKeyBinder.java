package com.grupo.tfc.conectapro.config;

import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

/**
 * Copia {@code app.encryption.key} para a system property {@code ENCRYPTION_KEY}
 * antes dos beans JPA, porque {@link TotpSegredoConverter} não é um bean Spring.
 */
@Configuration
public class EncryptionKeyBinder implements BeanFactoryPostProcessor, EnvironmentAware {

    private Environment environment;

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
        String key = environment.getProperty("app.encryption.key");
        if (key != null && !key.isBlank()) {
            System.setProperty("ENCRYPTION_KEY", key);
        }
    }
}
