package io.github.whisperers26.tokenmeter;

import com.intellij.ide.BrowserUtil;
import com.intellij.ml.llm.core.chat.session.ChatSession;
import com.intellij.ml.llm.core.chat.ui.chat.AIAssistantChatPanel;
import com.intellij.ml.llm.core.chat.ui.chat.AIAssistantChatPanelComponent;
import com.intellij.openapi.application.ApplicationManager;
import com.intellij.openapi.application.ModalityState;
import com.intellij.openapi.diagnostic.Logger;
import com.intellij.openapi.observable.properties.AtomicBooleanProperty;
import com.intellij.openapi.observable.properties.ObservableBooleanProperty;
import com.intellij.util.concurrency.AppExecutorUtil;
import io.github.whisperers26.tokenmeter.Snapshot.Row;
import io.github.whisperers26.tokenmeter.Snapshot.Span;
import io.github.whisperers26.tokenmeter.Snapshot.Trait;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
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
    private final Folder folder;
    private final ScheduledFuture<?> reading;

    // What the reading thread last read, and showed: its alone
    private String readOf;
    private String readText;
    private Snapshot read;
    private Shown shown = Shown.NOTHING;
    private boolean hasFailed;

    Band(AIAssistantChatPanel chatPanel, ChatSession chat, Folder folder, CoroutineScope scope) {
        this.chatPanel = chatPanel;
        this.chat = chat;
        this.folder = folder;

        reading = AppExecutorUtil.getAppScheduledExecutorService()
            .scheduleWithFixedDelay(this::readAgain, 0, PERIOD_MS, TimeUnit.MILLISECONDS);

        // AI Assistant ends the scope with the chat panel: the reading ends with it
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

            Shown now = shownOf(snapshotOf(ChatSessions.agentSessionIdOf(chat)));

            if (!now.equals(shown)) {
                shown = now;
                ApplicationManager.getApplication().invokeLater(() -> show(now), ModalityState.any());
            }
        } catch (IOException | RuntimeException | LinkageError failed) {
            // A LinkageError is an AI Assistant whose classes changed under the plugin: said once
            if (!hasFailed) {
                hasFailed = true;
                LOG.warn("Token Meter could not read this chat's status lines", failed);
            }
        }
    }

    private void show(Shown now) {
        view.show(now.rows(), now.isStale());
        isVisible.set(!now.rows().isEmpty());
    }

    /**
     * The snapshot of a session, read from its file.
     *
     * A file caught half written keeps the snapshot last read of that session.
     *
     * @return the snapshot; null for no session, or one that keeps none
     */
    private Snapshot snapshotOf(String sessionId) throws IOException {
        Optional<Path> file = sessionId == null ? Optional.empty() : folder.snapshotOf(sessionId);

        if (file.isEmpty() || !Files.isRegularFile(file.get())) {
            readOf = null;
            readText = null;
            read = null;

            return null;
        }

        String text = Files.readString(file.get());

        if (!sessionId.equals(readOf) || !text.equals(readText)) {
            Optional<Snapshot> parsed = Snapshot.parse(text).filter(snapshot -> snapshot.sessionId().equals(sessionId));

            if (parsed.isPresent() || !sessionId.equals(readOf)) {
                read = parsed.orElse(null);
            }

            readOf = sessionId;
            readText = text;
        }

        return read;
    }

    private static Shown shownOf(Snapshot snapshot) {
        if (snapshot == null) {
            return Shown.NOTHING;
        }

        boolean isStale = snapshot.isStaleAt(System.currentTimeMillis());

        if (snapshot.failure() != null) {
            Span why = new Span("Token Meter: " + snapshot.failure(), null, null, Set.of(Trait.DIM), null);

            return new Shown(List.of(new Row(List.of(List.of(why)))), isStale);
        }

        return new Shown(snapshot.rows(), isStale);
    }
}
