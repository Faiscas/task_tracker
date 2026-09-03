# Engineering Productivity Tracker

Desktop-friendly task tracker for planning work on Kanban boards, timing issues, and exporting productivity reports.

## Features

- Multiple Kanban boards with editable, reorderable status columns
- Backlog issues with board assignment, tags, priorities, estimates, and descriptions
- Issue timer that moves selected board issues to `Ongoing`
- Task history, KPIs, charts, and CSV/Excel/PDF report export
- Automatic local browser backups and dark mode

## Requirements

- Node.js 20 or later

## Run in a browser

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local URL printed by Vite, normally `http://127.0.0.1:5173/`.

## Run as a desktop application

Start the Vite development server in one terminal:

```powershell
npm.cmd run dev
```

Then start Electron in a second terminal:

```powershell
npm.cmd run desktop
```

## Build the Windows installer

```powershell
npm.cmd run package:win
```

The generated Windows installer is written to the configured Electron build output directory.

## Data storage

The app stores boards, issues, completed timer entries, and preferences locally in the browser or desktop app profile. It also maintains a local backup under the `tracker_v2_backup` storage key.