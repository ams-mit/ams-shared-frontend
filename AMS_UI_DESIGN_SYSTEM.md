# AMS UI Design System — Color Scheme

## Status

**Approved color scheme:** Option 1 — Professional / Corporate

This is the required visual direction for the Apartment Management System (AMS).

**Design characteristics:** Reliable • Clean • Trustworthy

The color palette must be used consistently across the shared frontend and all AMS feature modules. Do not introduce alternative primary color palettes unless the project team explicitly approves a design-system change.

---

## 1. Core Color Tokens

| Token | Hex | Purpose |
|---|---|---|
| `--color-primary` | `#1E3A5F` | Main brand color, sidebar, primary navigation, major headings, primary UI elements |
| `--color-secondary` | `#4E6D8A` | Secondary UI elements, supporting backgrounds, secondary controls |
| `--color-accent` | `#2F8B8B` | Actions, highlights, active states, links, important interactive elements |
| `--color-background` | `#F5F7FA` | Main application/page background |
| `--color-text` | `#1F2937` | Primary body text, labels, headings, readable foreground content |

### CSS Variables

```css
:root {
  --color-primary: #1E3A5F;
  --color-secondary: #4E6D8A;
  --color-accent: #2F8B8B;
  --color-background: #F5F7FA;
  --color-text: #1F2937;
}
```

---

## 2. Visual Direction

The interface should feel:

- Professional
- Corporate
- Reliable
- Clean
- Trustworthy
- Structured
- Modern without looking flashy

Avoid designs that make the system feel playful, overly colorful, gaming-oriented, or luxury/premium.

The AMS is an administrative/business application, so clarity and usability take priority over visual decoration.

---

## 3. Primary Color — `#1E3A5F`

Use the dark navy as the main visual anchor.

### Recommended uses

- Main sidebar/navigation background
- AMS branding
- Primary page headings where appropriate
- Main navigation elements
- Selected/important structural UI
- Primary visual identity
- Important dashboard elements

### Example

```text
Sidebar: #1E3A5F
```

Do not use the primary color for every component. It should establish hierarchy rather than dominate the entire interface.

---

## 4. Secondary Color — `#4E6D8A`

Use the muted blue-gray as a supporting color.

### Recommended uses

- Secondary controls
- Supporting navigation states
- Secondary information
- Subtle UI elements
- Supporting borders or visual grouping where appropriate
- Less-important interactive elements

The secondary color should visually support the primary navy rather than compete with it.

---

## 5. Accent Color — `#2F8B8B`

Use teal for interaction and emphasis.

### Recommended uses

- Primary action buttons where appropriate
- Active/selected states
- Links
- Success/in-progress style indicators when semantically appropriate
- Important highlights
- Small visual emphasis
- Dashboard status elements

### Important rule

Do not turn the accent color into a second primary color. Use it selectively to draw attention to actions and important information.

Example:

```text
+ New Request  → #2F8B8B
```

---

## 6. Background — `#F5F7FA`

Use the very light gray as the main application background.

### Recommended uses

- Page background
- Dashboard background
- Main content area
- Empty space surrounding cards

Cards, forms, tables, and panels can use white (`#FFFFFF`) when needed for separation from the main background.

White is a supporting surface color, **not a replacement for the defined background token**.

---

## 7. Text — `#1F2937`

Use the dark charcoal color for readable text.

### Recommended uses

- Body text
- Form labels
- Table text
- Headings
- Navigation text when contrast requires it
- Descriptions

Avoid using pure black (`#000000`) as the default text color unless there is a specific accessibility or technical reason.

---

## 8. Component Guidance

### Sidebar

The sidebar should follow the approved visual direction:

- Background: `#1E3A5F`
- Active navigation item: use a lighter/contrasting treatment derived from the approved palette
- Navigation text: white or another sufficiently contrasting color
- Icons: white or a sufficiently contrasting neutral
- Accent may be used sparingly for active/highlight states

### Dashboard

Recommended structure:

- Page background: `#F5F7FA`
- Cards/surfaces: `#FFFFFF`
- Main text: `#1F2937`
- Primary metrics/headings: `#1E3A5F`
- Secondary information: `#4E6D8A`
- Important actions/highlights: `#2F8B8B`

### Buttons

Use clear hierarchy:

- **Primary action:** primarily `#2F8B8B` or the approved primary treatment depending on context
- **Secondary action:** `#4E6D8A` or neutral treatment
- **Destructive action:** use a semantic danger color, not the AMS accent

Do not use the AMS accent for destructive actions.

### Forms

- Background: `#FFFFFF`
- Label/text: `#1F2937`
- Input borders: neutral gray
- Focus state: `#2F8B8B`
- Primary submit action: `#2F8B8B`
- Validation messages: semantic colors appropriate to the message

### Tables

- Header: `#1E3A5F` or a visually consistent light treatment
- Body: white/light surface
- Text: `#1F2937`
- Links/actions: `#2F8B8B`
- Status indicators: semantic colors where necessary

---

## 9. Semantic Colors

The five approved colors are the **brand palette**, not a restriction against semantic feedback colors.

For system states such as:

- Success
- Warning
- Error
- Information

use clearly distinguishable semantic colors when required for usability and accessibility.

Do not force `#2F8B8B` to represent every success/warning/error state.

Semantic colors must remain visually compatible with the AMS palette and should be used consistently throughout the shared frontend.

---

## 10. Accessibility Rules

Color must never be the only way information is communicated.

For example:

- Status should use text + color.
- Validation should use text/icon + color.
- Active navigation should use visual state + sufficient contrast.
- Errors should not be communicated only through red coloring.

All text and interactive elements must maintain sufficient contrast against their backgrounds.

When a color combination does not provide sufficient contrast, change the foreground/background treatment rather than forcing the brand color.

---

## 11. Consistency Rules

### DO

- Use the five defined tokens consistently.
- Keep the interface professional and clean.
- Use navy as the main structural/brand color.
- Use teal selectively for interaction and emphasis.
- Use light gray for the overall application background.
- Use white surfaces/cards where separation is useful.
- Keep spacing, typography, forms, buttons, tables, and navigation visually consistent across modules.
- Reuse shared components instead of creating visually different versions for each feature.

### DON'T

- Do not introduce random colors for individual pages.
- Do not give each AMS module its own color theme.
- Do not use gradients as a default design treatment.
- Do not use bright neon colors.
- Do not use purple, orange, red, or green as additional brand colors.
- Do not redesign the sidebar differently for different modules.
- Do not create different button styles for each team.
- Do not use color decoration that reduces readability or hierarchy.

---

## 12. Shared Frontend Requirement

The AMS assignment requires a **single shared React application** with consistent design conventions across team-owned feature modules.

Therefore, Group 1's frontend should establish reusable design tokens/components that other groups can follow.

The design system should be treated as a shared contract:

```text
AMS Design System
        │
        ├── Navigation
        ├── Buttons
        ├── Forms
        ├── Tables
        ├── Cards
        ├── Modals
        ├── Alerts
        ├── Status indicators
        └── Typography / Spacing
                 │
                 ├── Group 1
                 ├── Group 2
                 ├── Group 3
                 └── Group 4
```

All feature modules should look like parts of **one Apartment Management System**, not four separate applications.

---

## 13. Reference Palette

| Color | Hex |
|---|---|
| Primary | `#1E3A5F` |
| Secondary | `#4E6D8A` |
| Accent | `#2F8B8B` |
| Background | `#F5F7FA` |
| Text | `#1F2937` |

### Short rule for agents

> **Use Option 1 — Professional / Corporate as the official AMS visual theme. Build the UI around `#1E3A5F`, `#4E6D8A`, `#2F8B8B`, `#F5F7FA`, and `#1F2937`. Keep the interface clean, professional, reliable, and consistent across all modules. Do not introduce alternative brand colors or per-module color themes.**

---

## Source

The palette is based on the approved **Professional / Corporate** option shown in the AMS UI color-scheme reference provided for this project.

The project assignment also requires a consistent component library and design system across the shared React frontend, with shared design conventions across the four AMS teams.
