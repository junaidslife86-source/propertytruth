# UX & Product Review

Based on code structure, Stitch design references (`stitch_propertytruth_due_diligence_workspace/`), and implemented components.

## First impression

**Strengths:**
- Clear value prop on home: "Know what you're buying before you offer"
- Evidence-over-opinion framing (`Evidence over opinion` label)
- Feature grid links to major cockpit tools
- Hero map background adds visual polish (`hero-map-background.tsx`)

**Weaknesses:**
- Deployed site may lag GitHub (user reported old copy on Vercel before push)
- README/marketing still mentions "confidence score" in places while UI shifted to "due diligence coverage"

## Navigation clarity

| Element | Assessment |
|---------|------------|
| Header: Search, Shortlist, Compare, Strata scan | Clear on desktop |
| Mobile header | Reduced links (Strata, List) + user menu |
| Sign in / account | In user menu — good |
| Property report actions | Many buttons (Shortlist, Compare, Inspect, Documents, Strata) — may overwhelm |
| No global "My workspace" | User must discover shortlist/compare separately |

## Dashboard / workspace usefulness

Property report (`/property/[id]`) acts as the main workspace with tabs — aligned with Stitch designs.

| Tab | Usefulness | Issue |
|-----|------------|-------|
| Overview | High | Coverage card + journey timeline |
| Issues | High | Risk signal grid |
| Map | Medium | Synthetic overlays reduce trust |
| Due diligence | High | Tracker + pre-offer checklist |
| Report | Low today | Paid preview disabled; AI insight is the only live piece |

## Information hierarchy

**Good:**
- Due diligence coverage prominent over raw scores
- Missing checks panel surfaces gaps
- Professional review gate sets expectations
- Disclaimers contextual (`ContextualDisclaimer`)

**Weak:**
- Demo data not always visible on property page reload
- Ownership cost simulator buried in diligence tab with generic defaults
- Compare/shortlist disconnected from account

## Visual design consistency

- Stitch tokens in `globals.css` (Manrope, Inter, JetBrains Mono, evidence colors)
- Some older components still use `stone-*` palette (inspection flow, parts of paid report)
- Mix of design systems in transition

## Empty states

| Screen | Empty state |
|--------|-------------|
| Compare | Basic CTA — exists |
| Shortlist | Basic — exists |
| Saved reports | **Missing** (no page) |
| Strata (processing) | Timeline — good |
| Inspection | N/A |

## Loading states

| Screen | Loading |
|--------|---------|
| Property report | `ReportPageSkeleton` — good |
| Strata | Spinner + timeline — good |
| Home scan | Button spinner — good |
| AI insight | Component-level — good |
| Account | Spinner — good |

## Error states

| Screen | Error UX |
|--------|----------|
| Home scan | `alert()` — poor |
| Strata upload | Toast — good |
| Account save | Toast with message — good (after fix) |
| Profile API empty body | Was cryptic JSON error — improved |

## Mobile responsiveness

- Inspection flow designed mobile-first (`inspection/new`, room tabs)
- Property report is content-heavy — tabs help but map/compare may be tight
- Address search supports large input size on home

**Unknown / needs verification:** Real device testing on iOS Safari.

## Trust & credibility

**Builds trust:**
- Upload consent panel
- Privacy + terms pages
- "Not professional advice" repeated appropriately
- Evidence quotes in strata findings
- Section coverage shows what was/wasn't in PDF

**Erodes trust:**
- Demo planning data without persistent labeling
- Map flood/bushfire circles not real boundaries
- "Stripe checkout coming soon" / disabled paid report
- Old deployed copy mismatch

## Confusion points

1. **Scan vs real data** — User cannot tell if DAs are real
2. **Sign-in benefit unclear** — What syncs vs what doesn't
3. **Strata vs property report** — Not linked in one workspace
4. **Inspection local-only** — Copy says "works offline" but unclear what cloud gives
5. **Compare limit 4** — No explanation when limit hit
6. **Document vault** — Appears to upload but stores metadata only locally

## Recommendations

| Recommendation | Impact | Effort | Why it matters |
|----------------|--------|--------|----------------|
| Persistent "Demo data" banner on all scan surfaces | High | Low | Trust / legal |
| Unify signed-in data (shortlist, DD, compare) to Firebase | High | Medium | Account value |
| Link strata findings to property report | High | Medium | Core product story |
| Replace `alert()` with toast on scan failure | Medium | Low | Polish |
| Real map overlays from GeoJSON | High | High | Credibility |
| "My properties" hub after sign-in | High | Medium | Retention |
| Simplify property action bar (group secondary actions) | Medium | Low | Cognitive load |
| Complete Stripe report or remove $29 teaser | Medium | Medium | Avoid bait-and-switch feel |
| Onboarding prompt after first scan | Medium | Low | Activation |
| Inspection → property link by address matching | Medium | Medium | Journey continuity |

## TODO

- [ ] Conduct 5-user usability test on first scan → offer checklist path
- [ ] Compare live Vercel UI against Stitch screenshots in `stitch_propertytruth_due_diligence_workspace/`
