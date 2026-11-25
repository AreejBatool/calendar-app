// Calendar app: week + month views. Events are stored as JSON in localStorage.

const STORAGE_KEY = 'calendarEvents';
const VIEW_KEY = 'calendarView';
const HIDDEN_KEY = 'calendarHidden';
const MAX_VISIBLE = 3;
const HOUR_H = 48; // keep in sync with --hour in styles.css
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CALENDARS = [
  { id: 'personal', name: 'Personal', color: '#0b57d0' },
  { id: 'work', name: 'Work', color: '#137333' },
  { id: 'other', name: 'Other', color: '#8430ce' },
];

const $ = (id) => document.getElementById(id);
const el = (tag, className, text) => {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
};

// ---------- Storage ----------
const store = {
  get(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
};

function loadEvents() {
  const data = store.get(STORAGE_KEY, []);
  return Array.isArray(data) ? data : [];
}

function saveEvents() {
  if (!store.set(STORAGE_KEY, events)) alert('Could not save events (storage unavailable).');
}

// ---------- State ----------
let events = loadEvents();
let view = ['week', 'month'].includes(store.get(VIEW_KEY)) ? store.get(VIEW_KEY) : 'week';
let hidden = new Set([].concat(store.get(HIDDEN_KEY, [])));
let cursor = startOfDay(new Date());         // the date the main view is centred on
let miniMonth = firstOfMonth(cursor);        // month shown in the sidebar picker
let editingId = null;
let dayPanelDate = null;
let todayKeyCache = toKey(new Date());

// ---------- Date helpers ----------
function pad(n) { return String(n).padStart(2, '0'); }
function toKey(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function fromKey(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); }
function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function firstOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
function startOfWeek(d) { return addDays(d, -d.getDay()); }
function longDate(d) {
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
function isValidDateKey(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}
function toMin(hhmm) { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; }

// 570 -> "9:30am"; suffix can be dropped for the first half of a range ("9 – 10am").
function fmtTime(min, suffix = true) {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return (h % 12 || 12) + (m ? ':' + pad(m) : '') + (suffix ? (h < 12 ? 'am' : 'pm') : '');
}
function fmtRange(s, e) {
  const sameHalf = (Math.floor(s / 60) < 12) === (Math.floor(e / 60) % 24 < 12);
  return `${fmtTime(s, !sameHalf)} – ${fmtTime(e)}`;
}
function hourLabel(h) { return `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`; }
function tzLabel() {
  try {
    return new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' })
      .formatToParts(new Date()).find((p) => p.type === 'timeZoneName')?.value || '';
  } catch {
    return '';
  }
}

// ---------- Event helpers ----------
function calOf(ev) { return CALENDARS.find((c) => c.id === ev.calendar) || CALENDARS[0]; }
function eventsOn(key) {
  return events
    .filter((e) => e.date === key && !hidden.has(calOf(e).id))
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
}
function timeText(ev) {
  if (!ev.startTime) return 'All day';
  const s = toMin(ev.startTime);
  return ev.endTime && toMin(ev.endTime) > s ? fmtRange(s, toMin(ev.endTime)) : fmtTime(s);
}
// Extra context for screen readers, appended as visually hidden text.
function srContext(ev) {
  return el('span', 'sr-only', `, ${timeText(ev)}, ${longDate(fromKey(ev.date))}, ${calOf(ev).name} calendar`);
}

const isMobile = () => window.matchMedia('(max-width: 600px)').matches;
const isNarrow = () => window.matchMedia('(max-width: 900px)').matches;

// ---------- Rendering ----------
function render() {
  $('appIconDay').textContent = new Date().getDate();
  const title = periodTitle();
  $('periodTitle').textContent = title;
  document.title = `${title} · Calendar`;
  $('viewSelect').value = view;
  $('prevBtn').setAttribute('aria-label', `Previous ${view}`);
  $('nextBtn').setAttribute('aria-label', `Next ${view}`);
  $('weekView').hidden = view !== 'week';
  $('monthView').hidden = view !== 'month';
  if (view === 'week') renderWeek(); else renderMonth();
  miniMonth = firstOfMonth(cursor);
  renderMini();
}

function periodTitle() {
  const month = isMobile() ? 'short' : 'long';
  if (view === 'month') return cursor.toLocaleDateString(undefined, { month, year: 'numeric' });
  const s = startOfWeek(cursor);
  const e = addDays(s, 6);
  if (s.getMonth() === e.getMonth()) return s.toLocaleDateString(undefined, { month, year: 'numeric' });
  const f = (d, withYear) => d.toLocaleDateString(undefined, { month: 'short', ...(withYear ? { year: 'numeric' } : {}) });
  return `${f(s, s.getFullYear() !== e.getFullYear())} – ${f(e, true)}`;
}

// Big date button used in the week header and month cells. Opens the day panel.
function dayButton(d, isToday) {
  const key = toKey(d);
  const n = eventsOn(key).length;
  const b = el('button', 'day-num', d.getDate());
  b.type = 'button';
  b.dataset.date = key;
  b.setAttribute('aria-label', `${longDate(d)}, ${n ? `${n} event${n > 1 ? 's' : ''}` : 'no events'}`);
  if (isToday) b.setAttribute('aria-current', 'date');
  return b;
}

function chip(ev) {
  const c = el('button', 'chip' + (ev.startTime ? '' : ' allday'));
  c.type = 'button';
  c.dataset.id = ev.id;
  c.style.setProperty('--c', calOf(ev).color);
  c.append((ev.startTime ? fmtTime(toMin(ev.startTime)) + ' ' : '') + ev.title, srContext(ev));
  c.title = `${ev.title} (${timeText(ev)})`;
  return c;
}

// ----- Week view -----
function renderWeek() {
  const start = startOfWeek(cursor);
  const todayKey = toKey(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  const head = $('weekHead');
  head.replaceChildren(el('div', 'tz', tzLabel()));
  days.forEach((d) => {
    const isToday = toKey(d) === todayKey;
    const col = el('div', 'wh-col' + (isToday ? ' today' : ''));
    const wd = el('span', 'wh-day', WEEKDAYS[d.getDay()].toUpperCase());
    wd.setAttribute('aria-hidden', 'true');
    col.append(wd, dayButton(d, isToday));
    head.appendChild(col);
  });

  const allDay = $('weekAllDay');
  allDay.replaceChildren(el('div'));
  days.forEach((d) => {
    const cell = el('div', 'ad-cell');
    cell.dataset.date = toKey(d);
    eventsOn(toKey(d)).filter((e) => !e.startTime).forEach((ev) => cell.appendChild(chip(ev)));
    allDay.appendChild(cell);
  });

  const grid = el('div', 'week-grid');
  const hours = el('div', 'hours');
  hours.setAttribute('aria-hidden', 'true');
  for (let h = 1; h < 24; h++) {
    const label = el('span', null, hourLabel(h));
    label.style.top = `${h * HOUR_H}px`;
    hours.appendChild(label);
  }
  grid.appendChild(hours);

  days.forEach((d) => {
    const col = el('div', 'day-col');
    col.dataset.date = toKey(d);
    layoutDay(eventsOn(toKey(d)).filter((e) => e.startTime)).forEach((it) => {
      const b = eventBlock(it);
      b.style.top = `${(it.s / 60) * HOUR_H}px`;
      b.style.height = `${Math.max(((it.e - it.s) / 60) * HOUR_H - 2, 18)}px`;
      b.style.left = `calc(${(it.col / it.cols) * 100}% + 2px)`;
      b.style.width = `calc(${100 / it.cols}% - 6px)`;
      col.appendChild(b);
    });
    grid.appendChild(col);
  });

  $('weekBody').replaceChildren(grid);
  updateNowLine();
}

// Give overlapping events side-by-side columns. Returns items with s, e (minutes), col, cols.
function layoutDay(list) {
  const items = list.map((ev) => {
    const s = toMin(ev.startTime);
    let e = ev.endTime ? toMin(ev.endTime) : s + 60;
    if (e <= s) e = s + 60;
    return { ev, s, e: Math.min(e, 1440) };
  }).sort((a, b) => a.s - b.s || b.e - a.e);

  let cluster = [];
  let colEnds = [];
  let clusterEnd = -1;
  const flush = () => {
    cluster.forEach((it) => (it.cols = colEnds.length));
    cluster = [];
    colEnds = [];
  };
  for (const it of items) {
    if (it.s >= clusterEnd) flush();
    let c = colEnds.findIndex((end) => end <= it.s);
    if (c === -1) { c = colEnds.length; colEnds.push(it.e); } else colEnds[c] = it.e;
    it.col = c;
    cluster.push(it);
    clusterEnd = Math.max(clusterEnd, it.e);
  }
  flush();
  return items;
}

function eventBlock({ ev, s, e }) {
  const b = el('button', 'event-block' + (e - s < 45 ? ' short' : ''));
  b.type = 'button';
  b.dataset.id = ev.id;
  b.style.setProperty('--c', calOf(ev).color);
  const time = el('span', 'eb-time', fmtRange(s, e));
  time.setAttribute('aria-hidden', 'true');
  b.append(el('span', 'eb-title', ev.title), time, srContext(ev));
  b.title = `${ev.title}\n${fmtRange(s, e)}`;
  return b;
}

function updateNowLine() {
  document.querySelector('.now-line')?.remove();
  if (view !== 'week') return;
  const now = new Date();
  const col = document.querySelector(`.day-col[data-date="${toKey(now)}"]`);
  if (!col) return;
  const line = el('div', 'now-line');
  line.setAttribute('aria-hidden', 'true');
  line.style.top = `${((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_H}px`;
  col.appendChild(line);
}

function scrollToMorning() { $('weekBody').scrollTop = 7 * HOUR_H - 8; }

// ----- Month view -----
function renderMonth() {
  $('monthHead').innerHTML = WEEKDAYS
    .map((w) => `<div><span class="long">${w.toUpperCase()}</span><span class="short">${w[0]}</span></div>`)
    .join('');

  const first = firstOfMonth(cursor);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const weeks = Math.ceil((first.getDay() + daysInMonth) / 7);
  const start = startOfWeek(first);
  const todayKey = toKey(new Date());
  const grid = $('monthGrid');
  grid.style.gridTemplateRows = `repeat(${weeks}, minmax(96px, 1fr))`;
  grid.replaceChildren();

  for (let i = 0; i < weeks * 7; i++) {
    const d = addDays(start, i);
    const key = toKey(d);
    const cell = el('div', 'm-cell');
    cell.setAttribute('role', 'listitem');
    cell.dataset.date = key;
    if (d.getMonth() !== first.getMonth()) cell.classList.add('other');
    if (key === todayKey) cell.classList.add('today');
    cell.appendChild(dayButton(d, key === todayKey));

    const list = eventsOn(key);
    list.slice(0, MAX_VISIBLE).forEach((ev) => cell.appendChild(chip(ev)));
    if (list.length > MAX_VISIBLE) {
      const more = el('button', 'more', `+${list.length - MAX_VISIBLE} more`);
      more.type = 'button';
      more.dataset.date = key;
      more.setAttribute('aria-label', `${list.length - MAX_VISIBLE} more events on ${longDate(d)}`);
      cell.appendChild(more);
    }
    grid.appendChild(cell);
  }
}

// ----- Sidebar -----
function renderMini() {
  $('miniTitle').textContent = miniMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const grid = $('miniGrid');
  grid.replaceChildren();
  WEEKDAYS.forEach((w) => {
    const s = el('span', 'mini-wd', w[0]);
    s.setAttribute('aria-hidden', 'true');
    grid.appendChild(s);
  });
  const start = startOfWeek(miniMonth);
  const todayKey = toKey(new Date());
  const cursorKey = toKey(cursor);
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i);
    const key = toKey(d);
    const b = el('button', 'mini-day', d.getDate());
    b.type = 'button';
    b.dataset.date = key;
    b.setAttribute('aria-label', longDate(d));
    if (d.getMonth() !== miniMonth.getMonth()) b.classList.add('other');
    if (key === cursorKey) b.classList.add('selected');
    if (key === todayKey) { b.classList.add('today'); b.setAttribute('aria-current', 'date'); }
    grid.appendChild(b);
  }
}

function renderCalList() {
  const ul = $('calList');
  ul.replaceChildren();
  CALENDARS.forEach((cal) => {
    const li = el('li');
    const label = el('label', 'cal-item');
    const box = el('input');
    box.type = 'checkbox';
    box.checked = !hidden.has(cal.id);
    box.dataset.cal = cal.id;
    box.style.accentColor = cal.color;
    label.append(box, el('span', null, cal.name));
    li.appendChild(label);
    ul.appendChild(li);
  });
  $('fCal').innerHTML = CALENDARS.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
}

function sidebarIsOpen() {
  return isNarrow()
    ? document.body.classList.contains('sidebar-open')
    : !document.body.classList.contains('sidebar-collapsed');
}

function setSidebar(open) {
  if (isNarrow()) {
    document.body.classList.toggle('sidebar-open', open);
    $('scrim').hidden = !open;
    if (open) $('createBtn').focus();
  } else {
    document.body.classList.toggle('sidebar-collapsed', !open);
  }
  $('menuBtn').setAttribute('aria-expanded', String(open));
}

function closeSidebarIfOverlay() {
  if (isNarrow() && sidebarIsOpen()) setSidebar(false);
}

// ---------- Navigation ----------
function goTo(date) {
  cursor = startOfDay(date);
  render();
}
function shift(dir) {
  goTo(view === 'week'
    ? addDays(cursor, 7 * dir)
    : new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1));
}
function setView(v) {
  view = v;
  store.set(VIEW_KEY, v);
  render();
  if (v === 'week') scrollToMorning();
}

// ---------- Dialogs (focus kept inside, restored on close) ----------
let lastFocus = null;
let lastFocusDate = null;

function showDialog(box, focusEl) {
  lastFocus = document.activeElement;
  lastFocusDate = lastFocus?.closest?.('[data-date]')?.dataset.date || null;
  box.hidden = false;
  document.querySelectorAll('.topbar, .layout').forEach((n) => (n.inert = true));
  focusEl.focus();
}

function hideDialog(box) {
  box.hidden = true;
  document.querySelectorAll('.topbar, .layout').forEach((n) => (n.inert = false));
  if (lastFocus?.isConnected) lastFocus.focus();
  else if (lastFocusDate) document.querySelector(`#main .day-num[data-date="${lastFocusDate}"]`)?.focus();
}

function openModal({ date, startTime = '', endTime = '', event } = {}) {
  editingId = event ? event.id : null;
  $('modalTitle').textContent = event ? 'Edit event' : 'Add event';
  $('fTitle').value = event ? event.title : '';
  $('fDate').value = event ? event.date : (date || toKey(cursor));
  $('fCal').value = event ? calOf(event).id : (CALENDARS.find((c) => !hidden.has(c.id)) || CALENDARS[0]).id;
  $('fStart').value = event ? event.startTime || '' : startTime;
  $('fEnd').value = event ? event.endTime || '' : endTime;
  $('fDesc').value = event?.description || '';
  $('deleteBtn').hidden = !event;
  clearErrors();
  showDialog($('modal'), $('fTitle'));
}

function openEditById(id) {
  const ev = events.find((x) => x.id === id);
  if (ev) openModal({ event: ev });
}

function closeModal() {
  hideDialog($('modal'));
  editingId = null;
}

function openDayPanel(key) {
  dayPanelDate = key;
  $('dayTitle').textContent = longDate(fromKey(key));
  const list = $('dayList');
  list.replaceChildren();
  const dayEvents = eventsOn(key);
  if (!dayEvents.length) list.appendChild(el('li', 'empty', 'No events.'));
  dayEvents.forEach((ev) => {
    const btn = el('button');
    btn.type = 'button';
    btn.dataset.id = ev.id;
    btn.style.setProperty('--c', calOf(ev).color);
    const dot = el('span', 'dot');
    dot.setAttribute('aria-hidden', 'true');
    btn.append(dot, el('span', 'time', timeText(ev)), el('span', 'name', ev.title),
      el('span', 'sr-only', `, ${calOf(ev).name} calendar`));
    const li = el('li');
    li.appendChild(btn);
    list.appendChild(li);
  });
  showDialog($('dayModal'), $('dayAddBtn'));
}

function closeDayPanel() {
  hideDialog($('dayModal'));
  dayPanelDate = null;
}

// ---------- Validation ----------
function readForm() {
  return {
    title: $('fTitle').value.trim(),
    date: $('fDate').value,
    calendar: CALENDARS.some((c) => c.id === $('fCal').value) ? $('fCal').value : CALENDARS[0].id,
    startTime: $('fStart').value,
    endTime: $('fEnd').value,
    description: $('fDesc').value.trim(),
  };
}

function validate(data) {
  const errors = {};
  if (!data.title) errors.title = 'Title is required.';
  else if (data.title.length > 100) errors.title = 'Title must be 100 characters or fewer.';
  if (!data.date) errors.date = 'Date is required.';
  else if (!isValidDateKey(data.date)) errors.date = 'Enter a valid date.';
  if (data.endTime && !data.startTime) errors.time = 'Add a start time, or clear the end time.';
  else if (data.startTime && data.endTime && data.endTime <= data.startTime) {
    errors.time = 'End time must be after start time.';
  }
  return errors;
}

const FIELD_INPUTS = { title: ['fTitle'], date: ['fDate'], time: ['fStart', 'fEnd'] };

function showErrors(errors) {
  for (const field of Object.keys(FIELD_INPUTS)) {
    const msg = errors[field] || '';
    document.querySelector(`.error[data-for="${field}"]`).textContent = msg;
    FIELD_INPUTS[field].forEach((id) => {
      $(id).classList.toggle('invalid', !!msg);
      if (msg) $(id).setAttribute('aria-invalid', 'true');
      else $(id).removeAttribute('aria-invalid');
    });
  }
}

const clearErrors = () => showErrors({});

// ---------- Create / update / delete ----------
function handleSubmit(e) {
  e.preventDefault();
  const data = readForm();
  const errors = validate(data);
  showErrors(errors);
  const firstBad = Object.keys(FIELD_INPUTS).find((f) => errors[f]);
  if (firstBad) return $(FIELD_INPUTS[firstBad][0]).focus();

  if (editingId) {
    const idx = events.findIndex((ev) => ev.id === editingId);
    if (idx !== -1) events[idx] = { ...events[idx], ...data };
  } else {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    events.push({ id, ...data });
  }
  saveEvents();
  render();       // rebuild first so focus can return to the new day button
  closeModal();
}

function handleDelete() {
  if (!editingId || !confirm('Delete this event?')) return;
  events = events.filter((ev) => ev.id !== editingId);
  saveEvents();
  render();
  closeModal();
}

// ---------- Wiring ----------
$('menuBtn').addEventListener('click', () => setSidebar(!sidebarIsOpen()));
$('scrim').addEventListener('click', () => setSidebar(false));
$('todayBtn').addEventListener('click', () => goTo(new Date()));
$('prevBtn').addEventListener('click', () => shift(-1));
$('nextBtn').addEventListener('click', () => shift(1));
$('viewSelect').addEventListener('change', (e) => setView(e.target.value));
$('createBtn').addEventListener('click', () => { closeSidebarIfOverlay(); openModal(); });

$('miniPrev').addEventListener('click', () => {
  miniMonth = new Date(miniMonth.getFullYear(), miniMonth.getMonth() - 1, 1);
  renderMini();
});
$('miniNext').addEventListener('click', () => {
  miniMonth = new Date(miniMonth.getFullYear(), miniMonth.getMonth() + 1, 1);
  renderMini();
});
$('miniGrid').addEventListener('click', (e) => {
  const b = e.target.closest('.mini-day');
  if (!b) return;
  closeSidebarIfOverlay();
  goTo(fromKey(b.dataset.date));
});

$('calList').addEventListener('change', (e) => {
  const id = e.target.dataset.cal;
  if (!id) return;
  if (e.target.checked) hidden.delete(id); else hidden.add(id);
  store.set(HIDDEN_KEY, [...hidden]);
  render();
});

$('main').addEventListener('click', (e) => {
  const evBtn = e.target.closest('[data-id]');
  if (evBtn) return openEditById(evBtn.dataset.id);
  const dayBtn = e.target.closest('.day-num');
  if (dayBtn) return openDayPanel(dayBtn.dataset.date);
  const more = e.target.closest('.more');
  if (more) return openDayPanel(more.dataset.date);

  const cell = e.target.closest('.m-cell');
  if (cell) {
    const key = cell.dataset.date;
    // On phones events are tiny dots, so tapping a busy day lists them instead.
    if (isMobile() && eventsOn(key).length) return openDayPanel(key);
    return openModal({ date: key });
  }
  const ad = e.target.closest('.ad-cell');
  if (ad) return openModal({ date: ad.dataset.date });

  const col = e.target.closest('.day-col');
  if (col) {
    const y = e.clientY - col.getBoundingClientRect().top;
    const h = Math.min(23, Math.max(0, Math.floor(y / HOUR_H)));
    openModal({ date: col.dataset.date, startTime: `${pad(h)}:00`, endTime: h < 23 ? `${pad(h + 1)}:00` : '' });
  }
});

// Arrow keys move between day buttons (left/right = 1 day, up/down = 1 week in month view).
$('main').addEventListener('keydown', (e) => {
  const btn = e.target.closest('.day-num');
  if (!btn) return;
  const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: view === 'month' ? -7 : 0, ArrowDown: view === 'month' ? 7 : 0 }[e.key];
  if (!step) return;
  e.preventDefault();
  const target = addDays(fromKey(btn.dataset.date), step);
  const find = () => $(`${view}View`).querySelector(`.day-num[data-date="${toKey(target)}"]`);
  if (!find()) goTo(target);
  find()?.focus();
});

$('dayList').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-id]');
  if (!btn) return;
  const ev = events.find((x) => x.id === btn.dataset.id);
  closeDayPanel();
  if (ev) openModal({ event: ev });
});
$('dayAddBtn').addEventListener('click', () => {
  const key = dayPanelDate;
  closeDayPanel();
  openModal({ date: key });
});
$('dayCloseBtn').addEventListener('click', closeDayPanel);
$('dayModal').addEventListener('click', (e) => { if (e.target === $('dayModal')) closeDayPanel(); });

$('eventForm').addEventListener('submit', handleSubmit);
$('cancelBtn').addEventListener('click', closeModal);
$('deleteBtn').addEventListener('click', handleDelete);
$('modal').addEventListener('click', (e) => { if (e.target === $('modal')) closeModal(); });

// Re-validate live once errors are visible so they clear as the user fixes them.
$('eventForm').addEventListener('input', () => {
  if (document.querySelector('.error:not(:empty)')) showErrors(validate(readForm()));
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!$('modal').hidden) closeModal();
  else if (!$('dayModal').hidden) closeDayPanel();
  else if (isNarrow() && sidebarIsOpen()) { setSidebar(false); $('menuBtn').focus(); }
});

// Reset the sidebar state when crossing the tablet breakpoint; refresh the title format at the phone one.
window.matchMedia('(max-width: 900px)').addEventListener('change', () => {
  document.body.classList.remove('sidebar-open');
  $('scrim').hidden = true;
  $('menuBtn').setAttribute('aria-expanded', String(sidebarIsOpen()));
});
window.matchMedia('(max-width: 600px)').addEventListener('change', () => {
  $('periodTitle').textContent = periodTitle();
});

// Move the current-time line every minute; re-render when the day changes.
setInterval(() => {
  const key = toKey(new Date());
  if (key !== todayKeyCache) { todayKeyCache = key; render(); } else updateNowLine();
}, 60 * 1000);

// ---------- Start ----------
renderCalList();
$('menuBtn').setAttribute('aria-expanded', String(sidebarIsOpen()));
render();
scrollToMorning();
