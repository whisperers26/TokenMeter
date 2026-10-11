package io.github.whisperers26.tokenmeter;

import java.util.Objects;

/** What a test checks with: a failed check throws, which fails the test. */
final class Check {
    private Check() {
    }

    static void equal(Object expected, Object actual) {
        if (!Objects.equals(expected, actual)) {
            throw new AssertionError("expected " + expected + "\nbut got  " + actual);
        }
    }
}
