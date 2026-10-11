package io.github.whisperers26.tokenmeter;

import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * The folder the Token Meter mod keeps snapshots in and reads its reader's
 * sign of life from, under the home directory on every platform.
 */
public record Folder(Path path) {
    /** A session id as Claude Code makes them: nothing a file name cannot hold. */
    private static final Pattern FILE_NAME = Pattern.compile("[A-Za-z0-9][A-Za-z0-9._-]*");

    /** How long a snapshot is kept after its session last wrote it. */
    private static final long KEPT_MS = 7L * 24 * 60 * 60 * 1000;

    /**
     * The folder as the mod finds it, so that both name the same place: the
     * mod reads the home directory from USERPROFILE, then from HOME.
     *
     * @param environment the process's environment
     * @param userHome Java's own idea of the home directory, for where the environment names none
     */
    public static Folder in(Map<String, String> environment, String userHome) {
        String home = environment.getOrDefault("USERPROFILE", environment.getOrDefault("HOME", userHome));

        return new Folder(Path.of(home).resolve(".cache").resolve("token-meter"));
    }

    /** The folder for this process: its own environment, and its own home directory. */
    public static Folder here() {
        return in(System.getenv(), System.getProperty("user.home"));
    }

    /** The file this reader keeps its sign of life in. */
    public Path reader() {
        return path.resolve("reader");
    }

    /**
     * A session's snapshot file.
     *
     * @return the file; empty for an id that could not name one
     */
    public Optional<Path> snapshotOf(String sessionId) {
        return FILE_NAME.matcher(sessionId).matches()
            ? Optional.of(path.resolve("sessions").resolve(sessionId + ".json"))
            : Optional.empty();
    }

    /**
     * Tells the mod a reader of snapshots is here: sessions keep theirs while
     * this is fresh.
     *
     * @param now the time, in milliseconds since the epoch
     */
    public void signLife(long now) throws IOException {
        Files.createDirectories(path);
        Files.writeString(reader(), Long.toString(now));
    }

    /**
     * Drops the snapshots no session has written for a week: those of
     * sessions long over, which nothing else clears away.
     *
     * @param now the time, in milliseconds since the epoch
     */
    public void prune(long now) throws IOException {
        Path sessions = path.resolve("sessions");

        if (!Files.isDirectory(sessions)) {
            return;
        }

        try (DirectoryStream<Path> snapshots = Files.newDirectoryStream(sessions, "*.json")) {
            for (Path snapshot : snapshots) {
                if (Files.getLastModifiedTime(snapshot).toMillis() < now - KEPT_MS) {
                    Files.deleteIfExists(snapshot);
                }
            }
        }
    }
}
