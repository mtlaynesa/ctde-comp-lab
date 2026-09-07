/* ===================== CONFIGURE HERE ===================== */

// 1. Paste your Google Form URL below (the "Send" > link icon URL, e.g. https://forms.gle/xxxxxxxx
//    or the full https://docs.google.com/forms/d/e/.../viewform link).
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdXksKejl8XZhZNglcJRvBfBx-84_hpvsfW_usuvHnkQxngrg/viewform";

// 2. Optional: if your Google Form has "prefill" entry IDs, put them here
//    (Form > ⋮ menu > "Get pre-filled link" to find entry.XXXXXXX numbers).
//    Leave as null to skip prefilling that field.
const FORM_TIME_ENTRY = null;   // e.g. "entry.987654321"  (single value)
// Date questions in Google Forms use THREE sub-fields instead of one.
// Get these from "Get pre-filled link" the same way, but look for
// entry.XXXXXXX_year, entry.XXXXXXX_month, entry.XXXXXXX_day and just
// paste the common XXXXXXX number below (without _year/_month/_day).
const FORM_DATE_ENTRY_BASE = null; // e.g. "entry.555555555"

// 3. Days and hourly slots — MUST match your Form's exact answer choices.
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOURS = [
  { label: "8:00 - 9:00 AM",   start: "8:00 AM",  end: "9:00 AM" },
  { label: "9:00 - 10:00 AM",  start: "9:00 AM",  end: "10:00 AM" },
  { label: "10:00 - 11:00 AM", start: "10:00 AM", end: "11:00 AM" },
  { label: "11:00 - 12:00 PM", start: "11:00 AM", end: "12:00 PM" },
  { label: "12:00 - 1:00 PM",  start: "12:00 PM", end: "1:00 PM" },
  { label: "1:00 - 2:00 PM",   start: "1:00 PM",  end: "2:00 PM" },
  { label: "2:00 - 3:00 PM",   start: "2:00 PM",  end: "3:00 PM" },
  { label: "3:00 - 4:00 PM",   start: "3:00 PM",  end: "4:00 PM" },
  { label: "4:00 - 5:00 PM",   start: "4:00 PM",  end: "5:00 PM" }
];

// 4. Occupied hours — the ONLY place you need to edit this. Write each block as a
//    simple range in plain language, e.g. "1:00 PM to 4:00 PM". This automatically
//    blocks every overlapping hourly slot AND shows up in the "Occupied Hours" list
//    above — no need to list each hour separately. These repeat every week.
const OCCUPIED_RANGES = [
  { day: "Monday",    range: "8:00 AM to 12:00 PM" },
  { day: "Monday",    range: "1:00 PM to 4:00 PM" },
  { day: "Tuesday",   range: "8:00 AM to 12:00 PM" },
  { day: "Tuesday",   range: "1:00 PM to 5:00 PM" },
  { day: "Wednesday", range: "8:00 AM to 12:00 PM" },
  { day: "Wednesday", range: "1:00 PM to 4:00 PM" },
  { day: "Thursday",  range: "8:00 AM to 12:00 PM" },
  { day: "Thursday",  range: "1:00 PM to 5:00 PM" },
  { day: "Friday",    range: "8:00 AM to 12:00 PM" },
  { day: "Friday",    range: "1:00 PM to 4:00 PM" }
  // add more { day: "...", range: "... to ..." } entries as needed
];

// 5. Maximum number of reservations allowed per vacant slot, PER DATE
//    (e.g. Monday 9-10 AM allows 20 people on October 6, then resets to 0/20
//    again for October 13 — it does not accumulate forever).
const SLOT_LIMIT = 20;

// 6. LIVE COUNTS from your Google Form's response spreadsheet.
//    a) Add a "Date" question to your Form (Date question type).
//    b) Share the linked response Sheet: General access -> "Anyone with the
//       link" -> Viewer.
//    c) Copy the Sheet ID from its URL: .../spreadsheets/d/THIS_PART/edit
//    d) Copy the exact tab name at the bottom (usually "Form Responses 1").
//    e) Set TIME_COLUMN / DATE_COLUMN to your Form's EXACT question titles
//       (these become the column headers in the sheet). Day-of-week is
//       derived automatically from the date, so there's no Day column needed.
//    Leave SHEET_ID empty ("") to skip live fetching and use FALLBACK_COUNTS.
const SHEET_ID = "1d8VhcC2dBhZr6luPOrp0qO1IYJ-L4SUt3Y03-JF6LYQ";
const SHEET_TAB_NAME = "Form Responses 1";
const TIME_COLUMN = "Time Options";     // must match your Form's Time question title
const DATE_COLUMN = "Reservation Date"; // must match your Form's Date question title

// 7. Fallback counts used if live fetching is off or fails. Format:
//    "YYYY-MM-DD|Hour label": count. Only needed as a manual backup.
const FALLBACK_COUNTS = {
  // "2026-10-06|9:00 - 10:00 AM": 14,
};

/* =================== END CONFIGURATION ==================== */

// ---- time parsing helpers ----
function parseTimeToMinutes(t) {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let [, h, min, ampm] = m;
  h = parseInt(h, 10);
  min = parseInt(min, 10);
  ampm = ampm.toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

function parseRange(rangeStr) {
  const parts = rangeStr.split(/\s+to\s+/i);
  if (parts.length !== 2) return null;
  const start = parseTimeToMinutes(parts[0]);
  const end = parseTimeToMinutes(parts[1]);
  if (start === null || end === null) return null;
  return { start, end };
}

function buildOccupiedSlots() {
  const occupied = new Set();
  OCCUPIED_RANGES.forEach(({ day, range }) => {
    const r = parseRange(range);
    if (!r) { console.warn("booking.js: could not parse occupied range:", range); return; }
    HOURS.forEach(hour => {
      const hStart = parseTimeToMinutes(hour.start);
      const hEnd = parseTimeToMinutes(hour.end);
      if (hStart < r.end && hEnd > r.start) {
        occupied.add(`${day}|${hour.label}`);
      }
    });
  });
  return occupied;
}

function renderOccupiedList() {
  const list = document.getElementById("occupiedList");
  if (!OCCUPIED_RANGES.length) {
    list.innerHTML = `<li style="color:#16a34a;font-weight:600">No regular classes currently block out the lab.</li>`;
    return;
  }
  list.innerHTML = OCCUPIED_RANGES.map(({ day, range }) =>
    `<li><strong>${day}</strong>${range}</li>`
  ).join("");
}

// ---- date helpers ----
// Parse an <input type="date"> value ("YYYY-MM-DD") as a LOCAL date (avoids
// timezone off-by-one issues that plain `new Date(str)` can cause).
function parseLocalDate(isoStr) {
  const [y, m, d] = isoStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function isoDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function weekdayName(dateObj) {
  return dateObj.toLocaleDateString("en-US", { weekday: "long" });
}

// gviz encodes Date-typed cells' raw value as a string like "Date(2026,8,8)"
// (month is 0-indexed). Parse that directly so we're locale/format independent.
function parseGvizDate(v) {
  if (typeof v !== "string") return null;
  const m = v.match(/^Date\((\d+),(\d+),(\d+)/);
  if (!m) return null;
  const [, y, mo, d] = m.map(Number);
  return new Date(y, mo, d);
}

function buildFormLink(day, hour, dateObj) {
  let url = GOOGLE_FORM_URL;
  const params = [];
  if (FORM_TIME_ENTRY) params.push(FORM_TIME_ENTRY + "=" + encodeURIComponent(hour));
  if (FORM_DATE_ENTRY_BASE) {
    params.push(FORM_DATE_ENTRY_BASE + "_year=" + dateObj.getFullYear());
    params.push(FORM_DATE_ENTRY_BASE + "_month=" + (dateObj.getMonth() + 1));
    params.push(FORM_DATE_ENTRY_BASE + "_day=" + dateObj.getDate());
  }
  if (params.length) {
    url += (url.includes("?") ? "&" : "?") + params.join("&");
  }
  return url;
}

// ---- live data fetch: cache raw rows once, filter per selected date on demand ----
let liveRows = null; // array of { time, dateIso } or null if unavailable

function fetchLiveRows(onDone) {
  if (!SHEET_ID) { onDone(); return; }

  const callbackName = "__gvizCallback_" + Date.now();
  let settled = false;

  const finish = () => {
    if (settled) return;
    settled = true;
    delete window[callbackName];
    script.remove();
    onDone();
  };

  window[callbackName] = function (response) {
    try {
      const table = response.table;
      const cols = table.cols.map(c => (c.label || "").trim());
      const timeIdx = cols.indexOf(TIME_COLUMN);
      const dateIdx = cols.indexOf(DATE_COLUMN);
      if (timeIdx === -1 || dateIdx === -1) {
        console.warn("booking.js: TIME_COLUMN/DATE_COLUMN not found in sheet headers:", cols);
        finish();
        return;
      }
      const rows = [];
      table.rows.forEach(row => {
        const time = row.c[timeIdx] && row.c[timeIdx].v;
        const dateCell = row.c[dateIdx] && row.c[dateIdx].v;
        const dateObj = parseGvizDate(dateCell);
        if (!time || !dateObj) return;
        rows.push({ time, dateIso: isoDate(dateObj) });
      });
      liveRows = rows;
    } catch (e) {
      console.warn("booking.js: failed to parse sheet response", e);
    }
    finish();
  };

  const url = "https://docs.google.com/spreadsheets/d/" + encodeURIComponent(SHEET_ID) +
    "/gviz/tq?tqx=out:json;responseHandler:" + callbackName +
    "&headers=1&sheet=" + encodeURIComponent(SHEET_TAB_NAME);

  const script = document.createElement("script");
  script.src = url;
  script.onerror = finish;
  setTimeout(finish, 5000); // safety timeout if sheet isn't reachable
  document.body.appendChild(script);
}

function getCountsForDate(dateIso) {
  if (liveRows) {
    const counts = {};
    liveRows.forEach(r => {
      if (r.dateIso !== dateIso) return;
      counts[r.time] = (counts[r.time] || 0) + 1;
    });
    return counts;
  }
  // fallback: pull matching entries out of FALLBACK_COUNTS "date|time" keys
  const counts = {};
  Object.keys(FALLBACK_COUNTS).forEach(key => {
    const [d, tm] = key.split("|");
    if (d === dateIso) counts[tm] = FALLBACK_COUNTS[key];
  });
  return counts;
}

function renderDayView() {
  const picker = document.getElementById("datePick");
  const dateObj = parseLocalDate(picker.value);
  const day = weekdayName(dateObj);
  const dateIso = picker.value;

  document.getElementById("selectedDayLabel").textContent =
    DAYS.includes(day)
      ? `Showing availability for ${day}, ${dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
      : `The lab is closed on ${day}s — please pick a weekday (Mon–Fri).`;

  const table = document.getElementById("slotGrid");

  if (!DAYS.includes(day)) {
    table.innerHTML = "";
    return;
  }

  const occupiedSlots = buildOccupiedSlots();
  const counts = getCountsForDate(dateIso);

  let html = "<tr><th>Time</th><th>Status</th></tr>";
  HOURS.forEach(hour => {
    const key = `${day}|${hour.label}`;
    const count = counts[hour.label] || 0;
    html += `<tr><td class="time-col">${hour.label}</td>`;
    if (occupiedSlots.has(key)) {
      html += `<td><span class="slot occupied">Occupied</span></td>`;
    } else if (count >= SLOT_LIMIT) {
      html += `<td><span class="slot full">Full (${SLOT_LIMIT}/${SLOT_LIMIT})</span></td>`;
    } else {
      const link = buildFormLink(day, hour.label, dateObj);
      html += `<td><a class="slot" href="${link}" target="_blank" rel="noopener">Vacant (${count}/${SLOT_LIMIT})</a></td>`;
    }
    html += "</tr>";
  });
  table.innerHTML = html;

  const statusEl = document.getElementById("liveStatus");
  statusEl.textContent = liveRows
    ? "Counts last synced just now from the reservation form."
    : "Showing saved counts (live sync unavailable) — refresh to try again.";
}

// ---- init ----
renderOccupiedList();

const datePicker = document.getElementById("datePick");
const todayIso = isoDate(new Date());
datePicker.min = todayIso;
datePicker.value = todayIso;
datePicker.addEventListener("change", renderDayView);

document.getElementById("slotGrid").innerHTML =
  '<tr><td style="padding:20px;text-align:center;color:#64748b">Loading availability...</td></tr>';
fetchLiveRows(renderDayView);
