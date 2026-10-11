package io.github.whisperers26.tokenmeter;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

/**
 * Runs the plugin's tests, for the build: a test is a public static method
 * that takes nothing, in one of the classes listed here, and fails by
 * throwing. The IDE ships no test framework to run them with.
 */
public final class AllTests {
    private static final List<Class<?>> SUITES = List.of();

    private AllTests() {
    }

    /**
     * Runs every test, saying how each ended.
     *
     * @return how many failed
     */
    public static int run() throws IllegalAccessException {
        int passed = 0;
        int failed = 0;

        for (Class<?> suite : SUITES) {
            Method[] tests = suite.getDeclaredMethods();

            Arrays.sort(tests, Comparator.comparing(Method::getName));

            for (Method test : tests) {
                int modifiers = test.getModifiers();

                if (!Modifier.isPublic(modifiers) || !Modifier.isStatic(modifiers) || test.getParameterCount() != 0) {
                    continue;
                }

                String name = suite.getSimpleName() + " > " + test.getName().replace('_', ' ');

                try {
                    test.invoke(null);
                    passed += 1;
                    System.out.println("(pass) " + name);
                } catch (InvocationTargetException thrown) {
                    failed += 1;
                    System.out.println("(fail) " + name);
                    System.out.println("  " + String.valueOf(thrown.getCause()).replace("\n", "\n  "));
                }
            }
        }

        System.out.println("Tests:        " + passed + " pass, " + failed + " fail");

        return failed;
    }
}
