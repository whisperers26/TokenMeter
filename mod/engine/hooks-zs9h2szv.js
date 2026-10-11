import {
  loadClaudeSettings,
  saveClaudeSettings,
  getExistingStatusLine,
  getWidget
} from "./ccstatusline-tgzfz3x2.js";

// src/utils/hooks.ts
var HOOK_TAG = "ccstatusline-managed";
var CCSTATUSLINE_HOOK_PATTERN = /ccstatusline.* --hook(?:\s|$)/;
function hasWidgetHooks(widget) {
  return Boolean(widget && "getHooks" in widget && typeof widget.getHooks === "function");
}
function isCcstatuslineManagedEntry(entry) {
  return entry._tag === HOOK_TAG;
}
function isLegacyCcstatuslineHookCommand(hook) {
  return CCSTATUSLINE_HOOK_PATTERN.test(hook.command);
}
function stripManagedHookEntry(entry) {
  if (isCcstatuslineManagedEntry(entry)) {
    return null;
  }
  if (!entry.hooks) {
    return entry;
  }
  const remainingHooks = entry.hooks.filter((hook) => !isLegacyCcstatuslineHookCommand(hook));
  if (remainingHooks.length === entry.hooks.length) {
    return entry;
  }
  if (remainingHooks.length === 0) {
    return null;
  }
  return {
    ...entry,
    hooks: remainingHooks
  };
}
function stripManagedHooks(hooks) {
  for (const event of Object.keys(hooks)) {
    hooks[event] = (hooks[event] ?? []).map(stripManagedHookEntry).filter((entry) => entry !== null);
    if (hooks[event].length === 0) {
      Reflect.deleteProperty(hooks, event);
    }
  }
}
function getActiveHookDefs(settings) {
  const seen = new Set;
  const defs = [];
  for (const line of settings.lines) {
    for (const item of line) {
      const widget = getWidget(item.type);
      if (!hasWidgetHooks(widget)) {
        continue;
      }
      for (const hook of widget.getHooks()) {
        const key = `${hook.event}:${hook.matcher ?? ""}`;
        if (!seen.has(key)) {
          seen.add(key);
          defs.push(hook);
        }
      }
    }
  }
  return defs;
}
async function syncWidgetHooks(settings) {
  const needed = getActiveHookDefs(settings);
  const claudeSettings = await loadClaudeSettings({ logErrors: false });
  const hooks = claudeSettings.hooks ?? {};
  stripManagedHooks(hooks);
  const statusCommand = await getExistingStatusLine();
  if (!statusCommand?.includes("ccstatusline")) {
    claudeSettings.hooks = Object.keys(hooks).length > 0 ? hooks : undefined;
    await saveClaudeSettings(claudeSettings);
    return;
  }
  const hookCommand = `${statusCommand} --hook`;
  for (const def of needed) {
    const entry = {
      _tag: HOOK_TAG,
      hooks: [{ type: "command", command: hookCommand }]
    };
    if (def.matcher) {
      entry.matcher = def.matcher;
    }
    const list = hooks[def.event] ??= [];
    list.push(entry);
  }
  claudeSettings.hooks = Object.keys(hooks).length > 0 ? hooks : undefined;
  await saveClaudeSettings(claudeSettings);
}
async function removeManagedHooks() {
  const claudeSettings = await loadClaudeSettings({ logErrors: false });
  const hooks = claudeSettings.hooks ?? {};
  stripManagedHooks(hooks);
  claudeSettings.hooks = Object.keys(hooks).length > 0 ? hooks : undefined;
  await saveClaudeSettings(claudeSettings);
}
export {
  removeManagedHooks,
  syncWidgetHooks
};
