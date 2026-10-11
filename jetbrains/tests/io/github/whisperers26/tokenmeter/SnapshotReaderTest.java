package io.github.whisperers26.tokenmeter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public final class SnapshotReaderTest {
    private SnapshotReaderTest() {
    }

    /** The folder under a home directory made for one test. */
    private static Folder inTemporaryHome() throws IOException {
        return Folder.in(Map.of(), Files.createTempDirectory("token-meter-test").toString());
    }

    /** A snapshot's text: one row saying `text`, of the session `sessionId`. */
    private static String snapshot(String sessionId, String text) {
        return "{\"version\":1,\"sessionId\":\"" + sessionId + "\",\"updatedAt\":1,"
            + "\"rows\":[{\"groups\":[[{\"text\":\"" + text + "\"}]]}]}";
    }

    private static void keep(Folder folder, String sessionId, String content) throws IOException {
        Path file = folder.snapshotOf(sessionId).orElseThrow();

        Files.createDirectories(file.getParent());
        Files.writeString(file, content);
    }

    /** What a snapshot says: the text of its first span; nothing for no snapshot. */
    private static Optional<String> said(Optional<Snapshot> snapshot) {
        return snapshot.map(read -> read.rows().get(0).groups().get(0).get(0).text());
    }

    public static void reads_the_snapshot_a_session_keeps() throws IOException {
        Folder folder = inTemporaryHome();

        keep(folder, "abc", snapshot("abc", "Model: Opus"));

        Check.equal(Optional.of("Model: Opus"), said(new SnapshotReader(folder).read("abc")));
    }

    public static void a_session_that_keeps_no_snapshot_has_none() throws IOException {
        SnapshotReader reader = new SnapshotReader(inTemporaryHome());

        Check.equal(List.of(Optional.empty(), Optional.empty()), List.of(reader.read("abc"), reader.read(null)));
    }

    public static void follows_the_file_as_the_session_writes_it_again() throws IOException {
        Folder folder = inTemporaryHome();
        SnapshotReader reader = new SnapshotReader(folder);

        keep(folder, "abc", snapshot("abc", "Ctx: 1k"));
        reader.read("abc");
        keep(folder, "abc", snapshot("abc", "Ctx: 2k"));

        Check.equal(Optional.of("Ctx: 2k"), said(reader.read("abc")));
    }

    public static void a_file_caught_half_written_keeps_the_snapshot_last_read() throws IOException {
        Folder folder = inTemporaryHome();
        SnapshotReader reader = new SnapshotReader(folder);

        keep(folder, "abc", snapshot("abc", "Ctx: 1k"));
        reader.read("abc");
        keep(folder, "abc", snapshot("abc", "Ctx: 2k").substring(0, 40));

        Check.equal(Optional.of("Ctx: 1k"), said(reader.read("abc")));
    }

    public static void a_file_cut_inside_a_character_keeps_the_snapshot_last_read() throws IOException {
        Folder folder = inTemporaryHome();
        SnapshotReader reader = new SnapshotReader(folder);
        byte[] whole = snapshot("abc", "Ctx: 2k").getBytes(StandardCharsets.UTF_8);
        int inside = new String(whole, StandardCharsets.ISO_8859_1).indexOf('Â') + 1;

        keep(folder, "abc", snapshot("abc", "Ctx: 1k"));
        reader.read("abc");
        Files.write(folder.snapshotOf("abc").orElseThrow(), java.util.Arrays.copyOf(whole, inside));

        Check.equal(Optional.of("Ctx: 1k"), said(reader.read("abc")));
    }

    public static void a_half_written_file_shows_nothing_of_the_session_read_before_it() throws IOException {
        Folder folder = inTemporaryHome();
        SnapshotReader reader = new SnapshotReader(folder);

        keep(folder, "abc", snapshot("abc", "Ctx: 1k"));
        keep(folder, "xyz", snapshot("xyz", "Ctx: 9k").substring(0, 40));
        reader.read("abc");

        Check.equal(Optional.empty(), reader.read("xyz"));
    }

    public static void a_file_that_holds_another_sessions_snapshot_is_not_shown() throws IOException {
        Folder folder = inTemporaryHome();

        keep(folder, "abc", snapshot("xyz", "Ctx: 9k"));

        Check.equal(Optional.empty(), new SnapshotReader(folder).read("abc"));
    }

    public static void a_file_that_goes_away_reads_as_none() throws IOException {
        Folder folder = inTemporaryHome();
        SnapshotReader reader = new SnapshotReader(folder);

        keep(folder, "abc", snapshot("abc", "Ctx: 1k"));
        reader.read("abc");
        Files.delete(folder.snapshotOf("abc").orElseThrow());

        Check.equal(Optional.empty(), reader.read("abc"));
    }
}
