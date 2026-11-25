# Calendar App (Month View)

A small month-view calendar written in plain HTML, CSS and JavaScript. It has no framework, no build step and no dependencies. Events are saved in your browser's localStorage.

## Features
- Month grid (Sun–Sat, 6 weeks) with Previous, Next and Today buttons. Today is highlighted.
- Add, edit and delete events. Each event has a title, date, optional start and end times, and an optional description.
- Click a day to add an event on that date. Click an event to edit it.
- Each day shows up to 3 events. Click **+N more** to see every event that day.
- Basic validation: the title is required (100 characters max), the date must be real, and the end time must be after the start.
- Responsive layout. At 600px or narrower, events show as dots and tapping a busy day lists its events.

## Run it
Open `index.html` in any modern browser by double-clicking it. You don't need a server.

If you prefer a local server:
```sh
npx serve .        # or: python -m http.server
```

## Files
| File | Purpose |
|---|---|
| `index.html` | Page markup: the toolbar, grid, event form and day-events panel |
| `styles.css` | Layout, modals and the mobile rules (`@media (max-width: 600px)`) |
| `app.js` | Storage, rendering, navigation, modals, validation and add/edit/delete |
| `tasks/todo.md` | The plan, task checklist with acceptance criteria, and review notes |

### Where things live in `app.js`
- `loadEvents()` / `saveEvents()`: read and write localStorage
- `render()`: builds the 42-cell month grid
- `goToMonth()` / `goToToday()`: navigation
- `openModal()` / `closeModal()`: the add/edit form
- `openDayPanel()` / `closeDayPanel()`: the list of one day's events
- `validate()` / `showErrors()`: form validation
- `handleSubmit()` / `handleDelete()`: create, update and delete

## Data format
Events are stored under the localStorage key `calendarEvents` as a JSON array:
```json
[
  {
    "id": "lq3k9x2abcd",
    "title": "Team sync",
    "date": "2026-11-25",
    "startTime": "09:30",
    "endTime": "10:00",
    "description": "Weekly check-in"
  }
]
```
`startTime`, `endTime` and `description` can be empty strings. If the stored data is not valid JSON, the app starts with an empty list instead of crashing.

## Reset data
Open DevTools, go to Application → Local Storage, and delete `calendarEvents`. Or run this in the console:
```js
localStorage.removeItem('calendarEvents'); location.reload();
```
