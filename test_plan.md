1. **Identify the Bottleneck**: ReactMarkdown re-renders completely when its `components` prop receives a new inline object reference on every render, causing UI lag during streaming updates.
2. **Optimize `WorkspaceNote`**: Extract the static `components` object outside the `WorkspaceNote` component as it doesn't depend on component scope, avoiding recreation on every render.
3. **Optimize `ChatMessage`**: Wrap the `components` object inside a `useMemo` hook with dependencies `[T, onCopy]` since it relies on the theme and copy handler.
4. **Update Journal**: Add an entry to `.jules/bolt.md` documenting the learning about inline object references in `ReactMarkdown`'s `components` prop.
5. **Verify**: Ensure the app builds and lints successfully.
6. **Pre-commit Steps**: Call `pre_commit_instructions` and follow its instructions to complete testing, verification, and reviews.
7. **Submit PR**: Create a PR with the title '⚡ Bolt: [performance improvement]' detailing the optimization and its impact.
