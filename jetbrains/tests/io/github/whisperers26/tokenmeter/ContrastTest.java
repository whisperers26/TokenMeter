package io.github.whisperers26.tokenmeter;

import java.util.List;

public final class ContrastTest {
    private static final int WHITE = 0xffffff;
    private static final int BLACK = 0x000000;

    /** A dark theme's panel, and the text it draws on it. */
    private static final int DARK_PANEL = 0x2b2d30;
    private static final int DARK_TEXT = 0xdfe1e5;

    private ContrastTest() {
    }

    public static void black_on_white_is_the_most_two_colours_contrast() {
        Check.equal(List.of(21L, 1L), List.of(Math.round(Contrast.ratio(BLACK, WHITE)), Math.round(Contrast.ratio(WHITE, WHITE))));
    }

    public static void a_colour_that_reads_on_the_background_is_kept() {
        Check.equal(0x87ffff, Contrast.legible(0x87ffff, DARK_PANEL, DARK_TEXT));
    }

    public static void a_grey_the_engine_dimmed_on_purpose_is_kept_on_a_dark_theme() {
        Check.equal(0x5f5f5f, Contrast.legible(0x5f5f5f, DARK_PANEL, DARK_TEXT));
    }

    public static void a_colour_lost_on_the_background_is_moved_toward_the_themes_text_until_it_reads() {
        int terminalWhite = 0xe5e5e5;
        int drawn = Contrast.legible(terminalWhite, WHITE, BLACK);

        Check.equal(
            List.of(true, true),
            List.of(drawn != terminalWhite, Contrast.ratio(drawn, WHITE) >= Contrast.LEGIBLE));
    }

    public static void a_colour_lost_on_a_dark_background_is_moved_toward_its_light_text() {
        int terminalBlue = 0x0000ee;
        int drawn = Contrast.legible(terminalBlue, DARK_PANEL, DARK_TEXT);

        Check.equal(
            List.of(true, true),
            List.of(Contrast.ratio(drawn, DARK_PANEL) >= Contrast.LEGIBLE, (drawn & 0xff) > 0x80));
    }
}
