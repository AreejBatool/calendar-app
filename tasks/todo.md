# Calendar App (Month View) — Todo

Stack: plain HTML, CSS and JS (`index.html`, `styles.css`, `app.js`). No build step and no dependencies.
Storage: localStorage key `calendarEvents` holds a JSON array of
`{ id, title, date: "YYYY-MM-DD", startTime?, endTime?, description? }`.

- [x] **1. Project scaffold**: create `index.html`, `styles.css` and `app.js`, and link them.
  - AC: opening `index.html` shows the header and an empty grid area with no console errors.
- [x] **2. Month grid rendering**: show 7 weekday headers (Sun–Sat) and 6×7 day cells. The grid includes leading days from the previous month and trailing days from the next month.
  - AC: the current month shows the correct day count and starts on the correct weekday. Days from other months are dimmed. Today is highlighted.
- [x] **3. Month navigation**: add Prev, Next and Today buttons. The title shows "Month YYYY".
  - AC: navigation crosses year boundaries correctly (Dec → Jan and Jan → Dec). Today returns to the current month.
- [x] **4. localStorage storage**: add `loadEvents()` and `saveEvents()` using JSON.
  - AC: events survive a page reload. Malformed JSON in storage leads to an empty list and no crash.
- [x] **5. Add-event modal**: add an "Add event" button. Clicking a day cell opens the modal with that date filled in. The modal has fields for title, date, start, end and description, plus Save and Cancel. Esc, the backdrop and Cancel all close it.
  - AC: the modal opens and closes as described. Focus moves to the title field when it opens. A saved event appears in the correct cell right away.
- [x] **6. Display events in cells**: show events as chips sorted by start time. When there are more than 3, show "+N more".
  - AC: chips show the time (if set) and the title. Long titles are truncated with an ellipsis.
- [x] **7. Edit event**: clicking a chip opens the same modal with the event's details filled in and a "Delete" button shown.
  - AC: changes are saved to the same `id` and do not create a duplicate. Changing the date moves the chip to the new cell.
- [x] **8. Delete event**: the Delete button in edit mode asks for confirmation, then removes the event.
  - AC: the event disappears from the grid and from localStorage. Cancelling the confirmation keeps the event.
- [x] **9. Basic validation**: the title is required and at most 100 characters after trimming. The date is required and must be valid. If both times are set, the end must come after the start.
  - AC: invalid input shows an inline error message next to the field and blocks saving. The errors clear once the input is fixed.
- [x] **10. Responsive UI**: on screens narrower than 600px, cells shrink, events show as dots, and weekday labels are shortened (S M T…). The modal goes full-width.
  - AC: the layout works at 360px, 768px and 1280px widths with no horizontal scrolling. All controls can be tapped.
- [x] **11. Review section**: summarize the changes at the bottom of this file.

## Review

**Files created**
- `index.html`: the toolbar (‹ Today › buttons, month title, "+ Add event"), the weekday row, the grid container and the modal form. Each field has an error span.
- `styles.css`: a 7-column CSS grid, event chips with ellipsis truncation, a dimmed style for other-month days, a highlighted today, and the modal overlay. At 600px and below, single-letter weekdays, smaller cells, events as dots, and a full-width bottom-sheet modal.
- `app.js` (about 200 lines, no dependencies):
  - `loadEvents()` / `saveEvents()`: JSON in localStorage under `calendarEvents`, wrapped in try/catch. Corrupt data becomes `[]`.
  - `render()`: a 42-cell grid that starts on the Sunday on or before the 1st. Events are sorted by start time, up to 3 chips per cell, then "+N more".
  - `goToMonth()`: uses `new Date(y, m, 1)` so month −1 and month 12 wrap across years.
  - `openModal()` / `closeModal()`: one modal for both add and edit. Delete is shown only when editing. Esc, a backdrop click and Cancel all close it.
  - `validate()`: the title is required and ≤100 characters, the date is required and real, and the end time must be after the start. Errors appear inline, block saving, and clear live as the input is fixed.
  - Edits replace the event in place by `id`. Delete asks `confirm()` first.

**Verified**
- Node check of the grid math: Nov 2026 starts on Sunday the 1st, and Dec 2026 → Jan 2027 wraps correctly. Validation rejects 2026-02-29 and accepts 2028-02-29. `app.js` passes a syntax check.
- Not yet checked by hand in a browser: run the manual steps (add, edit, delete, reload, invalid input, 360/768/1280px widths, junk in localStorage).

**Known limitations**: both were fixed in Phase 2 (see below).

---

# Phase 2: Clear the limitations and finish the project

- [x] **12. Day-events panel**: add a second modal that lists every event for one day, sorted by time. It has a "+ Add event" button for that date. Clicking an event in the list closes the panel and opens the edit form. Esc, the backdrop and Close all close it, like the event form.
  - AC: the panel shows all of the day's events (none are hidden) with the time and title. The date heading reads like "Wednesday, November 25, 2026". "+ Add event" opens the form with that date filled in.
- [x] **13. Make "+N more" clickable**: clicking "+N more" opens the day-events panel instead of the add form. It becomes a real `<button>` so it can be reached by keyboard.
  - AC: a day with 5 events shows 3 chips and "+2 more", and clicking it lists all 5. Each one can be edited and deleted.
- [x] **14. Easier tapping on mobile**: at 600px and below, tapping a day that has events opens the day-events panel, so nobody has to hit a small dot. Tapping an empty day still opens the add form. Dots become purely visual on mobile.
  - AC: at a 360px width, tapping any day that has events lists them, and every list row is at least 44px tall.
- [x] **15. README.md**: cover what the app does, how to run it (open `index.html`), the file layout, the data format in localStorage, and how to reset the data.
  - AC: someone new can run the app and find their way around the code from the README alone.
- [x] **16. Update the review**: remove the two limitations and add a Phase 2 summary.

## Phase 2 Review

**Changes**
- `index.html`: added a `#dayModal` panel with a heading, the event list, Close, and "+ Add event".
- `styles.css`: "+N more" is now styled as a link button. Day-list rows are at least 44px tall, with the time column on the left and ellipsis on long titles. On mobile, dots and "+N more" ignore taps (`pointer-events: none`) so the tap goes to the cell.
- `app.js`:
  - New `eventsOn(key)` helper, shared by the grid and the panel.
  - New `isMobile()`, based on the same 600px breakpoint as the CSS.
  - New `openDayPanel()` / `closeDayPanel()`.
  - "+N more" is a `<button>` that opens the panel.
  - On mobile, tapping a day that has events opens the panel. Tapping an empty day still opens the add form.
  - Esc closes whichever pop-up is open.
- `README.md` (new): features, how to run it, file map, data format, how to reset.

**Limitations cleared**
- 4th and later events can be reached through "+N more" on any screen size.
- Mobile users tap the whole day cell instead of an 8px dot.

**Verified**: `app.js` passes a syntax check. A manual browser pass is still needed: 5 events on one day, "+2 more", and the 360px tap flow.
