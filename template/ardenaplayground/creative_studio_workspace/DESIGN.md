---
name: Creative Studio Workspace
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3f4850'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#515f78'
  on-secondary: '#ffffff'
  secondary-container: '#d2e0fe'
  on-secondary-container: '#55637d'
  tertiary: '#825100'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#b9c7e4'
  on-secondary-fixed: '#0d1c32'
  on-secondary-fixed-variant: '#39475f'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 34px
    fontWeight: '800'
    lineHeight: 42px
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  code-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes an accessible, high-energy, and precision-engineered creative workspace tailored for creators of all ages who design games using visual block coding (Scratch) alongside an integrated AI Copilot. 

The aesthetic sits at the intersection of modern SaaS precision and playful, welcoming game-development studio tools. Drawing direct inspiration from dynamic geometric tech branding, the visual tone blends architectural deep navy foundations with energetic dynamic cyan arcs and creative amber accents. 

### Emotional Response & Principles
- **Empowered & Frictionless:** Novice creators feel guided rather than intimidated; experienced builders feel equipped with high-performance tools.
- **Tech-Forward yet Warm:** Combining structured dark indigo surfaces with luminous cyan interactive nodes, counterbalanced by soft lavender-tinted neutrals and warm amber highlights.
- **Precision Play:** Modular, canvas-first ergonomics with generous click targets, crisp subtle boundary lines, and tactile interaction surfaces.

## Colors

The color architecture is built around a light, high-focus canvas punctuated by authoritative navy structures and electric cyan catalysts.

### Functional Palette Mapping
- **Primary (`#0284C7` - Electric Cyan / Tech Blue):** Drives key action affordances, code execution handles, AI Copilot highlights, and active tab indicators. Extended with `#38BDF8` for luminous hover states and `#06B6D4` for visual coding loop connectors.
- **Secondary (`#0A192F` - Deep Tech Navy):** Represents high-contrast anchors, dark workspace headers, console outputs, primary typography, and prominent control bars. Deepened into `#1E1B4B` for AI dialogue panels.
- **Tertiary (`#F59E0B` - Creative Amber):** Reserved for gameplay event triggers, warning diagnostics, Scratch block variable categories, and user achievement badges.
- **Neutral (`#F8FAFC` - Soft Studio White):** Base workspace background. Layered with `#F1F5F9` for toolbars and borders (`#E2E8F0`), complemented by subtle lavender-tinted surfaces (`#F5F3FF`) used exclusively to demarcate AI Copilot assistive zones.
- **Semantic Feedback:**
  - Success / Run: `#10B981` (Emerald)
  - Error / Breakpoint: `#EF4444` (Crimson)
  - Copilot Sparkle / Prompt: `#8B5CF6` to `#06B6D4` gradient transitions.

## Typography

The type system blends the energetic warmth of **Plus Jakarta Sans** with the utilitarian precision of **Inter**.

- **Plus Jakarta Sans** provides open counters, distinct geometric letterforms, and an inviting personality, ideal for cross-generational game creators. It handles display, headlines, titles, and general prose.
- **Inter** handles high-density microcopy, parameter tags, AI chat metadata, coordinates (X/Y game stage offsets), and code block parameters where disambiguation is paramount.
- Letter tracking is kept neutral across body copy (`0em`), tightened slightly on display sizes (`-0.02em`) for punchy titles, and spaced outwards on uppercase badges and technical chips (`+0.04em`).

## Layout & Spacing

The workspace leverages a multi-panel responsive IDE grid that flexes between full viewport height during code-and-test sessions and structured stacked views on constrained devices.

### Workspace Architecture
- **Desktop (1280px+):** Tri-pane workstation:
  - Left dock (Scratch block toolbox & asset tree): Fixed width `280px` to `320px`.
  - Center canvas (Scripting workspace & node flow): Fluid flex growth.
  - Right split (Interactive game runtime stage on top, AI Copilot conversational dock below): Fixed width `400px` to `460px`.
- **Tablet (768px - 1279px):** Split-view with collapsable Copilot drawer. Runtime collapses into a floating or tabbed layout.
- **Mobile (<768px):** Single-column stacked mode with persistent bottom-sheet switcher between "Code", "Stage", and "AI Copilot". Outer margin drops to `1rem` (`space-md`).

The base rhythm follows an 8pt spatial increment, with a strict 4pt sub-grid for dense inspector palettes and tool configurations.

## Elevation & Depth

Visual hierarchy is maintained through high-clarity tonal contrast, ghost outlines, and soft ambient drop shadows tinted with navy hues rather than muddy greys.

### Tonal Stratification
- **Level 0 (Canvas Base):** Flat `#F8FAFC` with a subtle 24px dot-grid overlay (`#E2E8F0` at 60% opacity) for visual positioning feedback.
- **Level 1 (Cards, Floating Panels, Scratch Trays):** Pure White `#FFFFFF` backed by a 1px border of `#E2E8F0` and an ambient shadow: `0 4px 20px -4px rgba(10, 25, 47, 0.05)`.
- **Level 2 (Active Toolbars, Inspector Flyouts, Dropdown Menus):** Pure White with a 1px border of `#CBD5E1` and elevated shadow: `0 10px 25px -5px rgba(10, 25, 47, 0.08), 0 8px 10px -6px rgba(10, 25, 47, 0.04)`.
- **Level 3 (Modals, Overlays, Copilot Floating Assist):** White or tinted `#F5F3FF` backed by `0 20px 35px -10px rgba(10, 25, 47, 0.15)` and an ambient primary glow: `0 0 0 1px rgba(2, 132, 199, 0.15)`.
- **AI Assistive Glow:** Elements actively touched by the AI Copilot gain a vibrant ambient rim light: `0 0 0 2px #0284C7, 0 4px 16px rgba(2, 132, 199, 0.25)`.

## Shapes

The interface balances friendly approachability with software-grade clean geometry. Base elements utilize `roundedness: 2` (base `8px / 0.5rem`), transitioning into generous large card radii to soften complex tooling.

- **Micro Controls & Chips:** `8px` (`0.5rem`) for compact spatial efficiency.
- **Inputs & Standard Action Buttons:** `10px` to `12px` (`rounded-lg`) offering high affordance.
- **Editor Panels, Workspace Stages, Cards:** `16px` to `24px` (`rounded-xl` to `rounded-2xl`) creating distinct, digestible app regions.
- **Block Connectors & Scratch Tabs:** Customized interlocking sockets with smooth 4px rounded fillets.
- **Pill Badges (AI Status & Counters):** Full pill (`9999px`) for quick visual scanning.

## Components

### Buttons
- **Primary (Run / Action):** Solid Electric Cyan (`#0284C7`) background, white text, bold weight, with an inset subtle top highlight and smooth scale hover effect (`transform: translateY(-1px)`).
- **Secondary (Workspace Utility):** White container, 1px border `#E2E8F0`, deep navy text (`#0A192F`). On hover, border shifts to `#0284C7` with background `#F0F9FF`.
- **AI Copilot Button:** Deep Navy (`#0A192F`) to Indigo gradient with a subtle `#38BDF8` ring, paired with a cyan sparkle icon.
- **Danger (Stop / Reset):** Soft red-tinted surface `#FEF2F2`, border `#FECACA`, text `#DC2626`.

### Cards & Workspace Panels
- **Workspace Canvas Cards:** Pure white background, `16px` border radius, crisp `1px` border in `#E2E8F0`. Header regions feature a subtle hairline divider `#F1F5F9`.
- **Game Stage Card:** Encased in deep navy framing `#0A192F` with rounded top corners, offering clear visual separation for the runtime simulation viewport.
- **AI Copilot Message Card:** Soft lavender-tinted background (`#F5F3FF`), left-aligned border accent in `#0284C7`, and dark slate typography.

### Input Fields & Search Bars
- Background `#FFFFFF`, 1px solid border `#CBD5E1`, text `#0A192F`, placeholder `#94A3B8`. 
- Focus state triggers an immediate crisp transition to `border-color: #0284C7` with a cyan focus ring `0 0 0 3px rgba(2, 132, 199, 0.15)`.

### Chips & Badges
- **Category Chips (Events, Motion, Sound):** Colorful pill representations with high-contrast pastel background and saturated text.
- **Status Indicator Badges:** 24px height, uppercase `label-sm` font, featuring live pulse indicators (e.g., green dot for "Game Running", pulsating cyan ring for "Copilot Generating Code").

### Checkboxes & Switches
- **Checkboxes:** 18px square with `4px` corner radius. Checked state fills `#0284C7` with a crisp white geometric checkmark.
- **Toggles:** Smooth rounded capsule with smooth sliding thumb (`2px` inset padding), switching between `#E2E8F0` (inactive) and `#0284C7` (active).

### Scratch Code Block Wrappers & AI Suggestion Docks
- Code block containers mirror standard Scratch ergonomics but adopt this design system's refined color tokens (deep blue events, cyan sensing blocks, warm amber variable blocks).
- Copilot "Insert into Workspace" ghost overlays appear with a dotted `#0284C7` outline and a soft `#E0F2FE` backdrop to preview incoming AI-generated logic before committing.