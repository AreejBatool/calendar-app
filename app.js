// Simple month-view calendar. Events are stored as JSON in localStorage.

const STORAGE_KEY = 'calendarEvents';
const MAX_VISIBLE = 3;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const $ = (id) => document.getElementById(id);

let events = loadEvents();
let viewYear, viewMonth;   // month currently displayed (month is 0-11)
let editingId = null;      // id of the event being edited, or null when adding

// ---------- Storage ----------
function loadEvents() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveEvents() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    alert('Could not save events (storage unavailable).');
  }
}

// ---------- Date helpers ----------
const pad = (n) => String(n).padStart(2, '0');
const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function isValidDateKey(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

// Events for one day, sorted by start time (all-day / untimed first).
function eventsOn(key) {
  return events
    .filter((e) => e.date === key)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
}

const isMobile = () => window.matchMedia('(max-width: 600px)').matches;

// ---------- Rendering ----------
function renderWeekdays() {
  $('weekdays').innerHTML = WEEKDAYS
    .map((w) => `<div><span class="long">${w}</span><span class="short">${w[0]}</span></div>`)
    .join('');
}

function render() {
  const first = new Date(viewYear, viewMonth, 1);
  $('monthTitle').textContent = first.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  // Grid starts on the Sunday on or before the 1st; always 6 weeks (42 cells).
  const start = new Date(viewYear, viewMonth, 1 - first.getDay());
  const todayKey = toKey(new Date());
  const grid = $('grid');
  grid.innerHTML = '';

  for (let i = 0; i < 42; i++) {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const key = toKey(day);

    const cell = document.createElement('div');
    cell.className = 'cell';
    if (day.getMonth() !== viewMonth) cell.classList.add('other');
    if (key === todayKey) cell.classList.add('today');
    cell.dataset.date = key;

    const num = document.createElement('span');
    num.className = 'day-num';
    num.textContent = day.getDate();
    cell.appendChild(num);

    const dayEvents = eventsOn(key);

    dayEvents.slice(0, MAX_VISIBLE).forEach((ev) => {
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.dataset.id = ev.id;
      chip.textContent = (ev.startTime ? ev.startTime + ' ' : '') + ev.title;
      chip.title = chip.textContent;
      cell.appendChild(chip);
    });

    if (dayEvents.length > MAX_VISIBLE) {
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'more';
      more.textContent = `+${dayEvents.length - MAX_VISIBLE} more`;
      cell.appendChild(more);
    }

    grid.appendChild(cell);
  }
}

// ---------- Navigation ----------
function goToMonth(year, month) {
  const d = new Date(year, month, 1); // normalizes month overflow (-1 / 12)
  viewYear = d.getFullYear();
  viewMonth = d.getMonth();
  render();
}

function goToToday() {
  const now = new Date();
  goToMonth(now.getFullYear(), now.getMonth());
}

// ---------- Modal ----------
function openModal({ date, event } = {}) {
  editingId = event ? event.id : null;
  $('modalTitle').textContent = event ? 'Edit event' : 'Add event';
  $('fTitle').value = event ? event.title : '';
  $('fDate').value = event ? event.date : (date || toKey(new Date()));
  $('fStart').value = event?.startTime || '';
  $('fEnd').value = event?.endTime || '';
  $('fDesc').value = event?.description || '';
  $('deleteBtn').hidden = !event;
  clearErrors();
  $('modal').hidden = false;
  $('fTitle').focus();
}

function closeModal() {
  $('modal').hidden = true;
  editingId = null;
}

// ---------- Day-events panel ----------
let dayPanelDate = null;

function openDayPanel(key) {
  dayPanelDate = key;
  const [y, m, d] = key.split('-').map(Number);
  $('dayTitle').textContent = new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const list = $('dayList');
  list.innerHTML = '';
  const dayEvents = eventsOn(key);
  if (!dayEvents.length) {
    list.innerHTML = '<li class="empty">No events.</li>';
  }
  dayEvents.forEach((ev) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.id = ev.id;
    const time = document.createElement('span');
    time.className = 'time';
    time.textContent = ev.startTime ? ev.startTime + (ev.endTime ? '–' + ev.endTime : '') : 'All day';
    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = ev.title;
    btn.append(time, name);
    li.appendChild(btn);
    list.appendChild(li);
  });

  $('dayModal').hidden = false;
  $('dayAddBtn').focus();
}

function closeDayPanel() {
  $('dayModal').hidden = true;
  dayPanelDate = null;
}

// ---------- Validation ----------
function readForm() {
  return {
    title: $('fTitle').value.trim(),
    date: $('fDate').value,
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
  if (data.startTime && data.endTime && data.endTime <= data.startTime) {
    errors.time = 'End time must be after start time.';
  }
  return errors;
}

const FIELD_INPUTS = { title: ['fTitle'], date: ['fDate'], time: ['fStart', 'fEnd'] };

function showErrors(errors) {
  for (const field of Object.keys(FIELD_INPUTS)) {
    const msg = errors[field] || '';
    document.querySelector(`.error[data-for="${field}"]`).textContent = msg;
    FIELD_INPUTS[field].forEach((id) => $(id).classList.toggle('invalid', !!msg));
  }
}

const clearErrors = () => showErrors({});

// ---------- CRUD ----------
function handleSubmit(e) {
  e.preventDefault();
  const data = readForm();
  const errors = validate(data);
  showErrors(errors);
  if (Object.keys(errors).length) return;

  if (editingId) {
    const idx = events.findIndex((ev) => ev.id === editingId);
    if (idx !== -1) events[idx] = { ...events[idx], ...data };
  } else {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    events.push({ id, ...data });
  }
  saveEvents();
  closeModal();
  render();
}

function handleDelete() {
  if (!editingId || !confirm('Delete this event?')) return;
  events = events.filter((ev) => ev.id !== editingId);
  saveEvents();
  closeModal();
  render();
}

// ---------- Wiring ----------
$('prevBtn').addEventListener('click', () => goToMonth(viewYear, viewMonth - 1));
$('nextBtn').addEventListener('click', () => goToMonth(viewYear, viewMonth + 1));
$('todayBtn').addEventListener('click', goToToday);
$('addBtn').addEventListener('click', () => openModal());

$('grid').addEventListener('click', (e) => {
  const cell = e.target.closest('.cell');
  if (!cell) return;
  const key = cell.dataset.date;

  if (e.target.closest('.more')) return openDayPanel(key);

  const chip = e.target.closest('.chip');
  if (chip) {
    const ev = events.find((x) => x.id === chip.dataset.id);
    if (ev) openModal({ event: ev });
    return;
  }

  // On small screens events are tiny dots, so a tap on a busy day lists them instead.
  if (isMobile() && eventsOn(key).length) return openDayPanel(key);
  openModal({ date: key });
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
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!$('modal').hidden) closeModal();
  else if (!$('dayModal').hidden) closeDayPanel();
});

// Re-validate live once errors are visible so they clear as the user fixes them.
$('eventForm').addEventListener('input', () => {
  if (document.querySelector('.error:not(:empty)')) showErrors(validate(readForm()));
});

renderWeekdays();
goToToday();
