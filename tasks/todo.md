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

---

# Phase 3: Restyle the UI to match the reference screenshot (week view with a sidebar)

The reference is a Google-Calendar-style layout. We copy the **layout and visual style** only. We don't use Google's logo, product name or branding: the app keeps its own name and a generic calendar icon.

- [x] **17. App shell layout**: a top bar with a menu (hamburger) button, an app icon showing today's date, the title "Calendar", a rounded "Today" pill, ‹ › arrows, the period title ("November 2026"), and a Month/Week view dropdown on the right. Below it, a left sidebar and a main panel with rounded corners on a light grey background.
  - AC: matches the reference structure at 1280px or wider. The menu button shows and hides the sidebar.
- [x] **18. Sidebar**: a "+ Create" pill button with a shadow that opens the add-event form. A mini month calendar with its own ‹ › arrows, single-letter weekdays and today in a blue circle; clicking a date jumps the main view to it. A "My calendars" section with a colour checkbox per calendar (Personal, Work, Other) that shows or hides those events.
  - AC: clicking a date in the mini calendar moves the main view to that week or month. Unticking a calendar hides its events in both views. The checkbox state is remembered.
- [x] **19. Calendar field on events**: add a "Calendar" select (Personal, Work, Other) to the event form, stored as `calendar`. Existing events without it count as Personal. Each calendar has a colour that is used on chips and blocks.
  - AC: old data still loads, and events show their calendar's colour.
- [x] **20. Week view (new, the default as in the reference)**: day headers with the weekday (SUN…) and a large date number, with today in a filled blue circle. An all-day row for events without a start time. A 24-hour grid with hour labels (1 AM … 11 PM) that scrolls to around 7 AM on load. Timed events are drawn as outlined blocks at their start and end (1 hour if there's no end), showing the title and "9 – 10am". Overlapping events sit side by side. A red current-time line with a dot runs across today's column.
  - AC: an event from 9:00 to 10:00 lines up with the 9 AM–10 AM rows. Two overlapping events don't cover each other. The red line is at the current time and moves every minute. Clicking an empty slot opens the add form with that date and hour filled in. Clicking a block opens edit.
- [x] **21. Month view restyle**: the same visual language: a white rounded panel, light grid lines, today as a blue circle, chips in the calendar's colour. All existing behaviour, including "+N more" and the day panel, still works.
  - AC: switching between Month and Week keeps the current date in view. The chosen view is remembered after a reload.
- [x] **22. Responsive**: below 900px the sidebar becomes a slide-over opened by the menu button. Below 600px the week view narrows its columns (short weekday labels, smaller text) and the form stays a bottom sheet.
  - AC: no horizontal page scroll at 360px, 768px or 1280px wide. The week grid still scrolls vertically.
- [x] **23. Accessibility baseline** (from the a11y review): all text at least 4.5:1 contrast and field borders at least 3:1. Every day, event and "+N more" is a `<button>` with a full accessible name (date, time, calendar); today is marked with `aria-current="date"`. Pop-ups keep focus inside them (`inert` on the page behind) and return focus when they close. Errors are linked with `aria-describedby` and `aria-invalid`, and focus moves to the first invalid field. A visible `:focus-visible` outline. The period title announces changes (`aria-live`). Arrow keys move between days.
  - AC: the whole app works with the keyboard alone (Tab, Enter, Esc, arrows). Measured contrast ratios are listed in the review.
- [x] **24. Docs and ship**: update the README (features, data format with `calendar`, screenshot section), add a Phase 3 review here, commit, and push to GitHub.
  - AC: the README matches the app, and https://github.com/AreejBatool/calendar-app has the new commit.

## Phase 3 Review

**Files changed**
- `index.html` (rewritten):
  - A top bar with the menu button, app icon, Today, ‹ ›, the period title (`aria-live`) and the Week/Month select.
  - A sidebar with Create, the small month calendar and "My calendars".
  - `#weekView` and `#monthView` containers.
  - The event form gains a **Calendar** select. Errors now sit outside the labels and are linked with `aria-describedby`.
- `styles.css` (rewritten):
  - Colour tokens with measured contrast.
  - The layout and sidebar, the week grid (hour lines drawn as a repeating gradient, `--hour: 48px`), event blocks, the current-time line, chips and the month grid.
  - Breakpoints: 900px (sidebar slides in over the page, with a dimmed backdrop) and 600px (compact top bar, dots in month view, bottom-sheet pop-ups).
- `app.js` (rewritten, about 660 lines):
  - `renderWeek()` and `layoutDay()` (overlapping events grouped and given side-by-side columns), `updateNowLine()` (every minute), `renderMonth()` (4–6 weeks as needed).
  - `renderMini()`, `renderCalList()` and the `CALENDARS` list. `calOf()` treats old events as Personal.
  - `showDialog()` / `hideDialog()` make the page behind `inert` and put focus back afterwards. The grid is rebuilt *before* a pop-up closes, so focus lands on the new button.
  - Arrow keys move between day buttons.
  - New validation rule: an end time without a start time.
  - New localStorage keys `calendarView` and `calendarHidden`.
- `README.md`: rewritten for the new UI, with screenshots, keyboard table, data format, accessibility notes and changelog.
- `docs/`: three screenshots (desktop week, desktop month, phone week).

**Measured contrast**

| Pair | Ratio |
|---|---|
| muted `#5f6368` on white / on `#f6f8fc` | 6.05 / 5.69 |
| white on accent `#0b57d0` | 6.39 |
| white on Work `#137333` | 5.95 |
| white on Other `#8430ce` | 6.37 |
| danger `#b3261e` on white | 6.54 |
| field border `#80868b` on white | 3.68 |

**Verified**
- Unit check of `fmtRange()`: "9 – 10am", "11am – 12:30pm". Unit check of `layoutDay()`: overlapping events get separate columns, and a freed column is reused.
- **35 of 35 scripted interaction checks pass** in headless Edge, covering:
  - The week view: day headers, `aria-current`, the now line, overlap widths.
  - The edit form: Esc closes it, the page behind is `inert`, focus returns afterwards.
  - Validation: errors, `aria-invalid`, focus on the first problem, errors clearing live.
  - Saving with a calendar, and clicking a slot to pre-fill the time.
  - The Work filter and its saved state.
  - The month view: cell count, "+2 more", the day panel with all 5 events, focus return.
  - Arrow keys, prev/next titles, crossing the year boundary, delete, the small month calendar, and the menu collapsing the sidebar.
- Screenshots at 1440px and 360px. At 360px there is no horizontal scrolling and the title fits.
- Not run: real phone hardware, and a real screen reader (NVDA or VoiceOver). The slide-over sidebar at under 900px was not screenshotted.

**Design note**: the layout and visual style follow the reference screenshot, but the app keeps its own name and a generic calendar icon. No third-party logos or branding are used.


---

# Phase 4: Accessibility fixes from the second a11y review, plus a README refresh

- [x] **25. One tab stop per grid (Patch A)**: roving `tabindex` on the main-view date buttons and the mini-calendar days, arrow keys in the mini calendar, focus kept after a mini-calendar click, and a "Skip to calendar" link. The selected mini day is announced as "selected", and buttons that open a pop-up get `aria-haspopup="dialog"`.
  - AC: 10 or fewer tab stops before the calendar (was 53). Mini-calendar day tab stops: 1 (was 42). Focus is not on `<body>` after a mini-calendar click.
- [x] **26. Month cells fit their content and chips are 24px (Patch B)**: rows are at least 136px on desktop (56px on phones) through a `--weeks` CSS variable, and the chip line-height is 22px.
  - AC: at 1280×720 the busy day's "+N more" is fully visible, and chips are at least 24px tall.
- [x] **27. The overlay sidebar behaves like a pop-up (Patch C)**: `main` is `inert` while the sidebar is open below 900px, and focus returns to the menu button when it closes.
  - AC: with the overlay open, `#main.inert` is true. After closing, focus is on the menu button.
- [x] **28. Reflow at 320px (Patch D)**: the period title wraps to its own line at 380px and below.
  - AC: the full "Nov 2026" shows at 320px.
- [x] **29. Windows high-contrast support (Patch E)**: `forced-colors` rules for today, the selected day, event borders and colour dots.
  - AC: the CSS is present. Not tested on a real Windows high-contrast theme.
- [x] **30. Quieter live region (Patch F)**: the period title is updated only when its text changes.
  - AC: a redraw that doesn't change the period makes 0 changes to the title.
- [x] **31. README refresh**: the `docs-helper` agent rewrites `README.md` as a simple beginner guide. Check it against the app.
  - AC: setup, how to use, features and an example usage section are all present, and every claim matches the code.
- [x] **32. Verify and ship**: rerun the 35 interaction checks and the a11y probe, screenshot at 320px, add a review section, commit and push.

## Phase 4 Review

**Changes**
- `app.js`:
  - New `rove()` helper: each grid (the main-view date buttons and the mini calendar) has a single tab stop, and the arrow keys move inside it.
  - The mini calendar gets ←→↑↓ keys that flip the month at the edges. It keeps focus after a click; on the overlay sidebar, focus moves to that day in the main view instead.
  - "selected" is added to the mini calendar's selected day name.
  - `aria-haspopup="dialog"` is set on date buttons, chips, event blocks and "+N more".
  - Month rows are sized by the `--weeks` CSS variable.
  - `setSidebar()` makes `main` inert while the overlay is open and returns focus to the menu button when it closes.
  - New `setPeriodTitle()` writes the live title only when its text changes.
- `index.html`: a "Skip to calendar" link, `tabindex="-1"` on `main`, `aria-haspopup` on **Create**, and the Title `maxlength` changed from 200 to **100** to match the validation rule.
- `styles.css`:
  - Skip-link styles, chip line-height 22px (24px targets), month rows at least 136px (56px on phones).
  - A 380px rule so the title wraps to its own line, and `forced-colors` rules.
  - The overlay sidebar now becomes visible instantly on open. This fixes a Phase 3 bug where focus couldn't move into it.
- `README.md`: rewritten by the new `docs-helper` agent (`.claude/agents/docs-helper.md`) as a beginner guide (intro, Features, Setup, How to use, Example usage, Tips, Project files). I checked it against the code and added two tips for the Phase 4 keyboard features.

**Verified** (headless Edge)

| Check | Before | After |
|---|---|---|
| Tab stops before the calendar | 53 | **12** (5 top bar + Create + 2 mini arrows + 1 mini day + 3 checkboxes). The skip link jumps past them. |
| Mini-calendar tab stops | 42 | **1** |
| Month-view tab stops | 43 | **9** |
| Focus after a mini-calendar click | `<body>` | the selected mini day; on the overlay, that day in the main view |
| Busy month cell at 1280×720 | 121px content in a 103px box, "+N more" hidden | 135 in 135, visible |
| Chip height | 20px | 24px |
| Title changes on a redraw with no new period | 1 | 0 |
| Overlay sidebar: `main` inert / focus moves in / Esc returns focus | no / no / – | yes / yes / yes |
| Title at 320px | "Nov 2…" | "Nov 2026" on its own line |

- The 35 interaction checks still pass (35/35).
- **AC note**: todo 25's target of "10 or fewer tab stops" was my own miscount. The result is 12. All 12 are real controls, and the skip link reaches the calendar with one Tab.
- **Not tested**: a real Windows high-contrast theme (the `forced-colors` CSS was only reviewed), real screen readers, and real phones.

