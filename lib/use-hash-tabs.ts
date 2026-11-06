import { useSyncExternalStore, type KeyboardEvent } from "react";

// The URL hash is the only record of the selected tab. It is read on every render and rewritten on
// every selection, so a link such as /pricing#retailers opens that tab, and anything else that reads
// the hash (the nav's call to action) always agrees with the tabs.
function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
const currentHash = () => window.location.hash;
const serverHash = () => ""; // the server never sees the hash: render the first tab, then follow the URL

// The tab a key moves to. The arrows stop at the first and last tab instead of wrapping around.
function targetIndex(key: string, from: number, last: number): number | undefined {
  switch (key) {
    case "ArrowLeft":
      return Math.max(from - 1, 0);
    case "ArrowRight":
      return Math.min(from + 1, last);
    case "Home":
      return 0;
    case "End":
      return last;
    default:
      return undefined;
  }
}

/**
 * Accessible tabs (the WAI-ARIA tabs pattern) whose selection lives in the URL hash.
 *
 * `keys` lists the tabs in order. `#key` selects a tab; any other hash selects the first one.
 * Element ids are `${idPrefix}tab-${key}` and `${idPrefix}panel-${key}`, so give each tab set on a
 * page its own prefix.
 *
 * Spread `listProps(label)` on the tab row, `tabProps(key)` on each tab button and `panelProps(key)`
 * on each panel. Together they carry the roles, the links between tabs and panels, the roving
 * tabindex and the keyboard: ArrowLeft, ArrowRight, Home and End select a tab and focus it.
 * Selecting replaces the hash without adding a history entry and dispatches `hashchange`.
 */
export function useHashTabs<const K extends string>(keys: readonly [K, ...K[]], idPrefix = "") {
  const hash = useSyncExternalStore(subscribeToHash, currentHash, serverHash);
  const selected = keys.find((key) => hash === `#${key}`) ?? keys[0];
  const tabId = (key: K) => `${idPrefix}tab-${key}`;
  const panelId = (key: K) => `${idPrefix}panel-${key}`;

  function select(key: K) {
    const oldURL = window.location.href;
    window.history.replaceState(null, "", `#${key}`);
    // replaceState is silent: this event re-renders the tabs and tells every other hash reader
    window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL, newURL: window.location.href }));
  }

  return {
    selected,
    listProps: (label: string) => ({ role: "tablist", "aria-label": label }) as const,
    tabProps: (key: K) =>
      ({
        type: "button",
        role: "tab",
        id: tabId(key),
        "aria-selected": key === selected,
        "aria-controls": panelId(key),
        tabIndex: key === selected ? 0 : -1,
        onClick: () => select(key),
        onKeyDown: (event: KeyboardEvent) => {
          const target = targetIndex(event.key, keys.indexOf(key), keys.length - 1);
          if (target === undefined) return;
          event.preventDefault();
          select(keys[target]);
          document.getElementById(tabId(keys[target]))?.focus();
        },
      }) as const,
    panelProps: (key: K) =>
      ({ role: "tabpanel", id: panelId(key), "aria-labelledby": tabId(key), hidden: key !== selected }) as const,
  };
}
