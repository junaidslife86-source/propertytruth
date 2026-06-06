---
name: PropertyTruth System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#191c1e'
  on-tertiary-container: '#818486'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  evidence-positive: '#10B981'
  evidence-verify: '#F59E0B'
  evidence-issue: '#EF4444'
  evidence-missing: '#94A3B8'
  background-primary: '#FFFFFF'
  background-secondary: '#F1F5F9'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 1.25rem
  gutter: 1rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
  stack-xl: 3rem
---

## Brand & Style

The design system is engineered for **PropertyTruth**, a high-fidelity due diligence platform that empowers property buyers through data transparency. The brand personality is rooted in **unbiased authority, surgical precision, and serene confidence**. It prioritizes "Evidence over Opinion," replacing traditional real estate sales pressure with a calm, analytical environment.

The visual style follows a **Modern / Premium Startup** aesthetic, drawing heavily from Apple’s HIG (Human Interface Guidelines). It utilizes high-contrast typography, generous whitespace (negative space), and subtle depth to create a sense of clarity and "breathing room." The interface avoids being overly clinical by using soft rounded corners and tactile micro-interactions that make the due diligence process feel manageable rather than overwhelming.

Key attributes:
- **Trustworthy:** Through structural alignment and consistent information density.
- **Calm:** Via a restrained palette and a "one-task-at-a-time" layout philosophy.
- **Evidence-Backed:** Using clear status indicators and data-rich cards that cite sources without cluttering the UI.

## Colors

The color strategy is designed to drive "Actionable Clarity." The primary palette is intentionally muted to allow the **Risk State** colors to communicate status effectively without creating visual fatigue.

- **Primary:** A deep, near-black navy used for text and core structural elements to establish authority.
- **Secondary (Accent):** A professional teal/muted blue used for interactive elements and primary actions.
- **Neutral:** A range of slate grays used for secondary text and borders to maintain a soft, premium feel.
- **Risk States:** These are the most critical functional colors. 
    - **Green** represents "Positive Evidence" (Verified status).
    - **Yellow** signifies "Verify / Review" (Inconclusive or pending).
    - **Red** marks "Known Issues" (High concern data points).
    - **Grey** indicates "Missing / Not Checked" (Incomplete coverage).

Avoid using Risk State colors for decorative purposes. They must strictly denote the status of due diligence data.

## Typography

This design system uses a dual-font approach to balance modern aesthetics with functional utility.

- **Headline Font (Manrope):** Chosen for its geometric clarity and premium "tech-forward" feel. Use this for all headers and property titles.
- **Body Font (Inter):** A highly legible sans-serif for descriptions, evidence logs, and report details. 
- **Label Font (JetBrains Mono):** Used sparingly for "Evidence Codes," timestamps, or technical data markers to provide a sense of "source data" authenticity.

**Hierarchy Rules:**
- Use `display-lg` for property addresses or main score dashboards.
- Use `label-caps` in uppercase for section sub-headers (e.g., "GEOGRAPHIC RISKS").
- Ensure large line-height (1.5x) for all body text to prevent information density fatigue.

## Layout & Spacing

The layout is **Mobile-First**, designed for use "in the field" during property inspections. It uses a **dynamic padding model** rather than a rigid grid.

- **Margins:** A consistent 20px (1.25rem) margin on all mobile screens ensures content doesn't feel cramped.
- **Vertical Rhythm:** A generous 8px base unit is used for all spacing. "Stack-lg" (32px) should be used between major logical sections to maintain "Apple-like" clarity.
- **Content Reflow:** On tablet/desktop, cards should expand to a maximum width of 768px and center, rather than stretching full-screen, to preserve readability of report data.
- **Safe Areas:** Ensure interactive elements (buttons/bottom nav) respect device-specific safe areas for effortless thumb navigation.

## Elevation & Depth

This design system uses **Tonal Layers** and **Ambient Shadows** to create hierarchy without visual noise.

- **Level 0 (Background):** Pure white `#FFFFFF` or off-white `#F1F5F9`.
- **Level 1 (Cards):** White surfaces with a very soft, diffused shadow (15% opacity, 20px blur, 4px offset). These house individual data points or evidence blocks.
- **Level 2 (Modals/Popovers):** Higher elevation with a backdrop blur (Glassmorphism effect) to keep the user grounded in the property context while viewing specific details.
- **Interactive State:** Buttons use a slight vertical offset (2px) and shadow increase on hover/tap to provide tactile feedback.
- **Dividers:** Use hairline borders (`1px`) in a very light grey (`#E2E8F0`) instead of shadows when separating content within a single card.

## Shapes

The shape language is **Rounded (0.5rem / 8px base)**. This softens the "serious" nature of due diligence data, making it more approachable.

- **Standard Elements (Buttons, Inputs, Small Cards):** 8px radius.
- **Large Container Cards:** 16px (`rounded-lg`) to create a distinct framing for property sections.
- **Status Chips / Progress Rings:** These should always be fully circular (Pill-shaped) to distinguish them from interactive buttons or data cards.
- **Active States:** Use a 2px "Focus Ring" for accessibility, matching the Primary or Secondary accent color.

## Components

### Buttons & Inputs
- **Primary Action:** Solid Teal (`secondary_color_hex`) with white text.
- **Secondary Action:** Ghost style (Transparent background with teal border).
- **Inputs:** Large, 56px height for mobile accessibility. Use "placeholder" text that asks a question (e.g., "Search address...").

### Status Chips (Pills)
- Used for "Risk States." Each chip contains an icon (Check, Warning, X, or Search) and a short text label.
- Backgrounds should be 10% opacity of the state color, with 100% opacity text for contrast.

### Progress Rings
- Used for "Due Diligence Coverage." 
- A circular stroke that fills as tasks are completed. Use a thick stroke (4pt+) to ensure it feels like a central dashboard element.

### Evidence Cards
- The core component of the app.
- Must include: Title, Evidence State (Color-coded), "Source" link, and "Known Issues" or "Coverage" summary.
- Avoid "Approved" or "Safe" language. Use "Data Verified" or "Coverage High."

### Bottom Navigation
- Fixed at the bottom. 4-5 icons (Summary, Risks, Map, Documents, Profile).
- Icons should be "Outline" in inactive state and "Solid" when active, using a 2pt stroke weight.

### Visual Dashboards
- Use simple bar charts or donut charts to visualize "Risk Distribution." 
- Never use complex, multi-axis charts; prioritize at-a-glance comprehension.