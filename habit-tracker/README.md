# Habit Tracker - PRD

**Live Demo**: https://habit-tracker-rho-ruddy.vercel.app

**Deploy Status**: ✅ Deployed to Vercel

## 1. Product Overview

### Problem
Users want to build and maintain positive daily habits but lack a simple, visual tool to track consistency and progress. Existing solutions are often bloated with features or require account creation.

### Solution
A lightweight, pure-frontend Habit Tracker web app that runs entirely in the browser. No backend, no login — data persists in localStorage. Users can create habits, check in daily, and visualize their consistency through a GitHub-style heatmap calendar and streak counters.

### Target Users
- Individuals who want a quick, frictionless way to track daily habits
- Users who prefer privacy (all data stays in browser)

### Tech Stack
- Pure HTML + CSS + JavaScript (no frameworks)
- localStorage for data persistence
- Deployed on Vercel as a static site

## 2. User Interaction Design

### Core User Flows

**Flow 1: First Visit**
1. User opens the app → sees an empty state with a clear "Add Habit" button
2. User clicks "Add Habit" → a form/modal appears to enter habit name and optional color/icon
3. After creating a habit, it appears in the main habit list

**Flow 2: Daily Check-in**
1. User opens the app → sees today's habit list
2. Each habit has a checkbox/toggle button
3. User clicks to mark a habit as done for today → visual feedback (animation, color change)
4. Checked habits show a checkmark; the daily completion count updates

**Flow 3: Viewing Progress**
1. User clicks on a habit → sees a detail view with:
   - GitHub-style heatmap calendar (past 365 days)
   - Current streak and longest streak
   - Completion rate (percentage)
2. The heatmap uses color intensity to show completion density

**Flow 4: Stats Dashboard**
1. User navigates to a stats/dashboard view
2. Sees aggregate stats: total habits, overall completion rate, best streaks
3. Per-habit breakdown with mini heatmaps

**Flow 5: Data Management**
1. User can export all data as JSON
2. User can import previously exported JSON to restore data
3. Clear confirmation dialog before destructive operations

### UI Layout
- **Header**: App title + navigation (Habits | Stats)
- **Main View - Habits**: List of habits with today's check-in status, "Add Habit" button
- **Detail View**: Single habit's heatmap + streak stats
- **Stats View**: Aggregate dashboard
- **Footer**: Export/Import buttons

## 3. Architecture

### Data Model

```javascript
// Stored in localStorage as JSON

// habits: Array of habit objects
{
  "habits": [
    {
      "id": "uuid-string",
      "name": "Exercise",
      "color": "#4CAF50",       // For heatmap and UI theming
      "createdAt": "2026-01-01", // ISO date string
      "archived": false
    }
  ],
  "checkins": {
    "habit-id-1": ["2026-03-01", "2026-03-02", "2026-03-04"],
    "habit-id-2": ["2026-03-01"]
  }
}
```

### Key Technical Decisions
- **No framework**: Vanilla JS keeps it simple, fast to load, zero build step
- **localStorage**: Simple persistence, no backend needed
- **UUID generation**: Use `crypto.randomUUID()` for habit IDs
- **Date handling**: Use native `Date` API, store dates as ISO strings (YYYY-MM-DD)
- **Heatmap rendering**: CSS Grid or SVG-based, inspired by GitHub contribution graph

### File Structure (Suggested)
```
/
├── index.html          # Single page app shell
├── css/
│   └── style.css       # All styles
├── js/
│   ├── app.js          # Main app initialization and routing
│   ├── store.js        # localStorage data layer
│   ├── habits.js       # Habit CRUD operations
│   ├── checkin.js       # Check-in logic
│   ├── heatmap.js      # Heatmap calendar rendering
│   ├── stats.js        # Statistics calculations and dashboard
│   └── io.js           # Import/Export functionality
└── README.md           # Dev documentation
```

## 4. Feature List & Priority

### Milestone 1: Core Habits (MVP)
Priority: P0

| Feature | Description |
|---------|-------------|
| Add Habit | Create a new habit with name and color |
| List Habits | Show all active habits for today |
| Check-in | Mark a habit as done for today (toggle on/off) |
| Delete Habit | Remove a habit (with confirmation) |
| Edit Habit | Edit habit name and color |
| Data Persistence | All data saved to localStorage automatically |

### Milestone 2: Visualization
Priority: P0

| Feature | Description |
|---------|-------------|
| Heatmap Calendar | GitHub-style 365-day heatmap per habit |
| Streak Counter | Show current streak and longest streak per habit |
| Habit Detail View | Click a habit to see its heatmap + stats |

### Milestone 3: Stats & Data
Priority: P1

| Feature | Description |
|---------|-------------|
| Stats Dashboard | Aggregate view of all habits' performance |
| Completion Rate | Per-habit and overall completion percentage |
| Export Data | Download all data as JSON file |
| Import Data | Upload JSON file to restore data |

## 5. Acceptance Criteria

### Milestone 1: Core Habits

- **AC-1.1**: User can create a habit by entering a name. After creation, the habit appears in the list immediately.
- **AC-1.2**: The main view shows all active habits with today's date. Each habit has a clear check-in toggle.
- **AC-1.3**: User can check in (mark done) and uncheck a habit for today. The state persists after page refresh.
- **AC-1.4**: User can delete a habit. A confirmation dialog appears before deletion. After deletion, the habit and all its check-in data are removed.
- **AC-1.5**: User can edit a habit's name and color. Changes are reflected immediately.
- **AC-1.6**: All data survives page refresh (localStorage persistence verified).

### Milestone 2: Visualization

- **AC-2.1**: Each habit has a detail view showing a heatmap calendar of the past 365 days. Days with check-ins are colored; days without are gray/empty.
- **AC-2.2**: Current streak (consecutive days up to today) is displayed as a number.
- **AC-2.3**: Longest streak (best historical run) is displayed.
- **AC-2.4**: Heatmap color intensity reflects the habit's chosen color.

### Milestone 3: Stats & Data

- **AC-3.1**: Stats dashboard shows: total number of habits, overall completion rate, best active streak across all habits.
- **AC-3.2**: Per-habit stats show: completion rate, total check-ins, current streak, longest streak.
- **AC-3.3**: Export produces a valid JSON file containing all habits and check-in data. The file downloads to the user's device.
- **AC-3.4**: Import accepts a previously exported JSON file and restores all data. A confirmation dialog warns that import will overwrite existing data.
- **AC-3.5**: After import, the app immediately reflects the imported data without page refresh.

## 6. Product Milestones

| Milestone | Scope | Status |
|-----------|-------|--------|
| M1: Core Habits | Habit CRUD + daily check-in + persistence | Done (accepted 2026-03-16) |
| M2: Visualization | Heatmap calendar + streak counters + detail view | Done (accepted 2026-03-16) |
| M3: Stats & Data | Stats dashboard + export/import | Done (accepted 2026-03-16) |

**Project Status: FEATURE-COMPLETE** (all 15 ACs passed, 418/418 tests)

## 7. Non-Functional Requirements

- **Performance**: Page load < 1 second (no framework overhead)
- **Responsiveness**: Must work on mobile and desktop browsers
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge latest 2 versions)
- **Accessibility**: Proper semantic HTML, keyboard navigable, sufficient color contrast
- **No External Dependencies**: No CDN dependencies, no npm packages, fully self-contained
