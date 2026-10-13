package com.unihub.backend.config;

import org.slf4j.Logger;
import org.springframework.jdbc.datasource.AbstractDataSource;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

public class FallbackDataSource extends AbstractDataSource implements AutoCloseable {
	private final DataSource primary;
	private final DataSource fallback;
	private final Logger logger;

	public FallbackDataSource(DataSource primary, DataSource fallback, Logger logger) {
		this.primary = primary;
		this.fallback = fallback;
		this.logger = logger;
	}

	@Override
	public Connection getConnection() throws SQLException {
		try {
			return primary.getConnection();
		} catch (SQLException primaryFailure) {
			logger.warn("Primary database connection failed; trying fallback database", primaryFailure);
			try {
				return fallback.getConnection();
			} catch (SQLException fallbackFailure) {
				fallbackFailure.addSuppressed(primaryFailure);
				throw fallbackFailure;
			}
		}
	}

	@Override
	public Connection getConnection(String username, String password) throws SQLException {
		try {
			return primary.getConnection(username, password);
		} catch (SQLException primaryFailure) {
			logger.warn("Primary database connection failed; trying fallback database", primaryFailure);
			try {
				return fallback.getConnection(username, password);
			} catch (SQLException fallbackFailure) {
				fallbackFailure.addSuppressed(primaryFailure);
				throw fallbackFailure;
			}
		}
	}

	@Override
	public void close() {
		closeDataSource(primary);
		closeDataSource(fallback);
	}

	private void closeDataSource(DataSource dataSource) {
		if (dataSource instanceof AutoCloseable closeable) {
			try {
				closeable.close();
			} catch (Exception exception) {
				logger.warn("Could not close database connection pool", exception);
			}
		}
	}
}