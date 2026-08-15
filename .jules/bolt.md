## 2024-05-18 - Unnecessary Renders with Date states
**Learning:** Having an interval updating a `Date` object every minute at the root of a complex component (`SparxNewTab` / `ScrollMorphHero`) will cause the entire component to re-render every minute, even if nothing else has changed.
**Action:** Extract the time-dependent logic into a smaller component or use `useMemo` / avoid putting the `Date` state high up if the component is heavy.
## 2024-05-19 - ReactMarkdown Input Lag in Chat
**Learning:** Re-rendering a complex map of expensive components (like \`ReactMarkdown\`) due to unrelated state changes (like typing in a Chat \`<textarea>\` connected to a top-level state) causes severe input lag. Every keystroke forces O(N) evaluations of heavy components.
**Action:** Always memoize repeating heavy components in lists (e.g. \`ChatMessage\` with \`React.memo\`) when they are rendered inside a component that has frequently updating state. Wrap dependencies like \`handleSaveToWorkspace\` in \`useCallback\` and move pure utilities like \`copyToClipboard\` outside the component to keep props stable.
## 2026-08-15 - Concurrency for executeJavaScript
**Learning:** Iterating sequentially over multiple webview elements and waiting for `executeJavaScript` causes severe O(N) bottlenecks in Electron.
**Action:** Use `Promise.all` to query or interact with independent webviews simultaneously, which dramatically speeds up cross-tab operations like /compare.
