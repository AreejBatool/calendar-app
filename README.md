# Calendar App

A week-and-month calendar written in plain HTML, CSS and JavaScript. It has no framework, no build step and no dependencies. Events are saved in your browser's localStorage.

![Week view](docs/week-view.png)

| Month view | Phone (360px) |
|---|---|
| ![Month view](docs/month-view.png) | ![Phone week view](docs/phone-week.png) |

## Features
- **Week view** (the default): a 24-hour time grid that opens at 7 AM. Events are drawn at their real times, and overlapping events sit side by side. Events without a start time go in an all-day row. A red line marks the current time and moves every minute.
- **Month view**: up to 3 events per day, then **+N more**, which opens a list of every event that day.
- **Top bar**: a menu button, Today, ‹ ›, the current period ("November 2026" or "Dec 2026 – Jan 2027"), and a Week/Month switch. The app remembers the last view you used.
- **Sidebar**:
  - **+ Create** button.
  - A small month calendar: click any date to jump there.
  - **My calendars**: Personal, Work and Other, each with its own colour and a checkbox to show or hide its events. The app remembers which are hidden.
- **Add, edit and delete**:
  - Click an empty hour slot to add an event at that time.
  - Click a date number to see that day's events.
  - Click an event to edit or delete it.
- **Validation**:
  - The title is required (100 characters max) and the date must be real.
  - The end time must be after the start, and an end time needs a start time.
  - Errors appear next to the field.
- **Responsive**:
  - Below 900px the sidebar slides in from the menu button.
  - Below 600px the layout is compact, month events show as dots, and tapping a busy day lists its events.
- **Accessible**: works fully with the keyboard and with screen readers (details in [Accessibility](#accessibility)).

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

## Keyboard
| Key | Action |
|---|---|
| Tab / Shift+Tab | Move between controls. Inside a pop-up, focus stays in the pop-up. |
| Enter / Space | Activate the focused day, event or button |
| ← → | Previous or next day, when a date number has focus |
| ↑ ↓ | Previous or next week, in month view |
| Esc | Close the open pop-up, or the slide-over sidebar |

## Files
| File | Purpose |
|---|---|
| `index.html` | Markup: the top bar, sidebar, week and month containers, the event form and the day-events panel |
| `styles.css` | Design tokens, layout, both views, the pop-ups, and the responsive rules (`900px` and `600px`) |
| `app.js` | Storage, rendering, navigation, the calendar filters, the pop-ups, validation and add/edit/delete |
| `docs/` | The screenshots used in this README |
| `tasks/todo.md` | The plan, task checklist with acceptance criteria, and review notes for every phase |
| `.claude/commands/ally-check.md` | A project slash command for an accessibility review in Claude Code |

### Where things live in `app.js`
- `store`, `loadEvents()`, `saveEvents()`: localStorage access. A read that fails falls back to defaults.
- `render()`: draws the title, the active view and the small month calendar.
- `renderWeek()`, `layoutDay()`, `eventBlock()`, `updateNowLine()`: the week view and how overlapping events are placed.
- `renderMonth()`, `chip()`, `dayButton()`: the month view.
- `renderMini()`, `renderCalList()`, `setSidebar()`: the sidebar.
- `goTo()`, `shift()`, `setView()`: navigation.
- `showDialog()` / `hideDialog()`: open and close the pop-ups, keeping focus inside while open and putting it back afterwards.
- `openModal()`, `openDayPanel()`: the event form and the day-events panel.
- `validate()`, `showErrors()`, `handleSubmit()`, `handleDelete()`: the form logic.

## Data format
localStorage keys:

| Key | Value |
|---|---|
| `calendarEvents` | JSON array of events (below) |
| `calendarView` | `"week"` or `"month"` |
| `calendarHidden` | JSON array of hidden calendar ids, e.g. `["work"]` |

```json
[
  {
    "id": "lq3k9x2abcd",
    "title": "Team sync",
    "date": "2026-11-25",
    "calendar": "work",
    "startTime": "09:30",
    "endTime": "10:00",
    "description": "Weekly check-in"
  }
]
```
- `calendar` is `personal`, `work` or `other`. Events saved before this field existed count as `personal`.
- `startTime` and `endTime` are `HH:MM` (24-hour) or empty. An empty `startTime` makes it an all-day event. Without an `endTime`, the event lasts 1 hour.
- If the stored data is not valid JSON, the app starts with an empty list instead of crashing.

To add or rename calendars, edit the `CALENDARS` list at the top of `app.js`. Pick colours with at least 4.5:1 contrast against white.

## Accessibility
- **Contrast**: all text pairs measure at least 4.5:1 and form-field borders at least 3:1. The values are noted in `styles.css`.
- **Real buttons with full names**: every day, event and "+N more" is a `<button>` whose name includes the full date, time and calendar. Today is marked with `aria-current="date"`.
- **Pop-ups**:
  - Focus stays inside while one is open, because the page behind is made `inert`.
  - Focus returns to where it was when the pop-up closes.
  - Esc closes it.
- **Form errors**: linked to their fields (`aria-describedby`), and the fields are marked `aria-invalid`. On a failed save, focus moves to the first problem.
- **Focus and announcements**: a visible `:focus-visible` outline, and the period title announces changes (`aria-live`).
- **Motion**: honours `prefers-reduced-motion`.

## Browser support
Recent Chrome, Edge, Firefox and Safari. It relies on CSS grid, `color-mix()`, the `inert` attribute, `<input type="date">` / `type="time"`, and localStorage.

## Changelog
- **Phase 3**:
  - Redesigned layout with a top bar and sidebar.
  - New week view: time grid, overlap layout and current-time line.
  - Calendar categories with colours and filters.
  - Small month calendar for jumping to dates.
  - Accessibility fixes: contrast, keyboard use, focus handling and labels.
- **Phase 2**: added a day-events panel and made "+N more" clickable. On mobile, tapping a day that has events lists them. README added.
- **Phase 1**: month grid and navigation, add/edit/delete with validation, localStorage storage, responsive layout.

The full task list and review notes are in [`tasks/todo.md`](tasks/todo.md).

## Contributing
1. Keep it dependency-free: plain HTML, CSS and JS only.
2. Add the task to `tasks/todo.md` with acceptance criteria before changing code.
3. Test by hand in a browser at 360px, 768px and 1280px widths, and with the keyboard only, before committing.
4. Keep new colours at 4.5:1 contrast or better for text and 3:1 for borders.
5. Update this README, including the screenshots in `docs/` if the UI changes, when you change features, files or the data format.

## Reset data
Open DevTools, go to Application → Local Storage, and delete the `calendar*` keys. Or run this in the console:
```js
['calendarEvents', 'calendarView', 'calendarHidden'].forEach((k) => localStorage.removeItem(k)); location.reload();
```
