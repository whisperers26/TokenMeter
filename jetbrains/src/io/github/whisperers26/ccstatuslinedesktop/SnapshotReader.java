package io.github.whisperers26.ccstatuslinedesktop;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.util.Optional;

/**
 * Reads a session's snapshot from its file, as often as it is asked, for one
 * reader on one thread.
 *
 * The mod writes the file while this reads it, and nothing makes the write
 * one step: a file caught half written, or cut inside a character, is no
 * failure, and the snapshot last read of that session stands until a whole
 * one is there.
 */
public final class SnapshotReader {
    private final Folder folder;

    // What was last read, of which session, and what it came to
    private String readOf;
    private String readText;
    private Snapshot read;

    public SnapshotReader(Folder folder) {
        this.folder = folder;
    }

    /**
     * The snapshot a session keeps now.
     *
     * @param sessionId the session; null for none
     * @return the snapshot; empty for no session, or one that keeps none
     */
    public Optional<Snapshot> read(String sessionId) {
        Optional<Path> file = sessionId == null ? Optional.empty() : folder.snapshotOf(sessionId);

        if (file.isEmpty()) {
            return keep(null, null, null);
        }

        String text;

        try {
            text = Files.readString(file.get());
        } catch (NoSuchFileException none) {
            return keep(null, null, null);
        } catch (IOException unread) {
            return keep(sessionId, null, sessionId.equals(readOf) ? read : null);
        }

        if (sessionId.equals(readOf) && text.equals(readText)) {
            return Optional.ofNullable(read);
        }

        Optional<Snapshot> whole = Snapshot.parse(text).filter(snapshot -> snapshot.sessionId().equals(sessionId));

        return keep(sessionId, text, whole.orElse(sessionId.equals(readOf) ? read : null));
    }

    private Optional<Snapshot> keep(String sessionId, String text, Snapshot snapshot) {
        readOf = sessionId;
        readText = text;
        read = snapshot;

        return Optional.ofNullable(snapshot);
    }
}
