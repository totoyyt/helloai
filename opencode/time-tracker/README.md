# Time Tracker

A personal time tracking web app that runs locally on macOS.

## Features

- Manual start/stop timer
- Projects and tasks organization
- Daily and weekly views
- Reports with pie and bar charts
- Export to JSON or CSV
- Local JSON file storage

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Storage**: JSON file
- **Charts**: Recharts
- **Styling**: Tailwind CSS

## Setup

```bash
# Install dependencies
npm run install:all
```

## Running

```bash
# Start both server and client
npm run dev
```

Then open http://localhost:3000 in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (runs on port 3000) |
| `npm run build` | Build for production |
| `npm start` | Start production server |

## Project Structure

```
time-tracker/
├── server/           # Express backend
│   ├── index.js      # Server entry point
│   ├── routes/       # API routes
│   └── data/         # JSON storage
├── client/           # React frontend
│   └── src/
│       ├── components/  # UI components
│       ├── context/    # React context
│       └── services/   # API client
└── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/entries` | List time entries |
| POST | `/api/timer/start` | Start timer |
| POST | `/api/timer/stop` | Stop timer |
| GET | `/api/export/:format` | Export data (json/csv) |
