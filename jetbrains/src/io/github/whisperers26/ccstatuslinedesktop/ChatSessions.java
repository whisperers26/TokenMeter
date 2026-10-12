package io.github.whisperers26.ccstatuslinedesktop;

import com.intellij.ml.llm.chat.session.FrontendSessionOverChatSessionKt;
import com.intellij.ml.llm.chat.session.SessionHistoryStorage;
import com.intellij.ml.llm.core.chat.session.ChatSession;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import kotlinx.coroutines.flow.StateFlow;

/**
 * What the plugin asks of JetBrains AI Assistant's own classes about a chat.
 *
 * None of it is documented, so an AI Assistant update can take it away: every
 * such call is made here, and a caller expects a {@link LinkageError}.
 */
final class ChatSessions {
    /**
     * The id as AI Assistant holds it in memory, from the 2026.2 line on; null
     * in the line before, which reads it from the chat's stored record alone.
     *
     * Looked up by name, so that the one plugin fits both lines.
     */
    private static final Method ID_STATE = idStateOrNull();

    private ChatSessions() {
    }

    /**
     * The id of the agent session behind a chat, as AI Assistant keeps it to
     * resume the chat with. For a chat with Claude it is the Claude Code
     * session's own id, which is what the mod names the session's snapshot by.
     *
     * @return the id; null for a chat that has no agent session yet, or never will
     */
    static String agentSessionIdOf(ChatSession chat) {
        SessionHistoryStorage.PersistanceId chatId = FrontendSessionOverChatSessionKt.persistentId(chat);
        SessionHistoryStorage storage = SessionHistoryStorage.Companion.getInstance();

        if (ID_STATE == null) {
            return storage.getStoredAgentSessionId(chatId);
        }

        try {
            return (String) ((StateFlow<?>) ID_STATE.invoke(storage, chatId)).getValue();
        } catch (IllegalAccessException | InvocationTargetException failed) {
            throw new IllegalStateException(failed);
        }
    }

    private static Method idStateOrNull() {
        try {
            return SessionHistoryStorage.class.getMethod("agentSessionIdState", SessionHistoryStorage.PersistanceId.class);
        } catch (NoSuchMethodException older) {
            return null;
        }
    }
}
