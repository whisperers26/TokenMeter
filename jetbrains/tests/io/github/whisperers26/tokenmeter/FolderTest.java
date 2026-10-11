package io.github.whisperers26.tokenmeter;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public final class FolderTest {
    private static final Path HOME = Path.of("home", "me").toAbsolutePath();

    private FolderTest() {
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
}
