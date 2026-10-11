package io.github.whisperers26.tokenmeter;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;
import com.google.gson.JsonParser;
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * A Claude session's status lines as the Token Meter mod last ran them: what
 * the mod writes to the session's snapshot file, read back.
 *
 * @param sessionId the session the lines are of
 * @param updatedAt when they were run, in milliseconds since the epoch
 * @param freshUntil when they stop being current; null where no later run is due
 * @param rows the lines, one row each; empty where a failure stands in their place
 * @param failure why there are no lines; null where there are
 */
public record Snapshot(String sessionId, long updatedAt, Long freshUntil, List<Row> rows, String failure) {
    /** The shape of snapshot this reads: the mod's `version`. */
    private static final int VERSION = 1;

    /** One status line as its groups: the parts the band pushes to its edges. */
    public record Row(List<List<Span>> groups) {
    }

    /**
     * One run of text of a single style.
     *
     * @param color the text's colour as 0xRRGGBB; null for the band's own
     * @param background the colour behind it as 0xRRGGBB; null for none
     * @param href the address a click on the text opens; null for none
     */
    public record Span(String text, Integer color, Integer background, Set<Trait> traits, String href) {
    }

    /** A way a span is styled, and the field of the mod's span that says so. */
    public enum Trait {
        BOLD("bold"),
        DIM("dimColor"),
        ITALIC("italic"),
        UNDERLINE("underline"),
        INVERSE("inverse"),
        STRIKETHROUGH("strikethrough");

        private final String field;

        Trait(String field) {
            this.field = field;
        }
    }

    /**
     * Reads a snapshot file's text.
     *
     * @return the snapshot; empty for text that is none, as a file caught half written is
     */
    public static Optional<Snapshot> parse(String json) {
        try {
            JsonObject snapshot = JsonParser.parseString(json).getAsJsonObject();

            if (snapshot.get("version").getAsInt() != VERSION) {
                return Optional.empty();
            }

            return Optional.of(new Snapshot(
                snapshot.get("sessionId").getAsString(),
                snapshot.get("updatedAt").getAsLong(),
                snapshot.has("freshUntil") ? snapshot.get("freshUntil").getAsLong() : null,
                snapshot.has("rows") ? rowsOf(snapshot.getAsJsonArray("rows")) : List.of(),
                snapshot.has("failure") ? snapshot.get("failure").getAsString() : null));
        } catch (JsonParseException | IllegalStateException | NullPointerException
                 | ClassCastException | NumberFormatException | UnsupportedOperationException malformed) {
            return Optional.empty();
        }
    }

    private static List<Row> rowsOf(JsonArray rows) {
        List<Row> read = new ArrayList<>();

        for (JsonElement row : rows) {
            List<List<Span>> groups = new ArrayList<>();

            for (JsonElement group : row.getAsJsonObject().getAsJsonArray("groups")) {
                List<Span> spans = new ArrayList<>();

                for (JsonElement span : group.getAsJsonArray()) {
                    spans.add(spanOf(span.getAsJsonObject()));
                }

                groups.add(List.copyOf(spans));
            }

            read.add(new Row(List.copyOf(groups)));
        }

        return List.copyOf(read);
    }

    private static Span spanOf(JsonObject span) {
        Set<Trait> traits = EnumSet.noneOf(Trait.class);

        for (Trait trait : Trait.values()) {
            if (span.has(trait.field) && span.get(trait.field).getAsBoolean()) {
                traits.add(trait);
            }
        }

        return new Span(
            span.get("text").getAsString(),
            colorOf(span, "color"),
            colorOf(span, "backgroundColor"),
            Collections.unmodifiableSet(traits),
            span.has("href") ? span.get("href").getAsString() : null);
    }

    /** A colour the mod spelled `#rrggbb`; null where the span names none. */
    private static Integer colorOf(JsonObject span, String field) {
        if (!span.has(field)) {
            return null;
        }

        String hex = span.get(field).getAsString();

        return hex.length() == 7 && hex.charAt(0) == '#' ? Integer.valueOf(hex.substring(1), 16) : null;
    }

    /** Whether the session has stopped running its lines: they are shown as old. */
    public boolean isStaleAt(long now) {
        return freshUntil != null && now > freshUntil;
    }
}
