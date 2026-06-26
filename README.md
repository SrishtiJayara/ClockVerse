# ⏰ ClockVerse

ClockVerse is a premium, high-aesthetic productivity application designed to organize, schedule, and track your daily tasks, alarms, and timezone schedules.

---

## 🌟 Key Features

### 1. Style & Theme Redesign (Coolors Palette)
* **Custom Aesthetics**: Designed with a sleek dark slate forest teal theme (`#0b2124` background, `#142d32` cards) and primary mint highlights (`#4ecdc4`), supporting interactive theme switching to a clean light mode (`#f7fff7`).
* **Micro-Animations**: Features smooth interactive animations, glow panels, hover transitions, and canvas confetti celebrations on completing goals.

### 2. Multi-Face Clock & Timezone Auto-Detection
* **Responsive Faces**: Supports multiple styles including **Digital**, **Analog**, **Flip Clock**, **Arc**, and **Neon** (default) that automatically resize across phone, tablet, and desktop views.
* **Global Timezones**: Detects the user's browser local timezone on mount, with full support to search, switch, and calculate IANA time offsets adjusting dynamically for DST.

### 3. Alarm Center (Synthesized Sound Engine)
* **Web Audio API Synth**: Synthesizes 10 rich audio alarm options directly in the browser using oscillators and gain envelopes with a volume fade-in over 6 seconds.
* **Dismiss & Snooze Modals**: Launches full-screen vibrating alarm triggers with quick snooze increments (5, 10, 15, 30 minutes) and confetti rewards on dismissal.
* **Checklist Indicator**: Displays upcoming alarm estimations (e.g. *rings in 3h 15m*) dynamically.

### 4. Focus Flow (Productivity Timer)
* A dedicated workspace timer (formerly Pomodoro) with built-in cycles to maintain task velocity, track sessions, and alert users on cycle changes.

### 5. Dedicated Task Checklist
* A comprehensive full-page **Task Checklist** tab and a globally accessible sliding **Checklist Drawer** (accessible via FAB) to add, prioritize, tag, search, and delete tasks.

### 6. Productivity Analytics Dashboard
* **Streaks & Scores**: Tracks productivity percentages, active Streaks, and unlocking achievement badges.
* **Interactive Graphs**: Employs **Recharts** to visualizes:
  * Weekly completion columns
  * Hourly task activity curves
  * Inner-donut category tag ratios
* **Heatmap Grid**: Evaluates daily task volumes over the past 30 days.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Vite 7, Tailwind CSS v4, Lucide Icons, Recharts, Sonner, Wouter
* **Audio Synthesis**: Web Audio API (Oscillators, Gains)
* **Backend**: Node.js, Express (API/server bundle)
* **Tooling**: ESBuild, Prettier

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   cd premium_clock_timer
   ```
2. Install the package dependencies using `pnpm` (or `npm`):
   ```bash
   pnpm install
   ```

### Running Locally
To launch the Vite development server locally:
```bash
pnpm dev
```
The application will run on `http://localhost:3000`.

### Building for Production
To bundle the frontend assets and compile the server bundle:
```bash
pnpm build
```
The production bundle compiles under the `dist/` folder.
