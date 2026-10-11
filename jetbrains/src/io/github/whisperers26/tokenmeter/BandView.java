package io.github.whisperers26.tokenmeter;

import io.github.whisperers26.tokenmeter.RowLayout.Laid;
import io.github.whisperers26.tokenmeter.RowLayout.Placed;
import io.github.whisperers26.tokenmeter.Snapshot.Row;
import io.github.whisperers26.tokenmeter.Snapshot.Span;
import io.github.whisperers26.tokenmeter.Snapshot.Trait;
import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Cursor;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Insets;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;
import javax.swing.JComponent;

/**
 * Draws a session's status lines: the band above a chat's input.
 *
 * Its height follows its width: a band too narrow for a row wraps it. It
 * asks for no width of its own, so the chat it sits in decides that alone.
 */
public final class BandView extends JComponent {
    /** Room added between lines, over the font's own height. */
    private static final int LEADING = 2;

    /** How much of its strength a band of stale lines is drawn at. */
    private static final float STALE_STRENGTH = 0.5f;

    /** The width a band's rows are laid out for before it has been given one: room for any row. */
    private static final int UNBOUNDED = 1 << 20;

    /** A span in its place among every row's lines: `line` counts from the band's first. */
    private record Drawn(Placed placed, int line) {
    }

    private final transient Look look;
    private final transient Consumer<String> opener;

    private transient List<Row> rows = List.of();
    private boolean isStale;

    // The rows as laid out for one width, laid out again when it or they change
    private transient List<Drawn> drawn = List.of();
    private int drawnLines;
    private int drawnWidth = -1;

    private transient Drawn hovered;

    /**
     * @param look the theme the band is drawn in
     * @param opener opens the address of a link that was clicked
     */
    public BandView(Look look, Consumer<String> opener) {
        this.look = look;
        this.opener = opener;

        MouseAdapter mouse = new MouseAdapter() {
            @Override
            public void mouseMoved(MouseEvent event) {
                hover(linkAt(event.getX(), event.getY()));
            }

            @Override
            public void mouseExited(MouseEvent event) {
                hover(null);
            }

            @Override
            public void mouseClicked(MouseEvent event) {
                hrefAt(event.getX(), event.getY()).filter(BandView::isWebAddress).ifPresent(BandView.this.opener);
            }
        };

        addMouseListener(mouse);
        addMouseMotionListener(mouse);
    }

    /** A click opens a web page and nothing else: the address comes out of a file. */
    private static boolean isWebAddress(String address) {
        return address.startsWith("https://") || address.startsWith("http://");
    }

    /**
     * Shows other lines.
     *
     * @param rows the lines, one row each; none to show nothing
     * @param isStale whether the session has stopped running them: they are drawn faded
     */
    public void show(List<Row> rows, boolean isStale) {
        this.rows = List.copyOf(rows);
        this.isStale = isStale;

        drawnWidth = -1;
        hovered = null;
        revalidate();
        repaint();
    }

    /** The height one line of text is given. */
    int lineHeight() {
        return getFontMetrics(look.font()).getHeight() + LEADING;
    }

    /** The address of the link drawn at a point of the band, where there is one. */
    Optional<String> hrefAt(int x, int y) {
        return Optional.ofNullable(linkAt(x, y)).map(link -> link.placed().span().href());
    }

    private Drawn linkAt(int x, int y) {
        layOut();

        Insets insets = look.insets();
        int lineHeight = lineHeight();

        for (Drawn one : drawn) {
            int left = insets.left + one.placed().x();
            int top = insets.top + one.line() * lineHeight;

            if (one.placed().span().href() != null
                && x >= left && x < left + one.placed().width()
                && y >= top && y < top + lineHeight) {
                return one;
            }
        }

        return null;
    }

    private void hover(Drawn link) {
        if (link == hovered) {
            return;
        }

        hovered = link;
        setCursor(link == null ? Cursor.getDefaultCursor() : Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        repaint();
    }

    private Font fontOf(Span span) {
        int style = (span.traits().contains(Trait.BOLD) ? Font.BOLD : Font.PLAIN)
            | (span.traits().contains(Trait.ITALIC) ? Font.ITALIC : Font.PLAIN);

        return style == Font.PLAIN ? look.font() : look.font().deriveFont(style);
    }

    private int widthOf(Span span) {
        return getFontMetrics(fontOf(span)).stringWidth(span.text());
    }

    /** Lays the rows out for the band's width, where they are not laid out for it already. */
    private void layOut() {
        Insets insets = look.insets();
        int width = getWidth() > 0 ? Math.max(0, getWidth() - insets.left - insets.right) : UNBOUNDED;

        if (width == drawnWidth) {
            return;
        }

        List<Drawn> all = new ArrayList<>();
        int lines = 0;

        for (Row row : rows) {
            Laid laid = RowLayout.lay(row, width, look.gap(), this::widthOf);

            for (Placed placed : laid.placed()) {
                all.add(new Drawn(placed, lines + placed.line()));
            }

            lines += laid.lines();
        }

        drawn = all;
        drawnLines = lines;
        drawnWidth = width;
        hovered = null;
    }

    @Override
    public void setBounds(int x, int y, int width, int height) {
        boolean isResized = width != getWidth();

        super.setBounds(x, y, width, height);

        if (isResized) {
            int linesBefore = drawnLines;

            layOut();

            // A new width may wrap the rows differently, and so change the height to ask for
            if (drawnLines != linesBefore) {
                revalidate();
            }
        }
    }

    @Override
    public Dimension getPreferredSize() {
        layOut();

        Insets insets = look.insets();

        return new Dimension(0, drawnLines == 0 ? 0 : insets.top + drawnLines * lineHeight() + insets.bottom);
    }

    @Override
    public Dimension getMinimumSize() {
        return getPreferredSize();
    }

    @Override
    public Dimension getMaximumSize() {
        return new Dimension(Integer.MAX_VALUE, getPreferredSize().height);
    }

    @Override
    protected void paintComponent(Graphics g) {
        layOut();

        if (drawn.isEmpty()) {
            return;
        }

        Graphics2D graphics = (Graphics2D) g.create();

        try {
            look.prepare(graphics);

            if (isStale) {
                graphics.setComposite(AlphaComposite.SrcOver.derive(STALE_STRENGTH));
            }

            Insets insets = look.insets();
            int lineHeight = lineHeight();

            for (Drawn one : drawn) {
                paint(graphics, one, insets.left + one.placed().x(), insets.top + one.line() * lineHeight, lineHeight);
            }
        } finally {
            graphics.dispose();
        }
    }

    private void paint(Graphics2D graphics, Drawn one, int x, int top, int lineHeight) {
        Span span = one.placed().span();
        int width = one.placed().width();
        Color panel = look.panel();

        Color behind = span.background() == null ? null : new Color(span.background());

        // A colour and a background named together are the engine's own pair, drawn as given
        Color text = span.color() == null ? look.text()
            : behind != null ? new Color(span.color())
            : new Color(Contrast.legible(span.color(), rgbOf(panel), rgbOf(look.text())));

        if (span.traits().contains(Trait.INVERSE)) {
            Color swapped = behind == null ? panel : behind;

            behind = text;
            text = swapped;
        }

        if (span.traits().contains(Trait.DIM)) {
            text = halfway(text, behind == null ? panel : behind);
        }

        if (behind != null) {
            graphics.setColor(behind);
            graphics.fillRect(x, top, width, lineHeight);
        }

        Font font = fontOf(span);
        FontMetrics metrics = graphics.getFontMetrics(font);
        int baseline = top + (lineHeight - metrics.getHeight()) / 2 + metrics.getAscent();

        graphics.setFont(font);
        graphics.setColor(text);
        graphics.drawString(span.text(), x, baseline);

        if (span.traits().contains(Trait.UNDERLINE) || one == hovered) {
            graphics.drawLine(x, baseline + 1, x + width - 1, baseline + 1);
        }

        if (span.traits().contains(Trait.STRIKETHROUGH)) {
            int through = baseline - metrics.getAscent() / 3;

            graphics.drawLine(x, through, x + width - 1, through);
        }
    }

    private static int rgbOf(Color color) {
        return color.getRGB() & 0xffffff;
    }

    private static Color halfway(Color one, Color other) {
        return new Color(
            (one.getRed() + other.getRed()) / 2,
            (one.getGreen() + other.getGreen()) / 2,
            (one.getBlue() + other.getBlue()) / 2);
    }
}
