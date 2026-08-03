package com.sacco.config;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String PROPERTY_SOURCE_NAME = "databaseUrlProperties";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String databaseUrl = environment.getProperty("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank()) {
            return;
        }

        String url = databaseUrl;
        String username = null;
        String password = null;

        if (url.startsWith("postgres://")) {
            URI uri = URI.create(url);
            if (uri.getUserInfo() != null) {
                String[] parts = uri.getUserInfo().split(":", 2);
                username = parts[0];
                if (parts.length > 1) {
                    password = parts[1];
                }
            }
            url = "jdbc:postgresql://" + uri.getHost() + ":" + uri.getPort() + uri.getPath();
        }

        if (url.contains("?")) {
            url = url + "&sslmode=require";
        } else {
            url = url + "?sslmode=require";
        }

        Map<String, Object> props = new HashMap<>();
        props.put("spring.datasource.url", url);
        if (username != null) {
            props.put("spring.datasource.username", username);
        }
        if (password != null) {
            props.put("spring.datasource.password", password);
        }
        environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE_NAME, props));
    }
}
