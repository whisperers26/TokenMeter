package io.github.whisperers26.tokenmeter;

import io.github.whisperers26.tokenmeter.RowLayout.Laid;
import io.github.whisperers26.tokenmeter.RowLayout.Placed;
import io.github.whisperers26.tokenmeter.Snapshot.Row;
import io.github.whisperers26.tokenmeter.Snapshot.Span;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

public final class RowLayoutTest {
    /** The least room left between two groups that share a line. */
    private static final int GAP = 10;

    private RowLayoutTest() {
    }

    private static Span span(String text) {
        return new Span(text, null, null, Set.of(), null);
    }

    /** A row whose groups are each given as their spans' texts. */
    private static Row row(String[]... groups) {
        return new Row(Arrays.stream(groups)
            .map(texts -> Arrays.stream(texts).map(RowLayoutTest::span).toList())
            .toList());
    }

    private static String[] group(String... texts) {
        return texts;
    }

    /** Lays a row out in a font ten wide a character. */
    private static Laid lay(Row row, int width) {
        return RowLayout.lay(row, width, GAP, span -> span.text().length() * 10);
    }

    /** Where each span landed: its text, its left edge and its line. */
    private static List<String> places(Laid laid) {
        return laid.placed().stream()
            .map(placed -> placed.span().text() + "@" + placed.x() + "," + placed.line())
            .toList();
    }

    public static void a_lone_group_starts_at_the_left() {
        Laid laid = lay(row(group("Model", " | ", "Ctx")), 200);

        Check.equal(List.of("Model@0,0", " | @50,0", "Ctx@80,0"), places(laid));
        Check.equal(1, laid.lines());
    }

    public static void groups_that_fit_one_line_are_pushed_to_its_edges() {
        Check.equal(
            List.of("left@0,0", "right@150,0"),
            places(lay(row(group("left"), group("right")), 200)));
    }

    public static void a_group_between_two_others_sits_midway() {
        Check.equal(
            List.of("a@0,0", "b@45,0", "c@90,0"),
            places(lay(row(group("a"), group("b"), group("c")), 100)));
    }

    public static void an_empty_group_holds_its_side_of_the_line() {
        Check.equal(
            List.of("right@50,0"),
            places(lay(row(group(), group("right")), 100)));
    }

    public static void a_row_wider_than_the_band_wraps_between_spans() {
        Laid laid = lay(row(group("aaaa", "bbb", "cccc")), 80);

        Check.equal(List.of("aaaa@0,0", "bbb@40,0", "cccc@0,1"), places(laid));
        Check.equal(2, laid.lines());
    }

    public static void in_a_wrapped_row_a_group_follows_the_one_before_after_a_gap() {
        Check.equal(
            List.of("aaaa@0,0", "bbbb@0,1", "cc@50,1"),
            places(lay(row(group("aaaa", "bbbb"), group("cc")), 70)));
    }

    public static void in_a_wrapped_row_a_group_with_no_room_after_its_gap_starts_a_line() {
        Check.equal(
            List.of("aaaa@0,0", "bb@0,1"),
            places(lay(row(group("aaaa"), group("bb")), 50)));
    }

    public static void a_span_wider_than_the_band_keeps_a_line_to_itself() {
        Check.equal(
            List.of("a@0,0", "bbbbbbbbbb@0,1", "c@0,2"),
            places(lay(row(group("a", "bbbbbbbbbb", "c")), 50)));
    }

    public static void each_span_is_placed_with_its_own_width() {
        Check.equal(
            List.of(40, 20),
            lay(row(group("aaaa", "bb")), 200).placed().stream().map(Placed::width).toList());
    }

    public static void a_row_with_no_text_takes_no_line() {
        Laid laid = lay(row(group()), 100);

        Check.equal(List.of(), places(laid));
        Check.equal(0, laid.lines());
    }
}
