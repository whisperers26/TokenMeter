package io.github.whisperers26.ccstatuslinedesktop;

import io.github.whisperers26.ccstatuslinedesktop.Snapshot.Row;
import io.github.whisperers26.ccstatuslinedesktop.Snapshot.Span;
import java.util.ArrayList;
import java.util.List;
import java.util.function.ToIntFunction;

/**
 * Where the spans of one status line go in a band of a given width.
 *
 * A row that fits is one line, its groups pushed apart to the band's edges as
 * the desktop app draws them. A row that does not fit is cut at the band's
 * edge and ends in an ellipsis, as a terminal too narrow for it shows it.
 */
public final class RowLayout {
    /** A span in its place: its left edge and its width. */
    public record Placed(Span span, int x, int width) {
    }

    /** A row laid out: its spans in their places, and the lines they take: one, or none for a row with no text. */
    public record Laid(List<Placed> placed, int lines) {
    }

    /** What stands where a row was cut, as the engine marks a line it cut. */
    private static final String ELLIPSIS = "...";

    private RowLayout() {
    }

    /**
     * Lays a row out.
     *
     * @param width the band's width
     * @param measure the width a span's text is drawn at
     */
    public static Laid lay(Row row, int width, ToIntFunction<Span> measure) {
        List<List<Span>> groups = row.groups();
        int[] widths = groups.stream().mapToInt(group -> group.stream().mapToInt(measure).sum()).toArray();

        int total = 0;
        int filled = 0;

        for (int groupWidth : widths) {
            total += groupWidth;
            filled += groupWidth > 0 ? 1 : 0;
        }

        if (filled == 0) {
            return new Laid(List.of(), 0);
        }

        return total <= width
            ? spread(groups, widths, width - total, measure)
            : cut(groups, width, measure);
    }

    /** One line, the room left over shared out between the groups: an empty group still holds its side. */
    private static Laid spread(List<List<Span>> groups, int[] widths, int free, ToIntFunction<Span> measure) {
        List<Placed> placed = new ArrayList<>();
        int before = 0;

        for (int at = 0; at < groups.size(); at += 1) {
            int x = before + (groups.size() == 1 ? 0 : free * at / (groups.size() - 1));

            for (Span span : groups.get(at)) {
                int width = measure.applyAsInt(span);

                placed.add(new Placed(span, x, width));
                x += width;
            }

            before += widths[at];
        }

        return new Laid(List.copyOf(placed), 1);
    }

    /**
     * One line cut at the band's edge as the engine cuts one at a terminal's: the groups
     * one after another with nothing between them, and an ellipsis where the row stops.
     */
    private static Laid cut(List<List<Span>> groups, int width, ToIntFunction<Span> measure) {
        List<Placed> placed = new ArrayList<>();
        int x = 0;

        for (List<Span> group : groups) {
            for (Span span : group) {
                int spanWidth = measure.applyAsInt(span);

                if (x + spanWidth > width - measure.applyAsInt(withText(span, ELLIPSIS))) {
                    Span last = withText(span, cutText(span, width - x, measure));

                    if (!last.text().isEmpty()) {
                        placed.add(new Placed(last, x, measure.applyAsInt(last)));
                    }

                    return new Laid(List.copyOf(placed), 1);
                }

                placed.add(new Placed(span, x, spanWidth));
                x += spanWidth;
            }
        }

        return new Laid(List.copyOf(placed), 1);
    }

    /**
     * The most of a span's text that fits in `room` with the ellipsis after it; in less
     * room than the ellipsis takes, the dots of it that fit.
     */
    private static String cutText(Span span, int room, ToIntFunction<Span> measure) {
        String text = span.text();

        for (int end = text.length(); end >= 0; end = end == 0 ? -1 : text.offsetByCodePoints(end, -1)) {
            String kept = text.substring(0, end) + ELLIPSIS;

            if (measure.applyAsInt(withText(span, kept)) <= room) {
                return kept;
            }
        }

        for (int dots = ELLIPSIS.length() - 1; dots > 0; dots -= 1) {
            if (measure.applyAsInt(withText(span, ELLIPSIS.substring(0, dots))) <= room) {
                return ELLIPSIS.substring(0, dots);
            }
        }

        return "";
    }

    /** A span of other text in the same style. */
    private static Span withText(Span span, String text) {
        return new Span(text, span.color(), span.background(), span.traits(), span.href());
    }
}
