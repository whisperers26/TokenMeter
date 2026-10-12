package io.github.whisperers26.ccstatuslinedesktop;

import com.intellij.ide.BrowserUtil;
import com.intellij.ml.llm.core.chat.session.ChatSession;
import com.intellij.ml.llm.core.chat.ui.chat.AIAssistantChatPanel;
import com.intellij.ml.llm.core.chat.ui.chat.AIAssistantChatPanelComponent;
import com.intellij.openapi.application.ApplicationManager;
import com.intellij.openapi.application.ModalityState;
import com.intellij.openapi.diagnostic.Logger;
import com.intellij.openapi.observable.properties.AtomicBooleanProperty;
import com.intellij.openapi.observable.properties.ObservableBooleanProperty;
import com.intellij.openapi.util.Disposer;
import com.intellij.util.concurrency.AppExecutorUtil;
import io.github.whisperers26.ccstatuslinedesktop.Snapshot.Row;
import io.github.whisperers26.ccstatuslinedesktop.Snapshot.Span;
import io.github.whisperers26.ccstatuslinedesktop.Snapshot.Trait;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import javax.swing.JComponent;
import kotlin.Unit;
import kotlinx.coroutines.CoroutineScope;
import kotlinx.coroutines.Job;

/**
 * The band of one chat: the status lines of the chat's Claude session, read
 * from the session's snapshot and drawn above the chat's input.
 *
 * The snapshot is read again every second while the chat is on screen, so the
 * band follows the mod's runs, a switch of agent and the session's start. A
 * chat with no snapshot (another agent's, or a session without the mod) shows
 * no band at all.
 */
final class Band implements AIAssistantChatPanelComponent {
    private static final Logger LOG = Logger.getInstance(Band.class);

    private static final long PERIOD_MS = 1000;

    /** What the band shows: rows to draw, faded where they are stale. No row is no band. */
    private record Shown(List<Row> rows, boolean isStale) {
        static final Shown NOTHING = new Shown(List.of(), false);
    }

    private final BandView view = new BandView(new IdeLook(), BrowserUtil::browse);
    private final AtomicBooleanProperty isVisible = new AtomicBooleanProperty(false);

    private final AIAssistantChatPanel chatPanel;
    private final ChatSession chat;
    private final ScheduledFuture<?> reading;

    // The reading thread's alone: where it reads from, what it last showed, and whether it has said it failed
    private final SnapshotReader reader;
    private Shown shown = Shown.NOTHING;
    private boolean hasFailed;

    Band(AIAssistantChatPanel chatPanel, ChatSession chat, Folder folder, CoroutineScope scope) {
        this.chatPanel = chatPanel;
        this.chat = chat;
        this.reader = new SnapshotReader(folder);

        reading = AppExecutorUtil.getAppScheduledExecutorService()
            .scheduleWithFixedDelay(this::readAgain, 0, PERIOD_MS, TimeUnit.MILLISECONDS);

        // The reading ends with the chat panel, by whichever of its two ends comes
        Disposer.register(chatPanel, () -> reading.cancel(false));

        Job life = scope.getCoroutineContext().get(Job.Key);

        if (life != null) {
            life.invokeOnCompletion(cause -> {
                reading.cancel(false);

                return Unit.INSTANCE;
            });
        }
    }

    @Override
    public JComponent getJComponent() {
        return view;
    }

    @Override
    public ObservableBooleanProperty getIsVisibleProperty() {
        return isVisible;
    }

    private void readAgain() {
        try {
            if (!chatPanel.isShowing()) {
                return;
            }

            Shown now = shownOf(reader.read(ChatSessions.agentSessionIdOf(chat)));

            if (!now.equals(shown)) {
                shown = now;
                ApplicationManager.getApplication().invokeLater(() -> show(now), ModalityState.any());
            }
        } catch (LinkageError changed) {
            // AI Assistant's classes are not the ones the plugin was built against: no later try will do better
            LOG.warn("ccstatusline desktop draws no band: build the plugin again for this AI Assistant", changed);
            reading.cancel(false);
        } catch (RuntimeException failed) {
            if (!hasFailed) {
                hasFailed = true;
                LOG.warn("ccstatusline desktop could not read this chat's status lines", failed);
            }
        }
    }

    private void show(Shown now) {
        view.show(now.rows(), now.isStale());
        isVisible.set(!now.rows().isEmpty());
    }

    private static Shown shownOf(Optional<Snapshot> read) {
        if (read.isEmpty()) {
            return Shown.NOTHING;
        }

        Snapshot snapshot = read.get();
        boolean isStale = snapshot.isStaleAt(System.currentTimeMillis());

        if (snapshot.failure() != null) {
            Span why = new Span("ccstatusline desktop: " + snapshot.failure(), null, null, Set.of(Trait.DIM), null);

            return new Shown(List.of(new Row(List.of(List.of(why)))), isStale);
        }

        return new Shown(snapshot.rows(), isStale);
    }
}
