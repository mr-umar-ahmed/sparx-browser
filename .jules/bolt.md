## 2024-05-18 - Unnecessary Renders with Date states
**Learning:** Having an interval updating a `Date` object every minute at the root of a complex component (`SparxNewTab` / `ScrollMorphHero`) will cause the entire component to re-render every minute, even if nothing else has changed.
**Action:** Extract the time-dependent logic into a smaller component or use `useMemo` / avoid putting the `Date` state high up if the component is heavy.
