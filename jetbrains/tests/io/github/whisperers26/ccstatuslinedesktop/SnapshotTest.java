package io.github.whisperers26.ccstatuslinedesktop;

import io.github.whisperers26.ccstatuslinedesktop.Snapshot.Row;
import io.github.whisperers26.ccstatuslinedesktop.Snapshot.Span;
import io.github.whisperers26.ccstatuslinedesktop.Snapshot.Trait;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public final class SnapshotTest {
    private static final String LINES = """
        {
          "version": 1,
          "sessionId": "session-1",
          "updatedAt": 1700000900000,
          "freshUntil": 1700000990000,
          "rows": [
            {
              "groups": [
                [
                  { "text": "Model: Opus", "color": "#008787", "bold": true },
                  { "text": " | ", "dimColor": true }
                ],
                [{ "text": "main", "backgroundColor": "#ff0000", "href": "https://example.com/tree/main" }]
              ]
            }
          ]
        }
        """;

    private SnapshotTest() {
    }

    public static void reads_the_lines_as_rows_of_groups_of_spans() {
        Check.equal(
            Optional.of(new Snapshot(
                "session-1",
                1_700_000_900_000L,
                1_700_000_990_000L,
                List.of(new Row(List.of(
                    List.of(
                        new Span("Model: Opus", 0x008787, null, Set.of(Trait.BOLD), null),
                        new Span(" | ", null, null, Set.of(Trait.DIM), null)),
                    List.of(new Span("main", null, 0xff0000, Set.of(), "https://example.com/tree/main"))))),
                null)),
            Snapshot.parse(LINES));
    }

    public static void reads_a_failure_in_the_rows_place() {
        Check.equal(
            Optional.of(new Snapshot("session-1", 1_700_000_900_000L, null, List.of(), "the engine did not run (ENOENT)")),
            Snapshot.parse("""
                {"version":1,"sessionId":"session-1","updatedAt":1700000900000,"failure":"the engine did not run (ENOENT)"}
                """));
    }

    public static void reads_every_trait_a_span_is_styled_with() {
        Snapshot snapshot = Snapshot.parse("""
            {"version":1,"sessionId":"s","updatedAt":1,"rows":[{"groups":[[{"text":"x","bold":true,"dimColor":true,
            "italic":true,"underline":true,"inverse":true,"strikethrough":true}]]}]}
            """).orElseThrow();

        Check.equal(
            Set.of(Trait.BOLD, Trait.DIM, Trait.ITALIC, Trait.UNDERLINE, Trait.INVERSE, Trait.STRIKETHROUGH),
            snapshot.rows().get(0).groups().get(0).get(0).traits());
    }

    public static void text_that_is_no_snapshot_reads_as_none() {
        Check.equal(
            List.of(Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty()),
            List.of(
                Snapshot.parse(""),
                Snapshot.parse("{\"version\":1,\"sessionId\":\"session-1\",\"upda"),
                Snapshot.parse("[1, 2]"),
                Snapshot.parse("{\"version\":1}")));
    }

    public static void a_snapshot_of_a_later_shape_reads_as_none() {
        Check.equal(
            Optional.empty(),
            Snapshot.parse("{\"version\":2,\"sessionId\":\"session-1\",\"updatedAt\":1,\"rows\":[]}"));
    }

    public static void its_lines_are_stale_once_past_their_freshness() {
        Snapshot snapshot = Snapshot.parse(LINES).orElseThrow();

        Check.equal(
            List.of(false, true),
            List.of(snapshot.isStaleAt(1_700_000_990_000L), snapshot.isStaleAt(1_700_000_990_001L)));
    }

    public static void lines_with_no_end_to_their_freshness_never_go_stale() {
        Snapshot snapshot = Snapshot.parse(
            "{\"version\":1,\"sessionId\":\"s\",\"updatedAt\":1,\"rows\":[]}").orElseThrow();

        Check.equal(false, snapshot.isStaleAt(Long.MAX_VALUE));
    }
}
