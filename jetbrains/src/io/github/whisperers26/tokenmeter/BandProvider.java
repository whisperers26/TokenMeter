package io.github.whisperers26.tokenmeter;

import com.intellij.ml.llm.core.chat.session.ChatSession;
import com.intellij.ml.llm.core.chat.ui.chat.AIAssistantChatPanel;
import com.intellij.ml.llm.core.chat.ui.chat.AIAssistantChatPanelComponent;
import com.intellij.ml.llm.core.chat.ui.chat.AIAssistantChatPanelComponentProvider;
import com.intellij.openapi.project.Project;
import kotlinx.coroutines.CoroutineScope;

/**
 * Gives every AI Assistant chat its band. AI Assistant lays what a provider
 * returns out as a row of its own directly above the chat's input: the slot
 * its own file-changes strip uses.
 */
public final class BandProvider implements AIAssistantChatPanelComponentProvider {
    @Override
    public AIAssistantChatPanelComponent createChatPanelComponent(
        Project project,
        AIAssistantChatPanel chatPanel,
        ChatSession chatSession,
        CoroutineScope scope
    ) {
        ReaderLife.start();

        return new Band(chatPanel, chatSession, Folder.here(), scope);
    }
}
