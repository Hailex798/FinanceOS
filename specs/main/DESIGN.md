# Design System Strategy: High-Performance Financial Intelligence

## 1. Overview & Creative North Star: "The Obsidian Ledger"
The North Star for this design system is **"The Obsidian Ledger."** We are moving away from the "friendly fintech" aesthetic of rounded bubbles and bright pastels. Instead, we are building a high-performance, developer-grade environment that feels like a precision instrument.

The aesthetic is characterized by **"Deep Dimensionality"**—a dark, atmospheric space where data floats on layers of glass. We prioritize information density without clutter, using intentional asymmetry and high-contrast typography to guide the eye. This is not just a dashboard; it is an operating system for capital.

---

## 2. Colors & Tonal Depth
Our palette is rooted in a near-black blue-undertone universe. Color is never decorative; it is functional.

### The Color Logic
* **Primary (`#c0c1ff` / `#6366F1`):** Electric Indigo. Use this for action-orienting elements and primary brand touchpoints.
* **Secondary (`#4edea3`):** Positive Emerald. Reserved strictly for growth, profit, and "go" states.
* **Tertiary (`#ffb3ad`):** Losses Red. Reserved for deficits, alerts, and critical data points.

### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for sectioning. We define boundaries through **Surface Hierarchy**:
* **Base Layer:** `surface` (#121317) or `surface_dim`.
* **Sectioning:** Use `surface_container_low` for large structural blocks.
* **Interactive Blocks:** Use `surface_container` to create a lift from the background without a border.

### The "Glass & Gradient" Rule
To achieve the premium "Finance OS" look, all primary cards must utilize **Glassmorphism**:
* **Fill:** `surface_container_highest` at 40-60% opacity.
* **Backdrop Blur:** 12px to 20px.
* **The Signature Border:** A "Ghost Border" using `white` at 10% opacity (or `outline_variant` at 20%). This creates a sharp, crystalline edge that defines the shape against the dark background.

---

## 3. Typography: Precision Editorial
We use **Inter** exclusively. For a financial OS, the way we handle numbers is as important as the words.

* **Numerical Data:** All currency and data tables must use `font-variant-numeric: tabular-nums;`. This ensures columns of numbers align perfectly for easy scanning.
* **Display (`display-lg` to `display-sm`):** Reserved for portfolio totals. Use tight letter-spacing (-0.02em) and `headline-lg` for secondary metrics to create a hierarchy of "Importance at a Glance."
* **Labels (`label-md` to `label-sm`):** Use `on_surface_variant` (muted grey) in all-caps with 0.05em tracking for metadata. This mimics the feel of a high-end developer tool.
* **Hierarchy Note:** Contrast is key. Use `on_surface` (high-white) for values and `on_surface_variant` for labels. Never let them compete.

---

## 4. Elevation & Depth: Tonal Layering
In this system, depth is not simulated with heavy shadows, but through the **Layering Principle**.

* **Stacking Tier:**
1. **Level 0 (Background):** `surface_container_lowest` (#0d0e12).
2. **Level 1 (Main Content Area):** `surface` (#121317).
3. **Level 2 (Cards/Modules):** `surface_container_low` with a 10% white ghost border.
4. **Level 3 (Floating Modals/Tooltips):** `surface_container_high` with a 4% `on_surface` ambient shadow (Blur: 32px).

* **Ambient Shadows:** If an element must float, the shadow must be a tinted "glow" rather than a black smudge. Use a diffused shadow with the color of the background to simulate natural light occlusion in a dark space.

---

## 5. Components: Functional Primitives

### Buttons
* **Primary:** Fill with `primary` (`#c0c1ff`), text in `on_primary`. High-contrast, sharp 4px (`sm`) radius.
* **Secondary (Glass):** Semi-transparent `surface_variant` with a 10% white border.
* **States:** On hover, primary buttons should have a subtle outer glow (0px 0px 12px) using the `primary` color at 30% opacity.

### Input Fields
* **Minimalist State:** No background fill. Only a bottom border using `outline_variant`.
* **Active State:** Transitions to a `surface_container_high` fill with a subtle Indigo (`primary`) glow on the bottom border.
* **Typography:** Inputs use `body-md` with tabular figures for currency entries.

### Cards & Lists
* **The "No-Divider" Rule:** Vertical whitespace (Spacing Scale `8` or `12`) is the primary separator. If a list is dense, use a subtle background shift (`surface_container_low` vs `surface_container_highest`) on hover to define the row.
* **Asymmetry:** In the top bar or sidebar, avoid perfectly centered icons. Use a 16px inset to give the "Developer Tool" breathing room.

### Sidebar (64px Fixed)
* **Iconography:** 20px stroke icons. Active state uses `primary` color with a 2px vertical "pill" indicator on the far left.
* **Visual Weight:** The sidebar should be `surface_container_lowest` to "recede" into the screen, pushing the data-heavy main stage forward.

---

## 6. Do's and Don'ts

### Do
* **DO** use `tabular-nums` for every single piece of financial data.
* **DO** use "Ghost Borders" (10% opacity) to define cards.
* **DO** leverage the spacing scale to create "Editorial Air"—large margins (Spacing `16` or `20`) between major modules.
* **DO** use `secondary` (Emerald) and `tertiary` (Red) sparingly to highlight trends, not for UI decoration.

### Don't
* **DON'T** use 100% opaque borders to separate sections. Use tonal shifts instead.
* **DON'T** use standard "drop shadows." If it doesn't look like glass or a flat surface, it doesn't belong.
* **DON'T** use rounded corners larger than `0.5rem` (lg). This system thrives on the precision of tighter radii (`0.25rem`).
* **DON'T** clutter the icon-only sidebar with labels. Tooltips are the primary discovery mechanism for navigation.

AQ.Ab8RN6LZP7tNmAMu1iOoXc5W1_j6PtezbVxWx0pnFkVzIan0Ag