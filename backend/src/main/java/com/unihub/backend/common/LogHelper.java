package com.unihub.backend.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class LogHelper {

    private LogHelper() {
    }

    public static void info(Class<?> source, String message) {
        logger(source).info(message);
    }

    public static void warn(Class<?> source, String message) {
        logger(source).warn(message);
    }

    public static void error(Class<?> source, String message, Throwable exception) {
        if (exception == null) {
            logger(source).error(message);
            return;
        }

        logger(source).error(message + ", " + exception.getClass().getSimpleName(), exception);
    }

    public static void debug(Class<?> source, String message) {
        logger(source).debug(message);
    }

    private static Logger logger(Class<?> source) {
        return LoggerFactory.getLogger(source);
    }
}