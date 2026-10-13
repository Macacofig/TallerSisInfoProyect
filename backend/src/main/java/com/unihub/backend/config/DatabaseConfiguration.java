package com.unihub.backend.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfiguration {
	private static final Logger logger = LoggerFactory.getLogger(DatabaseConfiguration.class);

	@Bean(destroyMethod = "close")
	@Primary
	public FallbackDataSource dataSource(Environment environment) {
		HikariDataSource primary = createPool(
				"aiven-pool",
				environment.getRequiredProperty("SPRING_DATASOURCE_URL"),
				environment.getRequiredProperty("POSTGRES_USER"),
				environment.getRequiredProperty("POSTGRES_PASSWORD"));
		HikariDataSource fallback = createPool(
				"supabase-pool",
				environment.getRequiredProperty("SUPABASE_DATASOURCE_URL"),
				environment.getRequiredProperty("SUPABASE_USER"),
				environment.getProperty("SUPABASE_PASSWORD", ""));

		return new FallbackDataSource(primary, fallback, logger);
	}

	private HikariDataSource createPool(String name, String url, String username, String password) {
		HikariConfig config = new HikariConfig();
		config.setPoolName(name);
		config.setJdbcUrl(url);
		config.setUsername(username);
		config.setPassword(password);
		config.setMaximumPoolSize(4);
		config.setMinimumIdle(0);
		config.setConnectionTimeout(5000);
		config.setInitializationFailTimeout(-1);
		return new HikariDataSource(config);
	}
}