package com.unihub.backend.config;

import org.junit.jupiter.api.Test;
import org.slf4j.Logger;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class FallbackDataSourceTest {
	@Test
	void usesFallbackWhenPrimaryConnectionFails() throws SQLException {
		DataSource primary = mock(DataSource.class);
		DataSource fallback = mock(DataSource.class);
		Connection fallbackConnection = mock(Connection.class);
		when(primary.getConnection()).thenThrow(new SQLException("primary unavailable"));
		when(fallback.getConnection()).thenReturn(fallbackConnection);

		FallbackDataSource dataSource = new FallbackDataSource(primary, fallback, mock(Logger.class));

		assertSame(fallbackConnection, dataSource.getConnection());
		verify(primary).getConnection();
		verify(fallback).getConnection();
	}

	@Test
	void prefersPrimaryWhenAvailable() throws SQLException {
		DataSource primary = mock(DataSource.class);
		DataSource fallback = mock(DataSource.class);
		Connection primaryConnection = mock(Connection.class);
		when(primary.getConnection()).thenReturn(primaryConnection);

		FallbackDataSource dataSource = new FallbackDataSource(primary, fallback, mock(Logger.class));

		assertSame(primaryConnection, dataSource.getConnection());
		verify(fallback, never()).getConnection();
	}

	@Test
	void reportsFallbackFailureAndRetainsPrimaryFailure() throws SQLException {
		DataSource primary = mock(DataSource.class);
		DataSource fallback = mock(DataSource.class);
		SQLException primaryFailure = new SQLException("primary unavailable");
		SQLException fallbackFailure = new SQLException("fallback unavailable");
		when(primary.getConnection()).thenThrow(primaryFailure);
		when(fallback.getConnection()).thenThrow(fallbackFailure);

		FallbackDataSource dataSource = new FallbackDataSource(primary, fallback, mock(Logger.class));

		SQLException thrown = assertThrows(SQLException.class, dataSource::getConnection);
		assertSame(fallbackFailure, thrown);
		assertSame(primaryFailure, thrown.getSuppressed()[0]);
	}
}