import java.io.IOException;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.lang.reflect.InvocationTargetException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;

/**
 * Builds the Token Meter plugin for a JetBrains IDE with that IDE's own Java,
 * so the build needs nothing else installed and nothing downloaded:
 *
 * <pre>
 *   &lt;IDE home&gt;/jbr/bin/java jetbrains/Build.java [test | package | install]
 * </pre>
 *
 * On macOS the IDE home is inside the application, and its Java is
 * {@code <IDE>.app/Contents/jbr/Contents/Home/bin/java}.
 *
 * The plugin draws in a slot JetBrains AI Assistant does not document, so it
 * is compiled against the AI Assistant that IDE has: a build that compiles is
 * one whose slot is still there. {@code test} compiles and runs the tests,
 * {@code package} (the default) also writes the plugin as a zip, and
 * {@code install} also puts it in the IDE's plugins folder.
 *
 * The IDE is the one whose Java runs this file; {@code --ide <home>} names
 * another. {@code --ai-assistant <folder>} names the AI Assistant plugin's
 * folder where it is not found in the IDE's plugins folder.
 */
public final class Build {
    private static final String PLUGIN = "token-meter";

    /** The class in the tests' folder that runs them all, and the method that does. */
    private static final String TESTS = "io.github.whisperers26.tokenmeter.AllTests";
    private static final String TESTS_RUN = "run";

    private static final Pattern VERSION = Pattern.compile("\"version\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern DATA_DIRECTORY = Pattern.compile("\"dataDirectoryName\"\\s*:\\s*\"([^\"]+)\"");

    private Build() {
    }

    public static void main(String[] args) throws Exception {
        String goal = "package";
        Path ide = null;
        Path aiAssistant = null;

        for (int at = 0; at < args.length; at += 1) {
            switch (args[at]) {
                case "test", "package", "install" -> goal = args[at];
                case "--ide" -> ide = Path.of(valueOf(args, at += 1));
                case "--ai-assistant" -> aiAssistant = Path.of(valueOf(args, at += 1));
                default -> throw failure("unknown argument: " + args[at]);
            }
        }

        Path root = rootOf();
        Path out = root.resolve("out");

        ide = ide != null ? ide : runningIde();

        Path plugins = pluginsFolderOf(ide);

        aiAssistant = aiAssistant != null ? aiAssistant : aiAssistantIn(ide, plugins);

        List<Path> libraries = librariesOf(ide, aiAssistant);

        System.out.println("IDE:          " + ide);
        System.out.println("AI Assistant: " + aiAssistant);

        deleteTree(out);

        Path classes = out.resolve("classes");
        Path testClasses = out.resolve("test-classes");

        compile(root.resolve("src"), classes, libraries);
        compile(root.resolve("tests"), testClasses, with(libraries, classes));
        test(with(with(libraries, classes), testClasses));

        if (goal.equals("test")) {
            return;
        }

        String version = versionOf(root.resolveSibling("mod").resolve(".claude-plugin").resolve("plugin.json"));
        Path folder = out.resolve(PLUGIN);
        Path zip = out.resolve(PLUGIN + "-" + version + ".zip");

        jar(classes, root.resolve("resources"), version, folder.resolve("lib").resolve(PLUGIN + ".jar"));
        zip(folder, zip);

        System.out.println("Plugin:       " + zip);

        if (goal.equals("install")) {
            install(folder, plugins.resolve(PLUGIN));
        }
    }

    private static String valueOf(String[] args, int at) {
        if (at >= args.length) {
            throw failure(args[at - 1] + " needs a value");
        }

        return args[at];
    }

    private static IllegalStateException failure(String message) {
        return new IllegalStateException(message);
    }

    /** The folder this file is in: the one named on the command line, or found from where it was run. */
    private static Path rootOf() {
        String command = System.getProperty("sun.java.command", "");
        String first = command.isBlank() ? "" : command.strip().split("\\s+")[0];

        Stream<Path> candidates = Stream.of(
            first.endsWith("Build.java") ? Path.of(first).toAbsolutePath().getParent() : null,
            Path.of("jetbrains").toAbsolutePath(),
            Path.of("").toAbsolutePath());

        return candidates
            .filter(folder -> folder != null && Files.isRegularFile(folder.resolve("Build.java")))
            .findFirst()
            .orElseThrow(() -> failure("run this from the repository's root, as jetbrains/Build.java"));
    }

    /** The IDE whose bundled Java is running this file. */
    private static Path runningIde() {
        Path at = Path.of(System.getProperty("java.home"));

        for (int up = 0; up < 5 && at != null; up += 1, at = at.getParent()) {
            if (productInfoOf(at) != null) {
                return at;
            }
        }

        throw failure("this Java is not a JetBrains IDE's: run <IDE home>/jbr/bin/java, or pass --ide <IDE home>");
    }

    private static Path productInfoOf(Path ide) {
        return Stream.of(ide.resolve("product-info.json"), ide.resolve("Resources").resolve("product-info.json"))
            .filter(Files::isRegularFile)
            .findFirst()
            .orElse(null);
    }

    /** Where the IDE keeps the plugins a person installed, by platform. */
    private static Path pluginsFolderOf(Path ide) throws IOException {
        Path productInfo = productInfoOf(ide);

        if (productInfo == null) {
            throw failure("no product-info.json in " + ide + ": is it an IDE's home?");
        }

        Matcher name = DATA_DIRECTORY.matcher(Files.readString(productInfo));

        if (!name.find()) {
            throw failure("no dataDirectoryName in " + productInfo);
        }

        String os = System.getProperty("os.name").toLowerCase(Locale.ROOT);
        Path home = Path.of(System.getProperty("user.home"));

        if (os.contains("win")) {
            return Path.of(System.getenv("APPDATA")).resolve("JetBrains").resolve(name.group(1)).resolve("plugins");
        }

        if (os.contains("mac")) {
            return home.resolve("Library").resolve("Application Support").resolve("JetBrains")
                .resolve(name.group(1)).resolve("plugins");
        }

        return home.resolve(".local").resolve("share").resolve("JetBrains").resolve(name.group(1));
    }

    private static Path aiAssistantIn(Path ide, Path plugins) {
        return Stream.of(plugins.resolve("ml-llm"), ide.resolve("plugins").resolve("ml-llm"))
            .filter(folder -> Files.isDirectory(folder.resolve("lib")))
            .findFirst()
            .orElseThrow(() -> failure(
                "JetBrains AI Assistant was not found in " + plugins + " or in the IDE:"
                    + " install it, or pass --ai-assistant <its folder>"));
    }

    /** Every jar the plugin is compiled against: the IDE's own, and AI Assistant's. */
    private static List<Path> librariesOf(Path ide, Path aiAssistant) throws IOException {
        List<Path> jars = new ArrayList<>();

        for (Path folder : List.of(
            ide.resolve("lib"),
            ide.resolve("lib").resolve("modules"),
            aiAssistant.resolve("lib"),
            aiAssistant.resolve("lib").resolve("modules"))) {
            if (Files.isDirectory(folder)) {
                try (Stream<Path> files = Files.list(folder)) {
                    files.filter(file -> file.toString().endsWith(".jar")).sorted().forEach(jars::add);
                }
            }
        }

        return jars;
    }

    private static List<Path> with(List<Path> classpath, Path more) {
        List<Path> all = new ArrayList<>(classpath);

        all.add(more);

        return all;
    }

    private static List<Path> filesIn(Path folder, String suffix) throws IOException {
        if (!Files.isDirectory(folder)) {
            return List.of();
        }

        try (Stream<Path> files = Files.walk(folder)) {
            return files
                .filter(file -> Files.isRegularFile(file) && file.toString().endsWith(suffix))
                .sorted()
                .toList();
        }
    }

    private static void compile(Path sources, Path classes, List<Path> classpath) throws IOException {
        List<Path> files = filesIn(sources, ".java");

        Files.createDirectories(classes);

        if (files.isEmpty()) {
            return;
        }

        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();

        if (compiler == null) {
            throw failure("this Java has no compiler: run the one a JetBrains IDE bundles, <IDE home>/jbr/bin/java");
        }

        List<String> arguments = new ArrayList<>(List.of(
            "--release", "21",
            "-encoding", "UTF-8",
            "-Xlint:all,-options,-serial,-processing,-classfile",
            "-d", classes.toString(),
            "-classpath", String.join(System.getProperty("path.separator"),
                classpath.stream().map(Path::toString).toList())));

        files.forEach(file -> arguments.add(file.toString()));

        if (compiler.run(null, null, null, arguments.toArray(String[]::new)) != 0) {
            throw failure("the sources in " + sources + " did not compile");
        }
    }

    /** Runs the tests in this process, in a class loader of their own. */
    private static void test(List<Path> classpath) throws Exception {
        URL[] urls = new URL[classpath.size()];

        for (int at = 0; at < urls.length; at += 1) {
            urls[at] = classpath.get(at).toUri().toURL();
        }

        try (URLClassLoader loader = new URLClassLoader(urls, ClassLoader.getPlatformClassLoader())) {
            Object failed;

            try {
                failed = loader.loadClass(TESTS).getMethod(TESTS_RUN).invoke(null);
            } catch (ClassNotFoundException none) {
                System.out.println("Tests:        none found");

                return;
            } catch (InvocationTargetException thrown) {
                throw new IllegalStateException("the tests could not be run", thrown.getCause());
            }

            if (!Integer.valueOf(0).equals(failed)) {
                throw failure(failed + " test(s) failed");
            }
        }
    }

    private static String versionOf(Path manifest) throws IOException {
        Matcher version = VERSION.matcher(Files.readString(manifest));

        if (!version.find()) {
            throw failure("no version in " + manifest);
        }

        return version.group(1);
    }

    /** Writes the plugin's jar: its classes and its resources, the descriptor stamped with the version. */
    private static void jar(Path classes, Path resources, String version, Path jar) throws IOException {
        Files.createDirectories(jar.getParent());

        try (ZipOutputStream zip = new ZipOutputStream(Files.newOutputStream(jar))) {
            for (Path file : filesIn(classes, "")) {
                entry(zip, classes.relativize(file), Files.readAllBytes(file));
            }

            for (Path file : filesIn(resources, "")) {
                byte[] content = file.getFileName().toString().equals("plugin.xml")
                    ? Files.readString(file).replace("${version}", version).getBytes(StandardCharsets.UTF_8)
                    : Files.readAllBytes(file);

                entry(zip, resources.relativize(file), content);
            }
        }
    }

    private static void zip(Path folder, Path archive) throws IOException {
        try (ZipOutputStream zip = new ZipOutputStream(Files.newOutputStream(archive))) {
            for (Path file : filesIn(folder, "")) {
                entry(zip, folder.getParent().relativize(file), Files.readAllBytes(file));
            }
        }
    }

    private static void entry(ZipOutputStream zip, Path name, byte[] content) throws IOException {
        zip.putNextEntry(new ZipEntry(name.toString().replace('\\', '/')));
        zip.write(content);
        zip.closeEntry();
    }

    /** Puts the built plugin in the IDE's plugins folder, in place of the one there. */
    private static void install(Path built, Path installed) throws IOException {
        try {
            deleteTree(installed);
        } catch (IOException | UncheckedIOException held) {
            throw failure(
                "could not replace " + installed + " (" + held.getMessage() + "):"
                    + " close the IDE and run this again, or use Settings | Plugins | Install Plugin from Disk");
        }

        for (Path file : filesIn(built, "")) {
            Path target = installed.resolve(built.relativize(file).toString());

            Files.createDirectories(target.getParent());

            try (OutputStream to = Files.newOutputStream(target)) {
                Files.copy(file, to);
            }
        }

        System.out.println("Installed:    " + installed + " (restart the IDE to load it)");
    }

    private static void deleteTree(Path folder) throws IOException {
        if (!Files.exists(folder)) {
            return;
        }

        Files.walkFileTree(folder, new SimpleFileVisitor<>() {
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attributes) throws IOException {
                Files.delete(file);

                return FileVisitResult.CONTINUE;
            }

            @Override
            public FileVisitResult postVisitDirectory(Path directory, IOException failed) throws IOException {
                Files.delete(directory);

                return FileVisitResult.CONTINUE;
            }
        });
    }
}
