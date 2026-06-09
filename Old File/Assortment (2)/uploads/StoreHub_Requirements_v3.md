# StoreHub — Floor & Decor Assortment Intelligence
## Detailed Product & Functional Requirements

**Client:** Floor & Decor  
**Vendor:** Impact Analytics  
**Application name:** StoreHub  
**Document version:** v3.0 — April 2026  
**Intended use:** Design system input — Claude design feedback  
**Status:** Active — supersedes v2.0

---

## Change Log from v2.0

| Change | Detail |
|--------|--------|
| Modules removed | Planogram Intelligence · Action Queue · Communications |
| Module added | Clustering (full spec — Stage 1) |
| Module updated | Hindsight Analytics — KPI groups, Tree Map, Bubble Graph, Graph Settings |
| Roles reduced | 3 active roles only: AMS · AMM · CM |
| User flows added | 5 detailed end-to-end flows across all modules |
| Navigation updated | Reflects all module changes |

---

## Active Roles

| Role | Abbreviation | Scope | Primary objective |
|------|-------------|-------|-------------------|
| Assortment Merchant Specialist | AMS | Store-level | Execute assortment decisions; surface local knowledge |
| Assortment Merchant Manager | AMM | Regional (district) | Review recommendations; oversee cluster performance across stores |
| Category Manager | CM | Network-wide | Generate recommendations; own assortment strategy centrally |

> DA (Data/Analytics) and ADMIN are backend/ops roles — they access configuration screens but do not use the main application flows described in this document.

---

## Data Sources

| Source | Contents | Access method |
|--------|----------|---------------|
| PLR App | Sales history, top sellers, basic forecasting | API / DB extract |
| Oracle Retail | System of record — transactions, inventory, orders | API / DB extract |
| Stibo PIM | Product catalog, SKU master, attributes | API / file export |
| Store Master | Store metadata — format, size, location, Pro/DIY ratio | Internal DB |

---

## Navigation Structure

```
StoreHub (Floor & Decor)
│
├── Home
│
├── INSIGHT
│   ├── District Intelligence
│   └── Store Deep Dive
│
├── ASSORTMENT INTELLIGENCE
│   ├── Hindsight Analytics        ← Stage 1 outputs
│   ├── Clustering                 ← Stage 1 — store cluster plans
│   ├── Peer Intelligence          ← Stage 2
│   └── Category Recommendations   ← Stage 3
│
├── COMMAND CENTER
│   └── AI Copilot
│
└── CONFIGURATION
    └── User Access Management
```

### Role → Navigation Access Matrix

| Module | AMS | AMM | CM |
|--------|-----|-----|----|
| Home | ✓ own store | ✓ region summary | ✓ network summary |
| District Intelligence | — | ✓ | ✓ |
| Store Deep Dive | own store only | all stores in region | all stores network |
| Hindsight Analytics | own store | region + network | full network |
| Clustering | view cluster assignment | view + annotate | create + edit + finalize |
| Peer Intelligence | own cluster (anonymised peers) | region + named stores | full network |
| Category Recommendations | view + acknowledge + annotate | review + accept/modify/escalate | create + publish |
| AI Copilot | ✓ | ✓ | ✓ |
| User Access Management | — | — | — |

---

## Home Dashboard — By Role

### AMS Home

**Layout:** Greeting header · KPI strip · Two-column body (Issues left, Action Queue right)

**Greeting header:**
- "Good morning, [Name]" with store ID, cluster badge, and Pro/DIY split indicator
- Last refreshed timestamp + manual refresh trigger

**KPI strip (4 cards):**

| KPI | Definition | Source |
|-----|-----------|--------|
| SKUs Managed | Total active SKUs in this store | Oracle Retail |
| Assortment Health Score | Composite: sell-through trend + winner coverage + loser exit pace (0–100) | Model |
| Trapped Capital | Inventory value of all Loser + Stale SKUs ($) | Oracle Retail |
| Tasks Today | Open action queue items for this store | Platform |

**Issues Needing Attention panel:**
- Ranked by revenue impact (not chronological)
- Assortment Risk card (equivalent to Inventory Risk in Store Smart): shows SKU count, trapped capital, and primary action CTA
- Network Win Opportunity card: top flagged SKU with estimated revenue impact
- Zombie SKU card: count of Stale SKUs and PLR cycles elapsed

**Action Queue (right panel):**
- Maximum 10 items (standard format stores ≤80,000 sq ft); 15 items (large format >80,000 sq ft)
- Each item: task title · due date · CTA button
- Items ranked by: overdue first, then by revenue impact
- Categories: Acknowledge Rec · Flag for Exit · Review Cluster · Add to Review List

---

### AMM Home

**Layout:** Greeting header · KPI strip · Two-column body (District summary left, Pending reviews right)

**KPI strip (4 cards):**

| KPI | Definition |
|-----|-----------|
| Stores Managed | Count of stores in managed region |
| Avg Assortment Health | Mean health score across all managed stores |
| Total Trapped Capital | Sum of trapped capital across region |
| Pending Reviews | Category recommendation sets awaiting AMM action |

**District summary panel:** Stores ranked by assortment health score descending; each row shows store ID, location, cluster type, health score, top issue, and a Review CTA.

**Pending reviews panel:** Rec sets published by CM that are within the AMM's 5-day review window, with days remaining and Accept All shortcut.

---

### CM Home

**Layout:** Greeting header · KPI strip · Two-column body (Recommendation pipeline left, Model metrics right)

**KPI strip (4 cards):**

| KPI | Definition |
|-----|-----------|
| Stores in Network | Total active F&D stores |
| Network Health Score | Mean assortment health across all stores |
| Total Trapped Capital | Network-wide trapped capital ($) |
| Active Rec Sets | Recommendation sets currently in review or execution |

**Recommendation pipeline panel:** Shows all active rec sets with status (Draft · Published · Under Review · Accepted · Executing) and counts at each stage.

**Model metrics panel:** Acceptance rate (% of recs accepted without modification) · Modification rate · Execution rate · Model vs Local outcome delta (when Stage 3 Phase B data is available).

---
---

# MODULE 1 — Hindsight Analytics

**Stage:** 1  
**Delivery:** Weeks 1–12  
**Goal:** Surface 3 years of performance data in a shared, interactive analytics layer accessible to all three roles.

---

## 1.1 Filter Bar

The filter bar appears at the top of the Hindsight Analytics module and persists across all sub-views (KPI Cards, Tree Map, Bubble Graph, SKU table, and all reports).

**Filter fields:**

| Filter | Type | Options |
|--------|------|---------|
| Business Unit | Multi-select pill | DTG · Pro · Other (F&D-specific) |
| Channel | Multi-select pill | DTG-Store · DTG-Web |
| Division | Multi-select pill | Tile · Wood/LVP · Natural Stone · Installation · Decorative |
| Year | Single-select | 2022 · 2023 · 2024 · 2025 |
| Season | Single-select | Based on year selected |
| Selling Period | Date range picker | Start date — End date |

**Behaviour:**
- All filters are applied simultaneously; all downstream views update on Apply
- Applied filters shown as labelled chips below the filter bar — individual chips are removable
- "All Filters" button opens full filter panel as a right-side drawer
- Filter state persists within the session; resets on logout

---

## 1.2 KPI Cards

Three grouped KPI card sections render below the filter bar. Each section has a coloured header label and contains three metric cards.

### Group 1 — Performance (green header)

| Metric | Definition | Format |
|--------|-----------|--------|
| Revenue | Net revenue for filtered period | $[value]M |
| Sales Units | Gross units sold | [value]M |
| Margin | Net margin $ for filtered period | $[value]M |

### Group 2 — Products (blue header)

| Metric | Definition | Format |
|--------|-----------|--------|
| Articles Sold | Distinct SKU IDs with at least 1 unit sold | [value]K |
| New Articles Sold | SKUs that entered the assortment during the filtered period | [value]K |
| Styles Sold | Distinct style groupings with at least 1 unit sold | [value]K |

### Group 3 — Inventory (amber header)

| Metric | Definition | Format |
|--------|-----------|--------|
| Avg Weekly Inv | Average units on hand per week across period | [value]K |
| Receipts Quantity | Total units received during period | [value]M |
| Receipts $ | Total cost of receipts during period | $[value]M |

**F&D reference values (2024, all categories, all stores):**  
Revenue: $224M · Sales Units: 2.2M · Margin: $166M · Articles Sold: 4.6K · New Articles: 2.6K · Styles Sold: 2.6K · Avg Weekly Inv: 754K · Receipts Qty: 1.5M · Receipts $: $223M

**UX requirements:**
- Cards render in three horizontal groups, each group visually bounded (border or background)
- Each metric card shows value (large, 24px) and label (small, muted)
- Cards are not interactive individually — they update only when filters change
- Group headers use semantic colour (green/blue/amber) that auto-adapts in dark mode

---

## 1.3 Visualizations Section

The Visualizations section renders below the KPI cards. It contains a section header, a tab/button selector for chart type, and the active chart canvas.

**Chart type selector:** Three buttons: **Tree Map** (default) · **Bubble Graph** · **Show More Graphs** (reserved for future charts; currently a placeholder).

A **Graph Settings** button/icon is always visible in the top-right of the Visualizations section; its content changes depending on the active chart type.

---

### 1.3.1 Tree Map

**Purpose:** Visual proportion map of category/division performance. Block size encodes a composite score of configurable metrics. Block colour encodes the division.

**Default view:**
- One block per Division (Tile · Wood/LVP · Natural Stone · Installation Materials · Decorative Accessories)
- Block size = composite score based on ST% and Margin% at equal 50/50 weighting (configurable via Graph Settings)
- Block colour = division-specific colour ramp (consistent across all charts in the module)
- Block label = Division name + key metric (e.g., "$98.4M · ST: 74%")
- Hover tooltip: Division name · Component tile count · Revenue · ST% · Margin%

**Drill-down behaviour:**
- Click any block → view re-renders at the next hierarchy level (Division → Category → Subcategory)
- Breadcrumb trail shown above the chart: e.g., "All Divisions → Tile → Porcelain"
- Back arrow or breadcrumb click returns to previous level

**Filter interaction:**
- "Selected Filters" label and applied filter chips shown above the tree map (e.g., "Division: 20 – Women's" equivalent → "Division: Tile")
- When division filter is applied, only selected divisions render; others are greyed out or hidden

**Graph Settings — Tree Map:**

Opens as a right-side panel or modal overlay.

Tabs inside the panel: **Filters · Metrics · Settings**

*Metrics tab (primary use case):*
- "Select Metrics" dropdown — choose which metrics contribute to block size scoring
- Once metrics are selected, a weightage table appears:

| Metric | Weightage slider | Value |
|--------|-----------------|-------|
| ST% | [slider 0–100] | 50 |
| Margin% | [slider 0–100] | 50 |

- Total must equal 100; system enforces this (adjusting one slider auto-adjusts the other proportionally)
- "Total: 100" shown below the sliders
- Cancel / Apply buttons
- Apply re-renders the tree map with the new weighting

*Settings tab:*
- Option to show/hide block labels
- Option to switch colour encoding (by division — default; by classification — Winner/Loser/Neutral)

---

### 1.3.2 Bubble Graph

**Purpose:** Quadrant scatter analysis of divisions/categories across two performance axes. Bubble size = a third metric.

**Layout:**
- Four labelled quadrants divided by dotted lines at the median of each axis
- Quadrant 1 (top-right): High Revenue · High Gross Margin — "Stars"
- Quadrant 2 (top-left): Low Revenue · High Gross Margin — "Hidden Gems"
- Quadrant 3 (bottom-left): Low Revenue · Low Gross Margin — "Exit Candidates"
- Quadrant 4 (bottom-right): High Revenue · Low Gross Margin — "Volume Drivers"
- Each bubble = one Division or Category (depending on filter level)
- Bubble size = Quantity Sold
- Bubble colour = Division colour ramp (same as Tree Map)

**Default axes:**
- X-axis: Revenue ($)
- Y-axis: Gross Margin $ (not %)

**Axis dropdowns (both configurable by user):**
- Revenue · Gross Margin $ · Units Sold · ST% · Avg Weekly Inv

**Hover tooltip per bubble:**
- Division/category name · Revenue · Gross Margin $ · Gross Margin % · Quantity Sold

**Graph Summary panel (right of chart):**
- Toggle: "Show in %" — switches all values to percentages
- Quadrant 1 summary: Revenue · GrossMargin$ · Quantity Sold totals for Q1 divisions
- Quadrant 3 summary: same for Q3 divisions
- Quadrant 2 and 4 are secondary and collapsible

**F&D reference bubble data (Tile division, 2024):**

| Division | Revenue | Gross Margin $ | Qty Sold | Quadrant |
|----------|---------|---------------|---------|---------|
| Tile | $98.4M | $67.0M | 1.2M | Q1 |
| Wood/LVP | $62.1M | $40.0M | 820K | Q1 |
| Installation | $38.7M | $30.2M | 1.5M | Q1/Q2 |
| Natural Stone | $19.2M | $11.5M | 180K | Q3 |
| Decorative | $5.8M | $2.9M | 44K | Q3 |

---

## 1.4 SKU Performance Table

Renders below the Visualizations section. This is the row-level data layer that allows users to drill from category-level visuals to individual SKU performance.

**Default view:** All SKUs in the filtered scope, sorted by Revenue descending.

**Columns:**

| Column | Description | Editable |
|--------|-----------|---------|
| SKU ID | Unified product key | No |
| Description | SKU name from Stibo PIM | No |
| Category / Subcategory | Hierarchy labels | No |
| Classification | Winner · Neutral · Loser · Stale (coloured badge) | No |
| ST% | Sell-through rate for filtered period | No |
| Revenue | Net revenue for filtered period | No |
| Trapped Capital | Inventory value if Loser or Stale; "—" if Winner/Neutral | No |
| Network Flag | Network Win – Not Carried · Network Loser – Slow Exit · Emerging Winner · Stale · blank | No |

**Row click behaviour:**
- Click any row → SKU Detail panel expands below the table (not a modal)
- SKU Detail panel shows: classification reasoning · trend sparkline · cluster peer comparison summary · PLR history · available actions

**Actions in SKU Detail panel:**
- Add to Review List (AMS/AMM)
- Flag for PLR Exit Review (AMS/AMM)
- Disagree + annotate (all roles)

**Table controls:**
- Column selector: show/hide columns; column order drag-and-drop
- Filters: Classification · Category · Network Flag · PLR cycle count
- Export to CSV / Excel
- Pagination: 50 rows per page default; configurable

---

## 1.5 Hindsight Reports

Five pre-built reports, accessible from a "Reports" tab within the Hindsight Analytics module.

| Report | Primary audience | Description |
|--------|-----------------|-------------|
| Store Scorecard | AMS | Own store's SKU performance — winners, losers, stale, trapped capital, assortment health score |
| Category Deep Dive | AMM | Full category performance across all stores in the region; cross-store variance heatmap |
| Network Win Opportunities | AMM + CM | SKUs winning in peer cluster stores not carried in the viewed store; ranked by est. revenue opportunity |
| Zombie SKU Report | AMS + AMM | Stale SKUs by store with duration (PLR cycles), capital trapped, and recommended exit timing |
| PLR Cycle Audit | AMM | Time-to-exit analysis — how many PLR cycles does a Loser persist before it's formally discontinued? |

**UX requirements across all reports:**
- Reports render in-platform (no download required to view)
- Every row is drillable: click → SKU Detail panel (same as in the main SKU table)
- All filters from the filter bar apply to report data
- Export to Excel/CSV from every report view
- Reports refresh weekly, aligned to PLR cycle

---
---

# MODULE 2 — Clustering

**Stage:** 1  
**Delivery:** Weeks 1–12 (parallel to Hindsight Analytics)  
**Goal:** Create behaviorally-meaningful store cluster plans that group F&D's 283+ stores into peer groups. Cluster assignments feed Stage 2 (Peer Intelligence) and Stage 3 (Category Recommendations).  
**Primary user:** CM (creates and manages); AMM (views and annotates); AMS (views own assignment only)

---

## 2.1 Clustering Dashboard

The Clustering Dashboard is the landing screen for the Clustering module. It lists all previously created cluster plans in a table.

**Table columns:**

| Field | Definition |
|-------|-----------|
| Cluster Name | User-defined name for the plan |
| Created By | Username who created the plan |
| Created On | Creation date |
| Updated On | Last modification date |
| Category | Primary category scope of the cluster plan (Tile · Wood/LVP · etc.) |
| Reference Season | Reference period used to guide clustering (2024 Fall/Winter · 2025 Spring/Summer) |
| Total Clusters | Number of clusters produced |
| Plan Step | Cluster Input · Finalize Cluster · Cluster Finalized |

**Dashboard actions (CM only):**

| Action | Behaviour |
|--------|-----------|
| Filters | Filter table by Category, Reference Season, Created By |
| Create Cluster | Opens the Create Cluster modal |
| Edit | Available when exactly one plan is selected; opens plan at its current step |
| Copy | Copies selected plan to a new plan (creates a new name + preserves all inputs) |
| Download | Downloads cluster plan as Excel (store × cluster assignment + KPIs) |
| Delete | Deletes one or multiple selected plans; requires confirmation pop-up |
| Column selector | Toggle which columns are visible in the dashboard table |

**Plan Step definitions:**
- Cluster Input: plan has been created but clustering has not yet been run
- Finalize Cluster: clustering has been run but the plan has not been saved/finalised
- Cluster Finalized: all steps complete; plan is saved and available for use in Stage 2 and 3

---

## 2.2 Create Cluster Plan

Accessible via the "Create Cluster" button on the Clustering Dashboard. Opens a modal with the following input fields:

| Field | Mandatory | Multi-select | Definition |
|-------|-----------|-------------|-----------|
| Cluster Name | Yes | No | Unique name for the plan (e.g., FD_Tile_2025_v3) |
| Category | Yes | No | Category scope (Tile · Wood/LVP · Natural Stone · Installation · Decorative) |
| Reference Season | Yes | Yes | Reference period(s) used to guide clustering — Spring/Summer or Fall/Winter |
| Weightage | No | Yes | % contribution of each reference season if multiple selected; must total 100%; add periods via "+" icon |

Clicking **Generate** saves the plan metadata and opens the Cluster Input Screen.

---

## 2.3 Cluster Input Screen

A two-step screen: (1) select the store group and attribute categories to cluster on; (2) review attribute significance scores and select specific attributes; (3) run clustering.

**Step progress indicator:** "1 — Cluster Input → 2 — Final Cluster" shown at top of screen.

**Plan context bar:** Displays Cluster Name · Category · Reference Season as read-only pills.

**Two tabs:**

### Tab A — IA Recommended Metrics (default)

**Store group selector:**
- Dropdown: "All Stores" (default) or any saved store group
- Store groups are pre-configured by DA team in User Access Management

**Attribute category checkboxes (all three checked by default):**

| Category | Description |
|----------|-----------|
| Performance Attributes | Sales-based signals from Oracle Retail / PLR |
| Store Attributes | Physical and demographic store properties from Store Master |
| Product Attributes | Category mix and style signals from Stibo PIM |

**"Run Cluster Group" button:** Executes the clustering algorithm and surfaces significance scores for all attributes in the selected categories.

**After running — Attribute selection table (three side-by-side panels):**

*Performance Attributes panel:*

| KPI Name | Significance Score | Rank | Select |
|----------|------------------|------|--------|
| ST% | 1.24 | 1 | ☑ |
| Revenue $ | 1.15 | 2 | ☑ |
| Margin% | 1.12 | 3 | ☐ |
| Units Sold | 0.98 | 4 | ☐ |
| AUR | 0.87 | 5 | ☐ |

*Store Attributes panel:*

| KPI Name | Select |
|----------|--------|
| Pro/DIY customer split | ☑ (PRIMARY — always pre-selected, cannot be deselected) |
| Store size (sq ft) | ☑ |
| Store format type | ☐ |
| Geographic region | ☐ |

*Product Attributes panel:*

| KPI Name | Select |
|----------|--------|
| Category revenue mix% | ☑ |
| Style preference (modern/traditional) | ☐ |
| Price tier mix | ☐ |

> Note: Pro/DIY customer split is designated PRIMARY for F&D. A store with 70%+ Pro and a store with 70%+ DIY in the same city must never appear in the same cluster, regardless of other attribute similarity. This constraint is hard-coded and not configurable.

**"Create Clusters" button:** Runs the final clustering pass with selected attributes and navigates to the Finalize Clusters screen.

### Tab B — Upload Clusters

- Allows CM/DA to upload an existing store-cluster mapping via Excel
- Drag-and-drop file zone or "Browse file" button
- File format: template provided (Store ID column · Cluster Name column)
- On successful upload → system validates file structure, shows a preview, and proceeds to Finalize Clusters on confirmation
- On error → inline error message with specific row/column reference

---

## 2.4 Finalize Clusters Screen

**Step progress indicator:** "1 — Cluster Input → **2 — Final Cluster**"

**Plan context bar:** Cluster Name · Category · Reference Season (read-only)

The Finalize screen has three sections:

### 2.4.1 Attribute Grades Visualization

A 100% stacked bar chart on the left side of the screen.

- Each bar = one cluster
- Each segment = one product attribute value (e.g., Tile Material: Porcelain vs Ceramic vs Stone)
- Users can change the attribute shown via an "Attribute" dropdown above the chart
- "Cluster Bucket" dropdown controls how many clusters are shown (default = IA-recommended number, typically 3–7; range 2–8)

### 2.4.2 Performance Clusters Scatter Plot

A scatter plot on the right side of the screen.

- Each dot = one store
- Dot colour = cluster assignment
- X-axis and Y-axis: configurable dropdowns (ST% · Revenue $ · Units Sold · Pro/DIY split · Store size)
- Cluster count dropdown: same as above (2–8)
- Hovering a dot shows: Store ID · Location · Cluster assignment · key KPIs

### 2.4.3 Cluster Breakdown Table

Renders below the two visualizations. Shows KPIs summarised at cluster level; each row is expandable to show individual stores.

**Default columns:**

| Column | Description |
|--------|-----------|
| Cluster | System-generated cluster ID (A1, B2, etc.) — expandable to store rows |
| Stores | Number of stores in this cluster |
| Display Cluster Name | Editable free-text field — user can rename the cluster |
| Pro/DIY Avg | Mean Pro/DIY split across stores in cluster |
| ST% | Average sell-through across cluster |
| Revenue $ | Total revenue |
| AUR | Average unit retail |
| Trapped Capital | Total trapped capital |

**F&D reference cluster output (Tile, 2025):**

| Cluster | Stores | Display Name | Pro/DIY Avg | ST% |
|---------|--------|-------------|-------------|-----|
| A1 | 84 | Pro-dominant | 72 / 28 | 76% |
| A2 | 71 | DIY-dominant | 24 / 76 | 68% |
| B1 | 58 | Mixed High Volume | 48 / 52 | 72% |
| B2 | 42 | Mixed Standard | 45 / 55 | 64% |
| C1 | 28 | Large Format | 51 / 49 | 78% |

**Transfer stores between clusters:**
- Click on any cluster row → "Transfer Stores" popup opens
- Popup shows: selected cluster's stores (left table) · other clusters with their stores (right table, selectable via dropdown)
- Checkboxes select stores; "Add" / "Remove" buttons move stores between clusters
- "Save" button confirms changes; changes are reflected immediately in the breakdown table and charts

**Saving a cluster plan:**
- "Save" button at bottom of the Finalize screen
- Confirmation pop-up: "[Plan Name] saved successfully!" with OK button
- On OK: redirected to Clustering Dashboard; plan status changes to "Cluster Finalized"
- Note: a cluster plan linked to a Category Recommendation set cannot be edited directly. To edit, the user must copy the plan, make changes, delete the linked rec set, and create a new one with the updated cluster plan.

---

## 2.5 New Store Management

When a new store opens or a new category scope is added, the corresponding cluster mapping must be updated.

- New store → DA team maps to a "sister store" (most behaviourally similar existing store) using the Sister Store Mapping template
- Sister store mapping is uploaded via User Access Management
- Mapping is automatically applied in Peer Intelligence and Category Recommendations
- CM is notified via an in-platform alert when a new store mapping is pending review

---
---

# MODULE 3 — Peer Intelligence

**Stage:** 2  
**Delivery:** Weeks 13–28  
**Goal:** Give every store and merchant a live view of what comparable cluster peers carry, win with, and are missing. Build transparency and trust before decision rights shift.

---

## 3.1 Module Entry Point

Navigation: Assortment Intelligence → Peer Intelligence

Default landing view for AMS: My Store peer comparison (category-first)  
Default landing view for AMM: District overview with per-store drill

---

## 3.2 My Store View (AMS)

**Header:** Store name · Cluster assignment badge · Pro/DIY split · Store format · Last refreshed

**Assortment Health Score:** Composite score (0–100). Clicking the score opens a breakdown popup:
- Sell-through trend (weighted 40%)
- Winner coverage vs cluster (weighted 35%)
- Loser exit pace vs cluster avg (weighted 25%)

**Category-first entry:** User selects a category from a dropdown. All views update to reflect the selected category.

**Peer comparison table:**

| Metric | My Store | Cluster Avg | Cluster Top Quartile |
|--------|----------|-------------|----------------------|
| # SKUs carried | value | value | value |
| Avg sell-through% | value | value | value |
| # Winners carried | value | value | value |
| Network Winners NOT carried | value | — | — |
| Losers still carried | value | value | — |
| Trapped capital | value | value | — |

- Peer data shown as cluster aggregate only at AMS level — individual peer store names are never revealed
- AMM level: individual store names visible within their managed region

**Network Winners Not Carried drill-down:** Click the value → SKU list expands below the table. Each row shows SKU ID · Description · Peer ST% · % of peers carrying · Add to Review List button.

**Losers Still Carried drill-down:** Click the value → SKU list with: SKU ID · Description · Time in Loser status (PLR cycles) · Trapped capital · Flag for Exit button.

---

## 3.3 SKU Opportunity Explorer

A searchable, filterable catalogue of all SKUs in the store's category with full peer context.

**SKU flag types:**

| Flag | Icon colour | Trigger |
|------|-------------|---------|
| Network Win — Not Carried | Green | Winner in ≥30% of cluster peers; absent in this store |
| Network Loser — Still Carried | Red | Loser in ≥30% of cluster peers; still active in this store |
| Emerging Winner | Amber | Significant upward trend in peers over trailing 4 weeks |
| Stale | Grey | Minimal velocity; long duration; zombie candidate |

**Per-SKU data:**
- Carrying status in this store
- Current ST% and trend (↑ ↓ →)
- Cluster: % of peers carrying · avg ST% among carriers
- Network: % of all stores carrying · avg network ST%
- Pro/DIY performance split (where data available)
- Active flag type
- Confidence score (0–100) — clicking shows plain-language breakdown

**Review List:**
- AMS and AMM can add any SKU to a personal Review List
- Review List is shareable with AMM via one-click share
- CM can view all active Review Lists across the network from the Category Recommendations module

---

## 3.4 Feedback & Annotation Layer

On any SKU flag or peer comparison signal, any role can:
- Add a free-text comment explaining local context
- Click "Disagree" — requires a predefined reason plus optional free text:

| Reason | Description |
|--------|-----------|
| Local customer preference | Store's customer mix makes this signal inapplicable |
| Pending supplier change | Supplier transition underway — signal is temporary |
| Already actioned | Decision already made; system hasn't updated |
| Other | Free text required |

All disagreements are logged (timestamp · role · store · SKU · reason) and reviewed bi-weekly by DA team. Disagreements do not auto-propagate into the clustering model — DA team decides what, if anything, triggers a model update (human in the loop).

---

## 3.5 Network Learning Engine

**Winner signal propagation:** When a SKU achieves Winner status in ≥3 stores within a cluster (configurable), generate a Cluster Alert for all stores in that cluster not carrying it.

**Loser signal propagation:** When a SKU reaches Loser status in ≥5 stores network-wide (configurable), generate a Network Loser Alert for all stores still carrying it.

**Emerging Winner detection:** SKU with statistically significant upward trend over trailing 4-week and 8-week windows + current ST% above cluster median → flag as Emerging Winner. Every Emerging Winner flag includes a sparkline trend chart visible alongside the flag (not behind a second click).

**Alert volume management:**
- Standard format stores (50,000–80,000 sq ft): maximum 10 alerts per week
- Large format stores (>80,000 sq ft): maximum 15 alerts per week
- Alerts ranked by estimated revenue impact; lower-ranked alerts roll to next week
- All thresholds configurable by ADMIN

---
---

# MODULE 4 — Category Recommendations

**Stage:** 3  
**Delivery:** Weeks 29–44  
**Goal:** Generate centralized CARRY / DROP / ADD recommendations. Prove the model on pilot categories. Scale the shift from local to central decision-making.

---

## 4.1 Recommendation Generation (CM)

**Entry:** CM selects pilot category + target cluster(s) from a creation form.

**Inputs:**

| Field | Options |
|-------|---------|
| Category | Tile · Wood/LVP · Natural Stone · Installation · Decorative |
| Target cluster(s) | Any finalized cluster plan's cluster names |
| PLR cycle | Next available cycle date from PLR App |

Clicking **Generate Recommendations** triggers the engine and produces a CARRY / DROP / ADD list for all stores in the selected cluster(s).

**Recommendation inputs (engine):**

| Input | Source |
|-------|--------|
| SKU classification | Stage 1 Hindsight model (Winner / Neutral / Loser / Stale) |
| Cluster peer performance | Peer Intelligence engine |
| Pro/DIY split | Store Master + Oracle Retail |
| Space constraints | Store Master (max SKUs per category per format tier) |
| Supplier constraints | Manual input / PIM |
| AMS/AMM annotations | Feedback layer from Stage 2 |
| PLR cycle timing | PLR App |

**Confidence score per recommendation:** 0–100. Displayed to all roles. Clicking opens a plain-language explanation of the top contributing factors.

---

## 4.2 80/20 Decision Framework (Phase A)

- 80% of SKUs in pilot categories receive a central recommendation (CARRY / DROP / ADD)
- 20% of SKUs are flagged as **AMM/AMS Discretion** — shown with a "Your call" badge

**Criteria for AMM/AMS Discretion flag:**

| Criterion | Reason |
|-----------|--------|
| Conflicting signals | Winner in some cluster peers, Loser in others |
| Recent annotation | AMM has added local context in the annotation layer |
| High-variance subcategory | Style-driven subcategories (e.g., decorative tile accents) |
| Insufficient data | SKU with < 8 weeks of sell-through history |

**Pro SKU DROP protection:**
- A Pro SKU requires persistent Loser status for ≥3 consecutive PLR cycles before a DROP recommendation is generated
- Rationale: dropping a Pro SKU breaks installer trust that compounds over years

**ADD space constraint:**
- ADD recommendations are rank-ordered by expected sell-through
- System never recommends more ADDs than available assortment slots in the store's format tier

---

## 4.3 Recommendation Review Workflow

A 4-step structured workflow governs every recommendation set.

### Step 1 — CM generates and publishes

1. CM generates the recommendation list (as above)
2. CM reviews the list; can override individual SKU recommendations — mandatory annotation required for each override
3. CM clicks **Publish to AMMs** → AMM review window opens for all AMMs whose region contains in-scope stores

### Step 2 — AMM review window

- Default: 5 business days (ADMIN-configurable)
- AMM sees all recommendations for stores in their region

**Per-recommendation actions:**

| Action | Behaviour | Notes |
|--------|-----------|-------|
| Accept | Agrees with recommendation | Default — inaction = acceptance when window closes |
| Modify | Changes CARRY→DROP, DROP→CARRY, ADD→CARRY, etc. | Mandatory reason from predefined list + optional free text |
| Escalate | Flags for CM discussion | Recommendation is paused; CM and AMM resolve together |

**Modify reason options:**
- Local supplier constraint
- Recent local performance data not yet in system
- Customer mix exception
- Strategic local hold
- Other (free text required)

### Step 3 — AMS acknowledgment

- AMS sees final approved recommendations for their store only
- Can add execution notes (e.g., "Supplier lead time 6 weeks — timing adjustment needed")
- Cannot reverse recommendations — escalation path only

### Step 4 — Execution tracking

- Each recommendation tracked: Pending → Accepted → Executed OR Accepted – Not Executed
- Stores with high "accepted but not executed" rates flagged to CM for follow-up
- Execution status feeds the Phase B outcome measurement model

---

## 4.4 Recommendation List UX

**Recommendation row elements:**

| Element | Description |
|---------|-----------|
| Rec type badge | CARRY (blue) · DROP (red) · ADD (green) · DISC (grey, for Discretion) |
| SKU ID | Linked to SKU Detail drawer |
| Description | SKU name |
| Rationale | One-line summary: e.g., "Winner in 68% peers · Pro-optimised · 3 store spaces available" |
| Confidence score | 0–100, coloured by band (≥80 = green · 50–79 = amber · <50 = red) |
| Actions | Accept · Modify · Escalate (role-dependent) |

**Table controls:**
- Filter by rec type (CARRY / DROP / ADD / DISC)
- Filter by confidence band
- Accept All button (applies Accept to all non-DISC rows)
- Export to Excel

---

## 4.5 Outcome Measurement — Prove the Model (Phase B)

**Tag every pilot decision** as: centrally recommended vs. locally driven (AMM-modified).

**Three comparison groups:**

| Group | Description |
|-------|-----------|
| Central — Accepted & Executed | Recommendations followed without modification |
| Local Override | Recommendations modified by AMM; AMM's version executed |
| Control | Equivalent stores in same cluster not in the pilot |

**Metrics tracked per group:**
- Sell-through rate: 4-week, 8-week, PLR-cycle rolling
- Revenue per SKU
- Trapped capital change
- Time-to-exit on Losers

**Model vs. Local report:**
- Available from the CM Home dashboard
- Shareable with AMMs — shows where central guidance outperformed local override and vice versa
- Modification rate tracked and trended over time

---
---

# MODULE 5 — AI Copilot

**Availability:** All three roles  
**Entry:** Command Center → AI Copilot

**Purpose:** Natural language interface for assortment questions. The Copilot has access to the user's role-scoped data — an AMS sees only their store's data in responses; an AMM sees their region; CM sees the full network.

**Suggested prompts displayed on first load (role-specific):**

*AMS:* "Which SKUs should I prioritise before the next PLR cycle?" · "What's my biggest Network Win opportunity in Tile?"

*AMM:* "Which stores in my region have the highest trapped capital?" · "Which cluster is performing best this season?"

*CM:* "Show me the top 10 Network Win SKUs across the network." · "Which categories have the highest cross-store variance?"

**Behaviour:**
- Responses cite the data source and timestamp of the underlying data
- If the answer requires calculation or model inference, a confidence indicator is shown
- Users can click any SKU or store mentioned in a response to open the full detail view
- Conversation history is not persisted across sessions

---
---

# User Flows

Five primary happy-path flows, covering all modules and all three roles.

---

## Flow 1 — Network Win Discovery (AMS)

**Persona:** AMS (Jane Doe, Store #1247, Alpharetta GA)  
**Starting point:** Home dashboard  
**Goal:** Identify and action a high-value Network Win SKU opportunity before the next PLR cycle

| Step | Module | Action | Outcome |
|------|--------|--------|---------|
| 1 | Home | AMS lands on Home and sees a critical alert: "SKU FD-18842 — Network Win Opportunity · Est. +$4.2K" | Alert is visible in Issues Needing Attention panel |
| 2 | Hindsight Analytics | AMS navigates to Hindsight. Applies filter: Division = Tile, Year = 2024, Season = Fall. Reviews Tree Map — Tile block is largest but AMS notices the Performance KPI panel shows ST% below cluster top quartile | Tree Map renders. KPI group cards show $98.4M revenue, 74% ST% |
| 3 | Hindsight Analytics | AMS clicks the Tile block → drills to Porcelain subcategory. Clicks FD-18842 row in the SKU table. SKU Detail panel expands — shows 79% peer ST%, winner in 68% of cluster peers, estimated +$4.2K | SKU Detail panel visible below table |
| 4 | Peer Intelligence | AMS navigates to Peer Intelligence → selects Tile category → confirms: "Network Winners NOT carried = 14" and FD-18842 is #1 in the list | Peer comparison table shows gap; SKU list below confirms FD-18842 |
| 5 | Peer Intelligence | AMS clicks "Add to Review List" on FD-18842. Then shares Review List with their AMM | Review List updated; sharing notification sent to AMM |
| 6 | Home | AMS returns to Home. The task "Flag LVP Loser SKUs" is also overdue — AMS clicks that and navigates to the Zombie SKU Report | Action Queue item navigates correctly |

**Happy path exits:** SKU added to Review List · AMM notified · Zombie SKU report opened

---

## Flow 2 — Create Cluster Plan (CM)

**Persona:** CM (Sarah Park)  
**Starting point:** Clustering Dashboard  
**Goal:** Create a new cluster plan for Tile, 2025 season, using Pro/DIY split as primary clustering variable

| Step | Module | Action | Outcome |
|------|--------|--------|---------|
| 1 | Clustering | CM opens Clustering Dashboard. Views existing finalized plans. Clicks "+ Create Cluster" | Create Cluster modal opens |
| 2 | Clustering | CM enters: Name = "FD_Tile_2025_v3" · Category = Tile · Reference Season = 2024 Fall/Winter · Weightage = 100%. Clicks Generate | Cluster Input Screen opens |
| 3 | Clustering | CM is on IA Recommended Metrics tab. Store group = All Stores. Selects: Performance ✓ + Store ✓ + Product ✓. Clicks "Run Cluster Group" | Significance scores table renders for all three attribute panels |
| 4 | Clustering | CM reviews significance scores. Selects: ST% (rank 1) · Revenue $ (rank 2) in Performance; Pro/DIY split (PRIMARY — pre-selected) · Store size (rank 2) in Store; Category mix% (rank 1) in Product. Clicks "Create Clusters" | Finalize Clusters screen loads with 5 clusters |
| 5 | Clustering | CM reviews Attribute Grades chart and Performance Cluster scatter plot. Sees cluster count = 5 matches business intuition. Reviews Cluster Breakdown Table — renames clusters using Display Cluster Name: "Pro-dominant · DIY-dominant · Mixed HV · Mixed Std · Large Format" | Display names editable inline |
| 6 | Clustering | CM expands the "Mixed HV" cluster row — sees 58 stores. Notes Store #1247 (Alpharetta) correctly assigned. No transfers needed | Store-level rows visible on expand |
| 7 | Clustering | CM clicks Save. Confirmation pop-up: "FD_Tile_2025_v3 saved successfully!" Clicks OK | Redirected to Clustering Dashboard. Plan shows "Cluster Finalized" |

**Happy path exits:** Cluster plan saved · 5 clusters created · Available for use in Peer Intelligence and Category Recommendations

---

## Flow 3 — District Peer Review (AMM)

**Persona:** AMM (Mark Chen, Region 7 — Southeast)  
**Starting point:** Home dashboard  
**Goal:** Review district health, identify the weakest store, and validate the AMS Review List before the PLR cycle

| Step | Module | Action | Outcome |
|------|--------|--------|---------|
| 1 | Home | AMM sees Home: 24 stores managed · 81% avg health · $284K trapped capital · 12 pending reviews. Notices Store #1247 (Alpharetta) at 87% health but flagged with 14 Network Win gaps | Home KPI strip and district summary visible |
| 2 | District Intelligence | AMM navigates to District Intelligence. Store #1247 appears in "Stores needing attention" ranked #3. AMM clicks Review | Store Deep Dive for #1247 opens |
| 3 | Store Deep Dive | AMM sees store-level SKU breakdown, assortment health detail, and — importantly — the AMS Review List shared by Jane Doe (FD-18842 + FD-28841). AMM confirms both SKUs are genuine Network Wins | Review List visible in Store Deep Dive |
| 4 | Peer Intelligence | AMM navigates to Peer Intelligence. Category = Tile. Cluster = Mixed HV. Can now see individual store names (AMM privilege). Confirms Store #1247's peer comparison — the 14-SKU gap is real | Named store view available at AMM level |
| 5 | Hindsight Analytics | AMM opens Hindsight Analytics. Runs PLR Cycle Audit report for Region 7, Tile category. Finds 4 stores with Losers persisting for >4 PLR cycles | Report renders; 4 stores flagged |
| 6 | Hindsight Analytics | AMM annotates the 4 flagged stores with a note: "Supplier contract prevents exit before July 2026 — escalating to CM" | Annotation logged; CM receives notification |

**Happy path exits:** AMS Review List validated · PLR Cycle Audit reviewed · 4 stores annotated · CM notified

---

## Flow 4 — Generate & Publish Recommendations (CM)

**Persona:** CM (Sarah Park)  
**Starting point:** Category Recommendations module  
**Goal:** Generate a CARRY/DROP/ADD recommendation set for Tile · Mixed HV cluster and publish to AMMs

| Step | Module | Action | Outcome |
|------|--------|--------|---------|
| 1 | Category Recommendations | CM opens Category Recommendations. Selects: Category = Tile · Cluster = Mixed High Volume · PLR cycle = May 2026. Clicks Generate Recommendations | System generates 48 recommendations |
| 2 | Category Recommendations | CM sees: 12 ADD · 18 DROP · 18 CARRY · 4 DISC. Filters to ADD — reviews top 5. FD-18842 is #1 (confidence 91%) — CM approves with no override | ADD list reviewed |
| 3 | Category Recommendations | CM filters to DROP. Checks FD-31887 (LVP Weathered Oak 6mm) — Loser for 4 PLR cycles, $3.2K trapped. Confidence 88%. CM annotates: "Confirm exit at May PLR — no supplier constraint" | Override annotation saved |
| 4 | Category Recommendations | CM checks the 4 DISC items. One (FD-55100 · Encaustic Cement Tile) has conflicting signals — Winner in Pro-dominant stores, Loser in DIY-dominant. CM marks it as "AMM Discretion — Pro/DIY context required" | DISC badge confirmed |
| 5 | Category Recommendations | CM clicks "Publish to AMMs". System sends notifications to all 3 AMMs with Region 7, 9, and 12 stores in the Mixed HV cluster. 5-day review window opens | AMMs notified; window timer starts |

**Happy path exits:** 48 recs published · AMMs notified · 5-day window active

---

## Flow 5 — AMM Review & Approval (AMM)

**Persona:** AMM (Mark Chen, Region 7)  
**Starting point:** Home dashboard (alert received)  
**Goal:** Review and accept the Tile · Mixed HV recommendation set within the 5-day window

| Step | Module | Action | Outcome |
|------|--------|--------|---------|
| 1 | Home | AMM sees Home: "Pending Reviews: 1 · Tile · Mixed HV · 4 days remaining". Clicks the review item | Category Recommendations module opens directly to this rec set |
| 2 | Category Recommendations | AMM sees the full list. Filters to ADD (12 items). Reviews FD-18842 — recognises it from Jane Doe's Review List. Confidence 91%. Clicks Accept | FD-18842 marked Accepted |
| 3 | Category Recommendations | AMM reviews DROP list. All look correct for Region 7 stores — no supplier constraints. Clicks Accept All | All 18 DROPs accepted |
| 4 | Category Recommendations | AMM reviews CARRY list. All fine. Accepts all 18. | 18 CARRYs accepted |
| 5 | Category Recommendations | AMM sees the 4 DISC items. Checks FD-55100 — AMM's region has 6 Pro-dominant stores and 4 DIY-dominant in the Mixed HV cluster. AMM decides: ADD for Pro stores, DISC remain for DIY stores. Uses Modify action. Selects "Local customer preference" as reason. | Modification logged; rec for DIY stores remains DISC |
| 6 | Category Recommendations | AMM clicks "Submit Review". AMS users in Region 7 receive notifications with the approved rec set | AMSs notified; 4-day acknowledgment window opens |
| 7 | Home | AMS Jane Doe receives the approved rec set for Store #1247. Acknowledges all items. Adds execution note: "FD-18842 — lead time 3 weeks, ordering for May 15 arrival" | Execution note logged; status changes to Acknowledged |

**Happy path exits:** All recs reviewed within window · 1 modification logged · AMS acknowledged · Execution note recorded

---
---

# Non-Functional Requirements

| Requirement | Specification |
|-------------|--------------|
| Performance | Dashboard load < 3 seconds · Report generation < 10 seconds · Clustering run < 60 seconds for up to 300 stores |
| Uptime | 99.5% during business hours (Mon–Sat, 6am–10pm local store time) |
| Data freshness | Weekly refresh aligned to PLR cycle · Real-time for alert generation |
| Security | Role-based access · SOC 2 Type II · AMS cannot see individual peer store names |
| Accessibility | WCAG 2.1 AA minimum |
| Browser support | Chrome · Edge · Safari — latest 2 major versions; IE not supported |
| Device | Tablet-optimised (AMS floor use) · Desktop-primary (AMM and CM) |
| Audit trail | All user actions logged: timestamp · role · store ID · module · action type |
| Data retention | 5 years transactional history · Recommendation history indefinite |
| Export | CSV + Excel from all tables and reports |
| Alert volume | 10/week standard format (≤80K sq ft) · 15/week large format (>80K sq ft) · ADMIN-configurable |
| Clustering | Pro/DIY split is a mandatory PRIMARY variable — hard-coded constraint, not configurable by user |

---

# Resolved Design Decisions

| # | Decision | Resolution |
|---|----------|------------|
| 1 | Peer comparison entry point | Category-first. Merchants think in categories; SKU Explorer is a drill-down, not the landing view. |
| 2 | Confidence score visibility | Yes — display with plain-language explanation. Transparency builds trust. |
| 3 | Pro SKU DROP guard | 3 PLR cycles confirmed. Conservative threshold for Pro loyalty risk. |
| 4 | Alert volume | 10/week standard · 15/week large format. Derived from F&D's ~4,400 SKUs/store and 2–3% weekly status-change rate. |
| 5 | Annotation → model update | DA team reviews bi-weekly (human in the loop). No automatic propagation. |
| 6 | Phase C outperformance % | TBD post-Stage 1 baseline. Target set with EXEC after Stage 1 data is available. |
| 7 | Tree Map metric weighting | User-configurable via Graph Settings · Metrics tab · sliders totalling 100%. Default: ST% 50 / Margin% 50. |
| 8 | Bubble Graph default axes | X = Revenue · Y = Gross Margin $ · Size = Quantity Sold. All three axes are user-configurable. |
| 9 | Clustering: cluster count range | 2–8 clusters. IA-recommended count shown on load (typically 3–7). User selects via dropdown. |
| 10 | Action Queue / Communications | Removed. Alert delivery is in-platform within the Home dashboard and relevant module pages only. |
| 11 | Planogram Intelligence | Removed entirely. Not in scope for StoreHub F&D. |

---

# Implementation Roadmap Summary

| Stage | Weeks | Primary deliverables |
|-------|-------|---------------------|
| Stage 1 — Hindsight + Clustering | W1–W12 | Data ingestion · SKU performance classifications · Hindsight reports · Tree Map + Bubble Graph · Clustering module (create, finalize, save) |
| Stage 2 — Peer Intelligence | W13–W28 | StoreHub UAT · Peer Intelligence go-live · Network Learning Engine · Annotation layer |
| Stage 3 — Category Recommendations | W29–W44 | Pilot category recommendations · 4-step review workflow · Phase B outcome measurement · Phase C evaluation |

*Timeline is directional — final schedule shaped during initial discovery.*

---

*StoreHub · Prepared by Impact Analytics for Floor & Decor · April 2026 · Confidential · Not for external distribution.*
