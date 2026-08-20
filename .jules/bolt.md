## 2024-05-18 - Unnecessary Renders with Date states
**Learning:** Having an interval updating a `Date` object every minute at the root of a complex component (`SparxNewTab` / `ScrollMorphHero`) will cause the entire component to re-render every minute, even if nothing else has changed.
**Action:** Extract the time-dependent logic into a smaller component or use `useMemo` / avoid putting the `Date` state high up if the component is heavy.
## 2024-05-19 - ReactMarkdown Input Lag in Chat
**Learning:** Re-rendering a complex map of expensive components (like \`ReactMarkdown\`) due to unrelated state changes (like typing in a Chat \`<textarea>\` connected to a top-level state) causes severe input lag. Every keystroke forces O(N) evaluations of heavy components.
**Action:** Always memoize repeating heavy components in lists (e.g. \`ChatMessage\` with \`React.memo\`) when they are rendered inside a component that has frequently updating state. Wrap dependencies like \`handleSaveToWorkspace\` in \`useCallback\` and move pure utilities like \`copyToClipboard\` outside the component to keep props stable.
## 2024-05-20 - Sequential DOM interactions across multiple Webviews
**Learning:** In Electron, communicating with multiple independent `<webview>` tags sequentially using `for...of` and `await webview.executeJavaScript(...)` causes operations that could run concurrently to become unnecessarily linear (O(N)).
**Action:** When querying or extracting data from multiple independent webviews (e.g., getting text from all tabs), map the `executeJavaScript` promises into an array and use `Promise.all` to execute them concurrently, binding the time taken to the slowest operation instead of the sum of all operations.
## 2026-08-19 - Main Thread Blocking by Synchronous Disk I/O
**Learning:** Repeatedly calling `localStorage.setItem` along with `JSON.stringify` during high-frequency React state updates (like AI text streaming) runs synchronously and blocks the main thread, causing severe UI stuttering and input lag.
**Action:** Always debounce synchronous disk I/O operations and heavy serialization using a timer (e.g. `setTimeout`) inside `useEffect` hooks when the associated state updates rapidly.
## 2024-05-24 - [Avoid Inline `components` in `ReactMarkdown`]
**Learning:** Defining the `components` map inline as a prop to `ReactMarkdown` creates new function references on every render. During high-frequency state updates (like streaming AI responses character-by-character), this causes React to completely unmount and remount every single Markdown node in the DOM (h1, p, code, etc.) instead of updating them. This leads to massive layout thrashing, main thread blocking, and severe UI lag.
**Action:** Always extract the `ReactMarkdown` `components` map outside the component (if it has no dependencies) or memoize it with `useMemo` (if it relies on props/state) to ensure stable object and function references across renders.
