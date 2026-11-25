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
Get the code:
```sh
git clone https://github.com/AreejBatool/calendar-app.git
cd calendar-app
```
Then open `index.html` in any modern browser by double-clicking it. You don't need a server.

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

## Browser support
The app works in recent Chrome, Edge, Firefox and Safari. It relies on `<input type="date">`, `<input type="time">`, CSS grid and localStorage.

## Changelog
- **Phase 2**: added a day-events panel and made "+N more" clickable. On mobile, tapping a day that has events lists them. README added.
- **Phase 1**: month grid and navigation, add/edit/delete with validation, localStorage storage, responsive layout.

The full task list and review notes are in [`tasks/todo.md`](tasks/todo.md).

## Contributing
1. Keep it dependency-free: plain HTML, CSS and JS only.
2. Add the task to `tasks/todo.md` with acceptance criteria before changing code.
3. Test by hand in a browser at 360px, 768px and 1280px widths before committing.
4. Update this README when you change features, files or the data format.

## Reset data
Open DevTools, go to Application → Local Storage, and delete `calendarEvents`. Or run this in the console:
```js
localStorage.removeItem('calendarEvents'); location.reload();
```
