/// <reference types="chrome" />

/**
 * MV3 background service worker. Two responsibilities, both minimal:
 *
 * 1. Ask Chrome to open the side panel when the toolbar action is clicked.
 *    `openPanelOnActionClick: true` is the modern, one-shot registration
 *    (Chrome 114+); the `onClicked` listener below is a defensive fallback
 *    for environments where setPanelBehavior throws or is unsupported.
 *
 * 2. That's it. No content scripts, no tabs/webNavigation, no message
 *    passing. All extension logic runs in the side panel page itself.
 *
 * NB: never import from other extension modules here — keeping this file
 * standalone means it's emitted as a single background.js chunk (see
 * vite.config.ts's `entryFileNames` pin). No runtime module URL to
 * resolve, no imports to fail in the service-worker context.
 */

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {
  // Older Chrome / unsupported — the onClicked fallback picks it up.
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.windowId === undefined) return;
  void chrome.sidePanel.open({ windowId: tab.windowId });
});
