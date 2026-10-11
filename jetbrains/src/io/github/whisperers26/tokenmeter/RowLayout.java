package io.github.whisperers26.tokenmeter;

import io.github.whisperers26.tokenmeter.Snapshot.Row;
import io.github.whisperers26.tokenmeter.Snapshot.Span;
import java.util.ArrayList;
import java.util.List;
import java.util.function.ToIntFunction;

/**
 * Where the spans of one status line go in a band of a given width.
 *
 * A row that fits is one line, its groups pushed apart to the band's edges as
 * the desktop app draws them. A chat is often narrower than a status line, so
 * a row that does not fit wraps between spans instead of being cut.
 */
public final class RowLayout {
    /** A span in its place: its left edge, the line it is on (the first is 0), and its width. */
    public record Placed(Span span, int x, int line, int width) {
    }

    /** A row laid out: its spans in their places, and how many lines they take. */
    public record Laid(List<Placed> placed, int lines) {
    }

    private RowLayout() {
    }

    /**
     * Lays a row out.
     *
     * @param width the band's width
     * @param gap the least room left between two groups that share a line
     * @param measure the width a span's text is drawn at
     */
    public static Laid lay(Row row, int width, int gap, ToIntFunction<Span> measure) {
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

        return total + gap * (filled - 1) <= width
            ? spread(groups, widths, width - total, measure)
            : wrapped(groups, width, gap, measure);
    }

    /** One line, the room left over shared out between the groups: an empty group still holds its side. */
    private static Laid spread(List<List<Span>> groups, int[] widths, int free, ToIntFunction<Span> measure) {
        List<Placed> placed = new ArrayList<>();
        int before = 0;

        for (int at = 0; at < groups.size(); at += 1) {
            int x = before + (groups.size() == 1 ? 0 : free * at / (groups.size() - 1));

            for (Span span : groups.get(at)) {
                int width = measure.applyAsInt(span);

                placed.add(new Placed(span, x, 0, width));
                x += width;
            }

            before += widths[at];
        }

        return new Laid(List.copyOf(placed), 1);
    }

    /** Lines filled from the left: a span that does not fit starts the next one. */
    private static Laid wrapped(List<List<Span>> groups, int width, int gap, ToIntFunction<Span> measure) {
        List<Placed> placed = new ArrayList<>();
        int x = 0;
        int line = 0;

        for (List<Span> group : groups) {
            if (group.isEmpty()) {
                continue;
            }

            if (x > 0) {
                if (x + gap + measure.applyAsInt(group.get(0)) > width) {
                    line += 1;
                    x = 0;
                } else {
                    x += gap;
                }
            }

            for (Span span : group) {
                int spanWidth = measure.applyAsInt(span);

                if (x > 0 && x + spanWidth > width) {
                    line += 1;
                    x = 0;
                }

                placed.add(new Placed(span, x, line, spanWidth));
                x += spanWidth;
            }
        }

        return new Laid(List.copyOf(placed), line + 1);
    }
}
