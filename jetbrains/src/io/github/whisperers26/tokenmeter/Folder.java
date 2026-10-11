package io.github.whisperers26.tokenmeter;

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
}
