#!/usr/bin/env node
import {
  source_default,
  string,
  number,
  object,
  looseObject,
  union,
  preprocess,
  getVisibleText,
  updateColorMap,
  prefetchClaudeStatusIfNeeded,
  ZERO_COMPACTION_STATS,
  getPackageVersion,
  getTerminalWidth,
  resolveExecutable,
  sanitizeTerminalText,
  GIT_REVIEW_REFRESH_FLAG,
  refreshGitReviewCacheFromCli,
  buildConfigWarningBadge,
  countPowerlineStartCapSlots,
  preRenderAllWidgets,
  calculateMaxWidthsFromPreRendered,
  renderStatusLine,
  setUsageField,
  WEEKLY_MODEL_USAGE_BUCKETS,
  fetchUsageData,
  getTranscriptAnalysis,
  getWidgetSpeedWindowSeconds,
  isWidgetSpeedWindowEnabled,
  getConfigLoadError,
  initConfigPath,
  loadSettings,
  saveSettings
} from "./ccstatusline-tgzfz3x2.js";
import {
  advanceGlobalPowerlineThemeIndex,
  advanceGlobalSeparatorIndex
} from "./ccstatusline-rdsx5ab1.js";

// src/types/StatusJSON.ts
var CoercedNumberSchema = preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return value;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : value;
}, number());
var RateLimitPeriodSchema = object({
  used_percentage: CoercedNumberSchema.nullable().optional(),
  resets_at: CoercedNumberSchema.nullable().optional()
});
var StatusJSONSchema = looseObject({
  hook_event_name: string().optional(),
  session_id: string().optional(),
  transcript_path: string().optional(),
  cwd: string().optional(),
  model: union([
    string(),
    object({
      id: string().optional(),
      display_name: string().optional()
    })
  ]).optional(),
  workspace: object({
    current_dir: string().optional(),
    project_dir: string().optional()
  }).nullable().optional(),
  version: string().nullable().optional(),
  output_style: object({ name: string().optional() }).nullable().optional(),
  effort: object({ level: string().nullable().optional() }).nullable().optional(),
  cost: object({
    total_cost_usd: CoercedNumberSchema.optional(),
    total_duration_ms: CoercedNumberSchema.optional(),
    total_api_duration_ms: CoercedNumberSchema.optional(),
    total_lines_added: CoercedNumberSchema.optional(),
    total_lines_removed: CoercedNumberSchema.optional()
  }).nullable().optional(),
  context_window: object({
    context_window_size: CoercedNumberSchema.nullable().optional(),
    total_input_tokens: CoercedNumberSchema.nullable().optional(),
    total_output_tokens: CoercedNumberSchema.nullable().optional(),
    current_usage: union([
      CoercedNumberSchema,
      object({
        input_tokens: CoercedNumberSchema.optional(),
        output_tokens: CoercedNumberSchema.optional(),
        cache_creation_input_tokens: CoercedNumberSchema.optional(),
        cache_read_input_tokens: CoercedNumberSchema.optional()
      })
    ]).nullable().optional(),
    used_percentage: CoercedNumberSchema.nullable().optional(),
    remaining_percentage: CoercedNumberSchema.nullable().optional()
  }).nullable().optional(),
  vim: object({ mode: string().optional() }).nullable().optional(),
  worktree: object({
    name: string().optional(),
    path: string().optional(),
    branch: string().optional(),
    original_cwd: string().optional(),
    original_branch: string().optional()
  }).nullable().optional(),
  rate_limits: object({
    five_hour: RateLimitPeriodSchema.optional(),
    seven_day: RateLimitPeriodSchema.optional(),
    seven_day_sonnet: RateLimitPeriodSchema.nullable().optional(),
    seven_day_opus: RateLimitPeriodSchema.nullable().optional()
  }).nullable().optional()
});

// src/utils/hook-handler.ts
import * as fs2 from "node:fs";
import * as path2 from "node:path";

// src/utils/skills.ts
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
var EMPTY = { totalInvocations: 0, uniqueSkills: [], lastSkill: null };
function getSkillsDir() {
  return path.join(os.homedir(), ".cache", "ccstatusline", "skills");
}
var SAFE_SESSION_ID = /^[A-Za-z0-9_-]+$/;
function getSkillsFilePath(sessionId) {
  if (!SAFE_SESSION_ID.test(sessionId)) {
    return null;
  }
  return path.join(getSkillsDir(), `skills-${sessionId}.jsonl`);
}
function getSkillsMetrics(sessionId) {
  const filePath = getSkillsFilePath(sessionId);
  if (!filePath || !fs.existsSync(filePath)) {
    return EMPTY;
  }
  try {
    const invocations = fs.readFileSync(filePath, "utf-8").trim().split(`
`).filter((line) => line.trim()).map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter((e) => e !== null && typeof e.skill === "string" && typeof e.session_id === "string");
    if (invocations.length === 0) {
      return EMPTY;
    }
    const uniqueSkills = [];
    const seenSkills = new Set;
    for (let i = invocations.length - 1;i >= 0; i--) {
      const skill = invocations[i]?.skill;
      if (skill && !seenSkills.has(skill)) {
        seenSkills.add(skill);
        uniqueSkills.push(skill);
      }
    }
    return {
      totalInvocations: invocations.length,
      uniqueSkills,
      lastSkill: invocations[invocations.length - 1]?.skill ?? null
    };
  } catch {
    return EMPTY;
  }
}

// src/utils/hook-handler.ts
function handleHookInput(input) {
  if (!input) {
    return;
  }
  try {
    const data = JSON.parse(input);
    const sessionId = data.session_id;
    if (!sessionId) {
      return;
    }
    let skillName = "";
    if (data.hook_event_name === "PreToolUse" && data.tool_name === "Skill") {
      skillName = data.tool_input?.skill ?? "";
    } else if (data.hook_event_name === "UserPromptSubmit") {
      const match = /^\/([a-zA-Z0-9_:-]+)(?:\s|$)/.exec(data.prompt ?? "");
      if (match) {
        skillName = match[1] ?? "";
      }
    }
    if (!skillName) {
      return;
    }
    const filePath = getSkillsFilePath(sessionId);
    if (!filePath) {
      return;
    }
    fs2.mkdirSync(path2.dirname(filePath), { recursive: true });
    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      skill: skillName,
      source: data.hook_event_name
    });
    fs2.appendFileSync(filePath, entry + `
`);
  } catch {}
}

// src/utils/usage-prefetch.ts
var BASE_USAGE_WIDGET_TYPES = [
  "session-usage",
  "weekly-usage",
  "block-timer",
  "reset-timer",
  "weekly-reset-timer",
  "extra-usage-utilization",
  "extra-usage-remaining",
  "extra-usage-used",
  "extra-usage-daily-budget"
];
var USAGE_WIDGET_TYPES = new Set([
  ...BASE_USAGE_WIDGET_TYPES,
  ...WEEKLY_MODEL_USAGE_BUCKETS.map((bucket) => bucket.widgetType)
]);
var USAGE_DATA_FIELDS = [
  "sessionUsage",
  "sessionResetAt",
  "weeklyUsage",
  "weeklyResetAt",
  ...WEEKLY_MODEL_USAGE_BUCKETS.flatMap((bucket) => [bucket.usageField, bucket.resetField]),
  "extraUsageEnabled",
  "extraUsageLimit",
  "extraUsageUsed",
  "extraUsageUtilization",
  "extraUsageCurrency"
];
var EMPTY_USAGE_REQUIREMENTS = [];
var USAGE_WIDGET_REQUIREMENTS = {
  "session-usage": [{ field: "sessionUsage" }],
  "weekly-usage": [{ field: "weeklyUsage" }],
  ...Object.fromEntries(WEEKLY_MODEL_USAGE_BUCKETS.map((bucket) => [bucket.widgetType, [{ field: bucket.usageField }]])),
  "block-timer": [{ field: "sessionResetAt", suppressFetchError: true }],
  "reset-timer": [{ field: "sessionResetAt", suppressFetchError: true }],
  "weekly-reset-timer": [{ field: "weeklyResetAt", suppressFetchError: true }],
  "extra-usage-utilization": [
    { field: "extraUsageEnabled" },
    { field: "extraUsageUtilization" }
  ],
  "extra-usage-remaining": [
    { field: "extraUsageEnabled" },
    { field: "extraUsageLimit" },
    { field: "extraUsageUsed" }
  ],
  "extra-usage-used": [
    { field: "extraUsageEnabled" },
    { field: "extraUsageUsed" }
  ],
  "extra-usage-daily-budget": [
    { field: "extraUsageEnabled" },
    { field: "extraUsageLimit" },
    { field: "extraUsageUsed" }
  ]
};
var USAGE_CURSOR_REQUIREMENTS = {
  "session-usage": { field: "sessionResetAt" },
  "weekly-usage": { field: "weeklyResetAt" },
  ...Object.fromEntries(WEEKLY_MODEL_USAGE_BUCKETS.map((bucket) => [bucket.widgetType, { field: bucket.resetField, alternatives: ["weeklyResetAt"] }]))
};
function hasUsageDependentWidgets(lines) {
  return lines.some((line) => line.some((item) => USAGE_WIDGET_TYPES.has(item.type)));
}
function isUsageCursorEnabled(item) {
  return item.metadata?.cursor === "true";
}
function getUsageFieldRequirements(lines) {
  const requirements = [];
  for (const line of lines) {
    for (const item of line) {
      requirements.push(...USAGE_WIDGET_REQUIREMENTS[item.type] ?? EMPTY_USAGE_REQUIREMENTS);
      const cursorRequirement = USAGE_CURSOR_REQUIREMENTS[item.type];
      if (cursorRequirement && isUsageCursorEnabled(item)) {
        requirements.push(cursorRequirement);
      }
    }
  }
  return requirements;
}
function hasUsageDataField(data, field) {
  return data?.[field] !== undefined;
}
function isUsageRequirementSatisfied(data, requirement) {
  if (hasUsageDataField(data, requirement.field)) {
    return true;
  }
  return requirement.alternatives?.some((field) => hasUsageDataField(data, field)) ?? false;
}
function getMissingFetchRequirements(data, requirements) {
  const missing = new Set;
  let hasUnsuppressedMissingRequirement = false;
  for (const requirement of requirements) {
    if (!isUsageRequirementSatisfied(data, requirement)) {
      missing.add(requirement.field);
      if (!requirement.suppressFetchError) {
        hasUnsuppressedMissingRequirement = true;
      }
    }
  }
  return {
    fields: Array.from(missing),
    suppressFetchError: missing.size > 0 && !hasUnsuppressedMissingRequirement
  };
}
function hasAnyUsageDataField(data) {
  return USAGE_DATA_FIELDS.some((field) => data?.[field] !== undefined);
}
function pickDefinedUsageFields(data) {
  const picked = {};
  for (const field of USAGE_DATA_FIELDS) {
    const value = data?.[field];
    if (value !== undefined) {
      setUsageField(picked, field, value);
    }
  }
  return picked;
}
function mergeUsageData(rateLimitsData, apiData) {
  return {
    ...pickDefinedUsageFields(apiData),
    ...pickDefinedUsageFields(rateLimitsData),
    ...apiData.error ? { error: apiData.error } : {}
  };
}
function epochSecondsToIsoString(epochSeconds) {
  if (epochSeconds === null || epochSeconds === undefined || !Number.isFinite(epochSeconds)) {
    return;
  }
  return new Date(epochSeconds * 1000).toISOString();
}
function getRateLimitBucketUsage(bucket) {
  return bucket?.used_percentage ?? undefined;
}
function extractUsageDataFromRateLimits(rateLimits) {
  if (!rateLimits) {
    return null;
  }
  const rateLimitBuckets = rateLimits;
  const usageData = {
    sessionUsage: rateLimits.five_hour?.used_percentage ?? undefined,
    sessionResetAt: epochSecondsToIsoString(rateLimits.five_hour?.resets_at),
    weeklyUsage: rateLimits.seven_day?.used_percentage ?? undefined,
    weeklyResetAt: epochSecondsToIsoString(rateLimits.seven_day?.resets_at)
  };
  for (const bucket of WEEKLY_MODEL_USAGE_BUCKETS) {
    if (!bucket.apiBucketKey) {
      continue;
    }
    const rateLimitBucket = rateLimitBuckets[bucket.apiBucketKey];
    setUsageField(usageData, bucket.usageField, getRateLimitBucketUsage(rateLimitBucket));
    setUsageField(usageData, bucket.resetField, epochSecondsToIsoString(rateLimitBucket?.resets_at));
  }
  return hasAnyUsageDataField(usageData) ? usageData : null;
}
async function prefetchUsageDataIfNeeded(lines, data) {
  if (!hasUsageDependentWidgets(lines)) {
    return null;
  }
  const rateLimitsData = extractUsageDataFromRateLimits(data?.rate_limits);
  const requirements = getUsageFieldRequirements(lines);
  const missingRequirements = getMissingFetchRequirements(rateLimitsData, requirements);
  const missingFields = missingRequirements.fields;
  if (missingFields.length === 0) {
    return rateLimitsData;
  }
  const apiData = await fetchUsageData({ requiredFields: missingFields });
  if (apiData.error && missingRequirements.suppressFetchError) {
    return rateLimitsData;
  }
  return mergeUsageData(rateLimitsData, apiData);
}

// src/utils/windows-code-page.ts
import { execFileSync } from "node:child_process";
function ensureWindowsUtf8CodePage(platform = process.platform) {
  if (platform !== "win32") {
    return;
  }
  try {
    execFileSync(resolveExecutable("chcp.com"), ["65001"], { stdio: "ignore", windowsHide: true });
  } catch {}
}

// src/ccstatusline.ts
function hasSessionDurationInStatusJson(data) {
  const durationMs = data.cost?.total_duration_ms;
  return typeof durationMs === "number" && Number.isFinite(durationMs) && durationMs >= 0;
}
async function readStdin() {
  if (process.stdin.isTTY) {
    return null;
  }
  const chunks = [];
  try {
    if (typeof Bun !== "undefined") {
      const decoder = new TextDecoder;
      for await (const chunk of Bun.stdin.stream()) {
        chunks.push(decoder.decode(chunk));
      }
    } else {
      process.stdin.setEncoding("utf8");
      for await (const chunk of process.stdin) {
        chunks.push(chunk);
      }
    }
    return chunks.join("");
  } catch {
    return null;
  }
}
async function renderMultipleLines(data) {
  const settings = await loadSettings();
  const configError = getConfigLoadError();
  source_default.level = settings.colorLevel;
  updateColorMap();
  const lines = settings.lines;
  const hasSessionClock = lines.some((line) => line.some((item) => item.type === "session-clock"));
  const speedWidgetTypes = new Set(["output-speed", "input-speed", "total-speed"]);
  const hasSpeedItems = lines.some((line) => line.some((item) => speedWidgetTypes.has(item.type)));
  const hasCompactionWidget = lines.some((line) => line.some((item) => item.type === "compaction-counter"));
  const hasThinkingEffortWidget = lines.some((line) => line.some((item) => item.type === "thinking-effort"));
  const hasSessionNameWidget = lines.some((line) => line.some((item) => item.type === "session-name"));
  const needsTranscriptThinkingEffort = hasThinkingEffortWidget && (!data.effort || !("level" in data.effort));
  const requestedSpeedWindows = new Set;
  for (const line of lines) {
    for (const item of line) {
      if (speedWidgetTypes.has(item.type) && isWidgetSpeedWindowEnabled(item)) {
        requestedSpeedWindows.add(getWidgetSpeedWindowSeconds(item));
      }
    }
  }
  const transcriptAnalysisPromise = data.transcript_path ? getTranscriptAnalysis(data.transcript_path, {
    includeSessionDuration: hasSessionClock && !hasSessionDurationInStatusJson(data),
    includeSpeedMetrics: hasSpeedItems,
    includeSubagents: true,
    speedWindowSeconds: Array.from(requestedSpeedWindows),
    includeCompactionStats: hasCompactionWidget,
    includeThinkingEffort: needsTranscriptThinkingEffort,
    includeSessionName: hasSessionNameWidget
  }) : Promise.resolve(null);
  const [transcriptAnalysis, usageData, claudeStatusData] = await Promise.all([
    transcriptAnalysisPromise,
    prefetchUsageDataIfNeeded(lines, data),
    prefetchClaudeStatusIfNeeded(lines)
  ]);
  const tokenMetrics = transcriptAnalysis?.tokenMetrics ?? null;
  const sessionDuration = transcriptAnalysis?.sessionDuration ?? null;
  const speedMetrics = transcriptAnalysis?.speedMetricsCollection?.sessionAverage ?? null;
  const windowedSpeedMetrics = transcriptAnalysis?.speedMetricsCollection?.windowed ?? null;
  let skillsMetrics = null;
  if (data.session_id) {
    skillsMetrics = getSkillsMetrics(data.session_id);
  }
  const compactionData = hasCompactionWidget ? transcriptAnalysis?.compactionData ?? ZERO_COMPACTION_STATS : null;
  const context = {
    data,
    tokenMetrics,
    speedMetrics,
    windowedSpeedMetrics,
    usageData,
    claudeStatusData,
    sessionDuration,
    transcriptSessionName: hasSessionNameWidget ? transcriptAnalysis?.sessionName ?? null : undefined,
    transcriptThinkingEffort: needsTranscriptThinkingEffort ? transcriptAnalysis?.thinkingEffort ?? null : undefined,
    skillsMetrics,
    compactionData,
    terminalWidth: getTerminalWidth({
      sessionId: data.session_id,
      ttlSeconds: settings.terminalWidthCacheTtlSeconds
    }),
    isPreview: false,
    minimalist: settings.minimalistMode,
    gitCacheTtlSeconds: settings.gitCacheTtlSeconds,
    customCommandCacheTtlSeconds: settings.customCommandCacheTtlSeconds,
    gitReviewNeedsChecks: lines.some((line) => line.some((item) => item.type === "git-ci-status"))
  };
  const preRenderedLines = preRenderAllWidgets(lines, settings, context);
  const preCalculatedMaxWidths = calculateMaxWidthsFromPreRendered(preRenderedLines, settings);
  let globalSeparatorIndex = 0;
  let globalPowerlineThemeIndex = 0;
  let globalPowerlineStartCapIndex = 0;
  let configBadgePrepended = false;
  for (let i = 0;i < lines.length; i++) {
    const lineItems = lines[i];
    if (lineItems && lineItems.length > 0) {
      const preRenderedWidgets = preRenderedLines[i] ?? [];
      const lineContext = {
        ...context,
        lineIndex: i,
        globalSeparatorIndex,
        globalPowerlineThemeIndex,
        globalPowerlineStartCapIndex
      };
      let line = renderStatusLine(lineItems, settings, lineContext, preRenderedWidgets, preCalculatedMaxWidths);
      const strippedLine = getVisibleText(line).trim();
      if (strippedLine.length > 0) {
        if (configError && !configBadgePrepended) {
          line = `${buildConfigWarningBadge(settings.colorLevel)} | ${line}`;
          configBadgePrepended = true;
        }
        let outputLine = sanitizeTerminalText(line).replace(/ /g, " ");
        outputLine = "\x1B[0m" + outputLine;
        console.log(outputLine);
        globalSeparatorIndex = advanceGlobalSeparatorIndex(globalSeparatorIndex, lineItems, preRenderedWidgets);
        if (settings.powerline.enabled) {
          globalPowerlineStartCapIndex += countPowerlineStartCapSlots(lineItems, preRenderedWidgets);
        }
        if (settings.powerline.enabled && settings.powerline.continueThemeAcrossLines) {
          globalPowerlineThemeIndex = advanceGlobalPowerlineThemeIndex(globalPowerlineThemeIndex, preRenderedWidgets);
        }
      }
    }
  }
  if (configError && !configBadgePrepended) {
    console.log("\x1B[0m" + buildConfigWarningBadge(settings.colorLevel).replace(/ /g, " "));
  }
  if (settings.updatemessage?.message && settings.updatemessage.message.trim() !== "" && settings.updatemessage.remaining && settings.updatemessage.remaining > 0) {
    console.log(sanitizeTerminalText(settings.updatemessage.message));
    const newRemaining = settings.updatemessage.remaining - 1;
    if (newRemaining <= 0) {
      const { updatemessage, ...newSettings } = settings;
      await saveSettings(newSettings);
    } else {
      await saveSettings({
        ...settings,
        updatemessage: {
          ...settings.updatemessage,
          remaining: newRemaining
        }
      });
    }
  }
}
function parseConfigArg() {
  const idx = process.argv.indexOf("--config");
  if (idx === -1)
    return;
  const configPath = process.argv[idx + 1];
  if (!configPath || configPath.startsWith("--")) {
    console.error("--config requires a file path argument");
    process.exit(1);
  }
  process.argv.splice(idx, 2);
  return configPath;
}
async function handleHook() {
  const input = await readStdin();
  handleHookInput(input);
}
function handleGitReviewRefresh() {
  const flagIndex = process.argv.indexOf(GIT_REVIEW_REFRESH_FLAG);
  if (flagIndex === -1) {
    return false;
  }
  const cwd = process.argv[flagIndex + 1];
  const mode = process.argv[flagIndex + 2];
  const lockPath = process.argv[flagIndex + 3];
  if (!cwd || mode !== "metadata" && mode !== "checks" || !lockPath) {
    return true;
  }
  refreshGitReviewCacheFromCli(cwd, { includeChecks: mode === "checks" }, lockPath);
  return true;
}
async function main() {
  if (handleGitReviewRefresh()) {
    return;
  }
  if (process.argv.includes("--version")) {
    console.log(getPackageVersion());
    process.exit(0);
  }
  initConfigPath(parseConfigArg());
  if (process.argv.includes("--hook")) {
    await handleHook();
    return;
  }
  if (!process.stdin.isTTY) {
    ensureWindowsUtf8CodePage();
    const input = await readStdin();
    if (input && input.trim() !== "") {
      try {
        const result = StatusJSONSchema.safeParse(JSON.parse(input));
        if (!result.success) {
          console.error("Invalid status JSON format:", result.error.message);
          process.exit(1);
        }
        await renderMultipleLines(result.data);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        process.exit(1);
      }
    } else {
      console.error("No input received");
      process.exit(1);
    }
  } else {
    const settings = await loadSettings();
    if (settings.updatemessage) {
      const { updatemessage, ...newSettings } = settings;
      await saveSettings(newSettings);
    }
    const { runTUI } = await import("./index-wzd62dxf.js");
    runTUI();
  }
}
main();
