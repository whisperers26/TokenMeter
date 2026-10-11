package io.github.whisperers26.tokenmeter;

import io.github.whisperers26.tokenmeter.Snapshot.Row;
import io.github.whisperers26.tokenmeter.Snapshot.Span;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.Insets;
import java.awt.event.MouseEvent;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import javax.swing.JPanel;

public final class BandViewTest {
    private static final Insets INSETS = new Insets(3, 5, 3, 5);

    /** A look with nothing of an IDE in it. */
    private static final Look LOOK = new Look() {
        @Override
        public Font font() {
            return new Font(Font.MONOSPACED, Font.PLAIN, 12);
        }

        @Override
        public Color text() {
            return Color.WHITE;
        }

        @Override
        public Color panel() {
            return Color.BLACK;
        }

        @Override
        public int gap() {
            return 10;
        }

        @Override
        public Insets insets() {
            return INSETS;
        }

        @Override
        public void prepare(Graphics2D graphics) {
        }
    };

    private static final String ADDRESS = "https://example.com/pull/7";

    private BandViewTest() {
    }

    private static Span span(String text) {
        return new Span(text, null, null, Set.of(), null);
    }

    private static Row row(Span... spans) {
        return new Row(List.of(List.of(spans)));
    }

    /** A view showing `rows`, as wide as it is told. */
    private static BandView showing(int width, Row... rows) {
        return showing(width, new ArrayList<>(), rows);
    }

    /** That view, the addresses it opens kept in `opened`. */
    private static BandView showing(int width, List<String> opened, Row... rows) {
        BandView view = new BandView(LOOK, opened::add);

        view.show(List.of(rows), false);
        view.setSize(width, 100);

        return view;
    }

    public static void takes_no_room_with_nothing_to_show() {
        Check.equal(0, showing(400).getPreferredSize().height);
    }

    public static void is_a_line_tall_for_each_row_that_fits() {
        BandView view = showing(2000, row(span("Model: Opus")), row(span("Total: 22.7M")));

        Check.equal(INSETS.top + 2 * view.lineHeight() + INSETS.bottom, view.getPreferredSize().height);
    }

    public static void grows_taller_where_a_narrow_band_wraps_a_row() {
        Row row = row(span("Model: Opus 5.5"), span(" | "), span("Thinking: high"), span(" | "), span("Ctx: 183.4k"));

        Check.equal(
            List.of(true, true),
            List.of(
                showing(2000, row).getPreferredSize().height == INSETS.top + showing(2000, row).lineHeight() + INSETS.bottom,
                showing(150, row).getPreferredSize().height > showing(2000, row).getPreferredSize().height));
    }

    public static void asks_for_no_width_of_its_own() {
        Check.equal(0, showing(2000, row(span("Model: Opus 5.5"))).getMinimumSize().width);
    }

    public static void finds_the_address_of_the_link_under_a_point() {
        BandView view = showing(2000, row(new Span("PR #7", null, null, Set.of(), ADDRESS), span(" open")));

        Check.equal(
            List.of(Optional.of(ADDRESS), Optional.empty(), Optional.empty()),
            List.of(
                view.hrefAt(INSETS.left + 2, INSETS.top + 2),
                view.hrefAt(1500, INSETS.top + 2),
                view.hrefAt(INSETS.left + 2, INSETS.top + view.lineHeight() + 5)));
    }

    public static void paints_its_text_in_the_colours_it_was_given() {
        BandView view = showing(200, row(new Span("MMMM", 0xff0000, null, Set.of(), null)));
        BufferedImage image = new BufferedImage(200, 40, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = image.createGraphics();

        view.paint(graphics);
        graphics.dispose();

        boolean hasRed = false;

        for (int x = 0; x < image.getWidth(); x += 1) {
            for (int y = 0; y < image.getHeight(); y += 1) {
                hasRed |= (image.getRGB(x, y) & 0xffffff) == 0xff0000;
            }
        }

        Check.equal(true, hasRed);
    }

    private static void click(BandView view, int x, int y) {
        view.dispatchEvent(new MouseEvent(view, MouseEvent.MOUSE_CLICKED, 0, 0, x, y, 1, false, MouseEvent.BUTTON1));
    }

    public static void a_click_on_a_link_opens_its_address() {
        List<String> opened = new ArrayList<>();
        BandView view = showing(2000, opened, row(new Span("PR #7", null, null, Set.of(), ADDRESS), span(" open")));

        click(view, INSETS.left + 2, INSETS.top + 2);
        click(view, 1500, INSETS.top + 2);

        Check.equal(List.of(ADDRESS), opened);
    }

    public static void a_click_opens_nothing_but_a_web_address() {
        List<String> opened = new ArrayList<>();
        BandView view = showing(2000, opened, row(new Span("notes", null, null, Set.of(), "file:///C:/notes.txt")));

        click(view, INSETS.left + 2, INSETS.top + 2);

        Check.equal(List.of(), opened);
    }

    public static void takes_what_is_painted_behind_it_for_its_background() {
        BandView alone = showing(200);
        BandView held = showing(200);
        JPanel wrapper = new JPanel();
        JPanel holder = new JPanel();

        wrapper.setOpaque(false);
        wrapper.add(held);
        holder.setBackground(Color.GREEN);
        holder.add(wrapper);

        Check.equal(List.of(Color.BLACK, Color.GREEN), List.of(alone.panel(), held.panel()));
    }

    public static void lays_its_rows_out_again_when_the_themes_font_changes() {
        int[] size = {12};

        Look look = new Look() {
            @Override
            public Font font() {
                return new Font(Font.MONOSPACED, Font.PLAIN, size[0]);
            }

            @Override
            public Color text() {
                return LOOK.text();
            }

            @Override
            public Color panel() {
                return LOOK.panel();
            }

            @Override
            public int gap() {
                return LOOK.gap();
            }

            @Override
            public Insets insets() {
                return INSETS;
            }

            @Override
            public void prepare(Graphics2D graphics) {
            }
        };

        BandView view = new BandView(look, address -> { });

        view.show(List.of(row(span("Model: Opus 5.5"), span(" | "), span("Thinking: high"))), false);
        view.setSize(400, 100);

        boolean fitsOneLine = view.getPreferredSize().height == INSETS.top + view.lineHeight() + INSETS.bottom;

        size[0] = 40;

        boolean wrapsInTheLargerFont =
            view.getPreferredSize().height >= INSETS.top + 2 * view.lineHeight() + INSETS.bottom;

        Check.equal(List.of(true, true), List.of(fitsOneLine, wrapsInTheLargerFont));
    }
}
