package io.github.whisperers26.tokenmeter;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.FileTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;

public final class FolderTest {
    private static final Path HOME = Path.of("home", "me").toAbsolutePath();

    private static final long NOW = 1_700_000_900_000L;
    private static final long DAY = 24 * 60 * 60 * 1000L;

    private FolderTest() {
    }

    /** The folder under a home directory made for one test. */
    private static Folder inTemporaryHome() throws IOException {
        return Folder.in(Map.of(), Files.createTempDirectory("token-meter-test").toString());
    }

    private static void write(Path file, long modifiedAt) throws IOException {
        Files.createDirectories(file.getParent());
        Files.writeString(file, "{}");
        Files.setLastModifiedTime(file, FileTime.fromMillis(modifiedAt));
    }

    private static List<String> namesIn(Path folder) throws IOException {
        try (Stream<Path> files = Files.list(folder)) {
            return files.map(file -> file.getFileName().toString()).sorted().toList();
        }
    }

    public static void is_under_the_home_directory_the_mod_finds() {
        Path profile = Path.of("profile").toAbsolutePath();

        Check.equal(
            List.of(
                profile.resolve(".cache").resolve("token-meter"),
                HOME.resolve(".cache").resolve("token-meter"),
                HOME.resolve(".cache").resolve("token-meter")),
            List.of(
                Folder.in(Map.of("USERPROFILE", profile.toString(), "HOME", "elsewhere"), "unused").path(),
                Folder.in(Map.of("HOME", HOME.toString()), "unused").path(),
                Folder.in(Map.of(), HOME.toString()).path()));
    }

    public static void keeps_the_readers_sign_of_life_in_one_file() {
        Check.equal(
            HOME.resolve(".cache").resolve("token-meter").resolve("reader"),
            Folder.in(Map.of(), HOME.toString()).reader());
    }

    public static void keeps_a_snapshot_in_a_file_named_for_its_session() {
        Check.equal(
            Optional.of(HOME.resolve(".cache").resolve("token-meter").resolve("sessions").resolve("abc-123.json")),
            Folder.in(Map.of(), HOME.toString()).snapshotOf("abc-123"));
    }

    public static void a_session_id_that_is_no_file_name_has_no_snapshot() {
        Folder folder = Folder.in(Map.of(), HOME.toString());

        Check.equal(
            List.of(Optional.empty(), Optional.empty(), Optional.empty()),
            List.of(folder.snapshotOf("../reader"), folder.snapshotOf("a/b"), folder.snapshotOf("")));
    }

    public static void a_sign_of_life_is_the_time_written_where_the_mod_reads_it() throws IOException {
        Folder folder = inTemporaryHome();

        folder.signLife(NOW);

        Check.equal("1700000900000", Files.readString(folder.reader()));
    }

    public static void pruning_drops_the_snapshots_no_session_has_written_for_a_week() throws IOException {
        Folder folder = inTemporaryHome();
        Path sessions = folder.snapshotOf("kept").orElseThrow().getParent();

        write(sessions.resolve("kept.json"), NOW - 6 * DAY);
        write(sessions.resolve("dropped.json"), NOW - 8 * DAY);
        write(sessions.resolve("not-a-snapshot.txt"), NOW - 8 * DAY);

        folder.prune(NOW);

        Check.equal(List.of("kept.json", "not-a-snapshot.txt"), namesIn(sessions));
    }

    public static void pruning_a_folder_that_holds_no_snapshot_yet_does_nothing() throws IOException {
        inTemporaryHome().prune(NOW);
    }
}
