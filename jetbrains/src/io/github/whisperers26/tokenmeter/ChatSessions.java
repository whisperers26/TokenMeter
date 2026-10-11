package io.github.whisperers26.tokenmeter;

import com.intellij.ml.llm.chat.session.FrontendSessionOverChatSessionKt;
import com.intellij.ml.llm.chat.session.SessionHistoryStorage;
import com.intellij.ml.llm.core.chat.session.ChatSession;

/**
 * What the plugin asks of JetBrains AI Assistant's own classes about a chat.
 *
 * None of it is documented, so an AI Assistant update can take it away: every
 * such call is made here, and a caller expects a {@link LinkageError}.
 */
final class ChatSessions {
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

        return SessionHistoryStorage.Companion.getInstance().agentSessionIdState(chatId).getValue();
    }
}
