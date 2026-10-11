package com.unihub.backend.service;

import com.unihub.backend.exception.TooManyLoginAttemptsException;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Locale;

@Service
public class LoginAttemptRateLimiter {
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final int MAX_TRACKED_ACCOUNTS = 10_000;
    private final Clock clock;
    private final Map<String, Attempts> attemptsByAccount = new HashMap<>();

    public LoginAttemptRateLimiter() {
        this(Clock.systemUTC());
    }

    LoginAttemptRateLimiter(Clock clock) {
        this.clock = clock;
    }

    public synchronized void verificarPermitido(String account) {
        Attempts attempts = attemptsByAccount.get(normalize(account));
        if (attempts == null) return;
        if (isExpired(attempts)) {
            attemptsByAccount.remove(normalize(account));
            return;
        }
        if (attempts.failures >= MAX_FAILED_ATTEMPTS) throw new TooManyLoginAttemptsException();
    }

    public synchronized void registrarFallo(String account) {
        String key = normalize(account);
        Instant now = clock.instant();
        Attempts attempts = attemptsByAccount.get(key);
        if (attempts == null || isExpired(attempts)) {
            if (attemptsByAccount.size() >= MAX_TRACKED_ACCOUNTS) {
                attemptsByAccount.entrySet().removeIf(entry -> isExpired(entry.getValue()));
                if (attemptsByAccount.size() >= MAX_TRACKED_ACCOUNTS) {
                    String oldest = attemptsByAccount.entrySet().stream()
                            .min(Map.Entry.comparingByValue((left, right) -> left.startedAt.compareTo(right.startedAt)))
                            .map(Map.Entry::getKey).orElse(null);
                    if (oldest != null) attemptsByAccount.remove(oldest);
                }
            }
            attemptsByAccount.put(key, new Attempts(now, 1));
        } else {
            attempts.failures++;
        }
    }

    public synchronized void registrarExito(String account) {
        attemptsByAccount.remove(normalize(account));
    }

    private boolean isExpired(Attempts attempts) {
        return !clock.instant().isBefore(attempts.startedAt.plus(WINDOW));
    }

    private static String normalize(String account) {
        return account == null ? "" : account.trim().toLowerCase(Locale.ROOT);
    }

    private static final class Attempts {
        private final Instant startedAt;
        private int failures;

        private Attempts(Instant startedAt, int failures) {
            this.startedAt = startedAt;
            this.failures = failures;
        }
    }
}
