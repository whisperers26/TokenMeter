package io.github.whisperers26.ccstatuslinedesktop;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.Insets;

/**
 * What the band takes from where it is drawn: the IDE's theme, read each
 * time the band is laid out or painted, so a change of theme shows at once.
 */
public interface Look {
    /** The font the lines are drawn in; a bold or italic span derives its own from it. */
    Font font();

    /** The theme's own text colour, for a span that names none. */
    Color text();

    /** The colour the band is drawn on. */
    Color panel();

    /** The least room left between two groups that share a line. */
    int gap();

    /** The room kept around the lines. */
    Insets insets();

    /** Sets `graphics` up to draw text as the IDE draws its own. */
    void prepare(Graphics2D graphics);
}
