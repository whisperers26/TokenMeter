package io.github.whisperers26.tokenmeter;

import com.intellij.ide.ui.UISettings;
import com.intellij.util.ui.JBFont;
import com.intellij.util.ui.JBUI;
import com.intellij.util.ui.UIUtil;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.Insets;

/** The band's look in an IDE: its theme's own font and colours, as they stand when asked. */
final class IdeLook implements Look {
    /** The least room left between two groups that share a line, before scaling. */
    private static final int GAP = 16;

    // The font below, and the IDE font it was made from: made again when that one changes
    private Font from;
    private Font font;

    /**
     * A size under the IDE's labels, as its own status texts are, able to
     * fall back to another font for a glyph it lacks (a branch mark, an arrow).
     */
    @Override
    public Font font() {
        Font ide = JBFont.medium();

        if (!ide.equals(from)) {
            from = ide;
            font = UIUtil.getFontWithFallback(ide);
        }

        return font;
    }

    @Override
    public Color text() {
        return UIUtil.getLabelForeground();
    }

    @Override
    public Color panel() {
        return UIUtil.getPanelBackground();
    }

    @Override
    public int gap() {
        return JBUI.scale(GAP);
    }

    @Override
    public Insets insets() {
        return JBUI.insets(2, 8);
    }

    @Override
    public void prepare(Graphics2D graphics) {
        UISettings.setupAntialiasing(graphics);
    }
}
