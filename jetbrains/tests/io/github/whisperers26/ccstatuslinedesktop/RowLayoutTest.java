package io.github.whisperers26.ccstatuslinedesktop;

import io.github.whisperers26.ccstatuslinedesktop.RowLayout.Laid;
import io.github.whisperers26.ccstatuslinedesktop.RowLayout.Placed;
import io.github.whisperers26.ccstatuslinedesktop.Snapshot.Row;
import io.github.whisperers26.ccstatuslinedesktop.Snapshot.Span;
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

    public static void a_row_wider_than_the_band_is_cut_at_its_edge_with_an_ellipsis() {
        Laid laid = lay(row(group("aaaa", "bbb", "cccc")), 80);

        Check.equal(List.of("aaaa@0,0", "b...@40,0"), places(laid));
        Check.equal(1, laid.lines());
    }

    public static void a_row_exactly_as_wide_as_the_band_is_not_cut() {
        Check.equal(
            List.of("aaaa@0,0", "bbbb@40,0"),
            places(lay(row(group("aaaa"), group("bbbb")), 80)));
    }

    public static void in_a_cut_row_a_group_follows_the_one_before_with_no_room_between() {
        Check.equal(
            List.of("aa@0,0", "b...@20,0"),
            places(lay(row(group("aa"), group("bbbbb")), 60)));
    }

    public static void a_span_with_no_room_for_a_character_of_its_own_leaves_the_ellipsis() {
        Check.equal(
            List.of("aaaa@0,0", "...@40,0"),
            places(lay(row(group("aaaa", "bbbb")), 70)));
    }

    public static void a_band_narrower_than_the_ellipsis_shows_the_dots_that_fit() {
        Check.equal(List.of("..@0,0"), places(lay(row(group("aaaa")), 25)));
    }

    public static void a_cut_never_splits_a_character() {
        Check.equal(
            List.of("😀...@0,0"),
            places(lay(row(group("😀😀😀😀")), 60)));
    }

    public static void a_cut_span_keeps_its_style() {
        Span link = new Span("PR #7 open", 0xff0000, null, Set.of(), "https://example.com/pull/7");
        Laid laid = RowLayout.lay(new Row(List.of(List.of(link))), 80, GAP, span -> span.text().length() * 10);

        Check.equal(
            List.of(new Span("PR #7...", 0xff0000, null, Set.of(), "https://example.com/pull/7")),
            laid.placed().stream().map(Placed::span).toList());
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
