package com.unihub.backend.common;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.encoder.PatternLayoutEncoder;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.ConsoleAppender;
import ch.qos.logback.core.rolling.RollingFileAppender;
import ch.qos.logback.core.read.ListAppender;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LogHelperTest {

    @Test
    void registraNivelesYConservaLaExcepcion() throws IOException {
        Logger logger = (Logger) LoggerFactory.getLogger(LogHelperTest.class);
        Logger rootLogger = (Logger) LoggerFactory.getLogger(Logger.ROOT_LOGGER_NAME);
        Level previousLevel = logger.getLevel();
        ConsoleAppender<ILoggingEvent> consoleAppender =
            (ConsoleAppender<ILoggingEvent>) rootLogger.getAppender("CONSOLE");
        RollingFileAppender<ILoggingEvent> fileAppender =
            (RollingFileAppender<ILoggingEvent>) rootLogger.getAppender("FILE");
        ListAppender<ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        logger.setLevel(Level.DEBUG);
        logger.addAppender(appender);
        IllegalStateException exception = new IllegalStateException("detalle de prueba");

        try {
            LogHelper.info(LogHelperTest.class, "evento informativo");
            LogHelper.warn(LogHelperTest.class, "advertencia de prueba");
            LogHelper.error(LogHelperTest.class, "error de prueba", exception);
            LogHelper.debug(LogHelperTest.class, "detalle de depuración");

            assertEquals(4, appender.list.size());
            assertEquals(Level.INFO, appender.list.get(0).getLevel());
            assertEquals(Level.WARN, appender.list.get(1).getLevel());
            assertEquals(Level.ERROR, appender.list.get(2).getLevel());
            assertEquals("java.lang.IllegalStateException", appender.list.get(2).getThrowableProxy().getClassName());
            assertEquals(Level.DEBUG, appender.list.get(3).getLevel());
            assertNotNull(appender.list.get(2).getThrowableProxy().getStackTraceElementProxyArray());
            assertTrue(((PatternLayoutEncoder) consoleAppender.getEncoder()).getPattern().contains("%nopex"));
            assertEquals("logs/unihub.log", fileAppender.getFile());

            String fileContents = Files.readString(Path.of(fileAppender.getFile()));
            assertTrue(fileContents.contains("error de prueba, IllegalStateException"));
            assertTrue(fileContents.contains("java.lang.IllegalStateException: detalle de prueba"));
            assertTrue(fileContents.contains("LogHelperTest.registraNivelesYConservaLaExcepcion"));
        } finally {
            logger.detachAppender(appender);
            logger.setLevel(previousLevel);
            appender.stop();
        }
    }
}