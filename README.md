# Time Tracker

A local time-tracking web application for logging daily work activities.

## Features

- Start/stop timers for tasks and projects
- Quick 1-click task switching within projects
- Daily, weekly, and monthly summaries
- Historical data browsing
- Export data as JSON
- 4 AM day boundary for consistent daily tracking

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser to:
```
http://localhost:3000
```

## Usage

- **Start tracking**: Select a project and task, then click Start
- **Switch tasks**: Click on a different task in the same project (1-click)
- **Switch projects**: Select a different project from the dropdown
- **View summaries**: Use the Day/Week/Month tabs to see time totals
- **Manage projects/tasks**: Use the management forms to add/edit/delete

## Data Storage

All data is stored locally in a SQLite database file (`timetracker.db`) in the application directory.
