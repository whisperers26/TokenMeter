package io.github.whisperers26.tokenmeter;

import com.intellij.openapi.Disposable;
import com.intellij.openapi.application.ApplicationManager;
import com.intellij.openapi.components.Service;
import com.intellij.openapi.diagnostic.Logger;
import com.intellij.util.concurrency.AppExecutorUtil;
import java.io.IOException;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

/**
 * Tells the mod, for as long as the IDE runs with this plugin, that a reader
 * of snapshots is here: a sign of life once a minute. When it stops (the IDE
 * closed, the plugin removed), sessions stop keeping snapshots by themselves.
 */
@Service(Service.Level.APP)
public final class ReaderLife implements Disposable {
    private static final Logger LOG = Logger.getInstance(ReaderLife.class);

    /** How often life is signed: well inside the time the mod waits before taking the reader for gone. */
    private static final long PERIOD_SECONDS = 60;

    private final ScheduledFuture<?> signing;

    public ReaderLife() {
        Folder folder = Folder.here();

        signing = AppExecutorUtil.getAppScheduledExecutorService()
            .scheduleWithFixedDelay(() -> sign(folder), 0, PERIOD_SECONDS, TimeUnit.SECONDS);

        AppExecutorUtil.getAppExecutorService().execute(() -> prune(folder));
    }

    /** Starts signing life, where it has not started yet. */
    static void start() {
        ApplicationManager.getApplication().getService(ReaderLife.class);
    }

    private static void sign(Folder folder) {
        try {
            folder.signLife(System.currentTimeMillis());
        } catch (IOException | RuntimeException failed) {
            LOG.warn("Token Meter could not sign life in " + folder.path() + ": sessions will keep no snapshot", failed);
        }
    }

    private static void prune(Folder folder) {
        try {
            folder.prune(System.currentTimeMillis());
        } catch (IOException | RuntimeException failed) {
            LOG.info("Token Meter could not clear old snapshots from " + folder.path(), failed);
        }
    }

    @Override
    public void dispose() {
        signing.cancel(false);
    }
}
