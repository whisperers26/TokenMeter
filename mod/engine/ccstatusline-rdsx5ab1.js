// src/utils/powerline-theme-index.ts
function assignPowerlineThemeSlots(widgets, startSlot = 0, isShown = () => true) {
  let previousVisibleWidget = null;
  let nextSlot = startSlot;
  const slots = widgets.map((widget, index) => {
    if (widget.type === "separator" || widget.type === "flex-separator") {
      previousVisibleWidget = null;
      return null;
    }
    if (!isShown(index)) {
      return null;
    }
    if (!previousVisibleWidget?.merge) {
      nextSlot++;
    }
    previousVisibleWidget = widget;
    return nextSlot - 1;
  });
  return { slots, nextSlot };
}
function countPowerlineThemeSlots(entries) {
  return assignPowerlineThemeSlots(entries.map((entry) => entry.widget), 0, (index) => Boolean(entries[index]?.content)).nextSlot;
}
function advanceGlobalPowerlineThemeIndex(currentIndex, entries) {
  return currentIndex + countPowerlineThemeSlots(entries);
}

// src/utils/separator-index.ts
function hasRenderedContent(widgetIndex, preRenderedWidgets) {
  return preRenderedWidgets ? Boolean(preRenderedWidgets[widgetIndex]?.content) : true;
}
function countSeparatorSlots(widgets, preRenderedWidgets) {
  let count = 0;
  let hasPreviousRenderableWidget = false;
  let previousRenderableWidgetMergesWithNext = false;
  for (let i = 0;i < widgets.length; i++) {
    const widget = widgets[i];
    if (!widget) {
      continue;
    }
    if (widget.type === "separator") {
      if (hasPreviousRenderableWidget) {
        previousRenderableWidgetMergesWithNext = false;
      }
      continue;
    }
    if (widget.type === "flex-separator") {
      hasPreviousRenderableWidget = false;
      previousRenderableWidgetMergesWithNext = false;
      continue;
    }
    if (!hasRenderedContent(i, preRenderedWidgets)) {
      continue;
    }
    if (hasPreviousRenderableWidget && !previousRenderableWidgetMergesWithNext) {
      count++;
    }
    hasPreviousRenderableWidget = true;
    previousRenderableWidgetMergesWithNext = Boolean(widget.merge);
  }
  return count;
}
function advanceGlobalSeparatorIndex(currentIndex, widgets, preRenderedWidgets) {
  return currentIndex + countSeparatorSlots(widgets, preRenderedWidgets);
}

export { assignPowerlineThemeSlots, advanceGlobalPowerlineThemeIndex, advanceGlobalSeparatorIndex };
