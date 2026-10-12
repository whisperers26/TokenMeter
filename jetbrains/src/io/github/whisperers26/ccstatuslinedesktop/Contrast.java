package io.github.whisperers26.ccstatuslinedesktop;

/**
 * Whether a colour reads on a background. The engine's colours are a
 * terminal's, picked for a dark screen; an IDE's theme may be light.
 */
public final class Contrast {
    /** The least contrast a text colour is drawn at: under it the text is lost on the background. */
    public static final double LEGIBLE = 2.0;

    /** How many steps a colour is moved toward the theme's text in, the last one landing on it. */
    private static final int STEPS = 10;

    private Contrast() {
    }

    /** The contrast of two colours, each 0xRRGGBB, from 1 (the same) to 21 (black on white), as WCAG defines it. */
    public static double ratio(int one, int other) {
        double lighter = Math.max(luminanceOf(one), luminanceOf(other));
        double darker = Math.min(luminanceOf(one), luminanceOf(other));

        return (lighter + 0.05) / (darker + 0.05);
    }

    /**
     * The colour to draw text of `color` with on `background`.
     *
     * @param foreground the theme's own text colour on that background
     * @return `color` where it reads there; else `color` moved toward `foreground` until it does
     */
    public static int legible(int color, int background, int foreground) {
        for (int step = 0; step < STEPS; step += 1) {
            int moved = mixed(color, foreground, step);

            if (ratio(moved, background) >= LEGIBLE) {
                return moved;
            }
        }

        return foreground;
    }

    private static double luminanceOf(int color) {
        return 0.2126 * linear(color >> 16 & 0xff) + 0.7152 * linear(color >> 8 & 0xff) + 0.0722 * linear(color & 0xff);
    }

    /** One sRGB channel, 0 to 255, as the light it stands for, 0 to 1. */
    private static double linear(int channel) {
        double value = channel / 255.0;

        return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    }

    /** `color` moved `step` of the steps toward `toward`, channel by channel. */
    private static int mixed(int color, int toward, int step) {
        int mixed = 0;

        for (int shift = 16; shift >= 0; shift -= 8) {
            int from = color >> shift & 0xff;
            int to = toward >> shift & 0xff;

            mixed |= (from + (to - from) * step / STEPS) << shift;
        }

        return mixed;
    }
}
