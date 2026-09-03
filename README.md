# CTDE Computer Laboratory Website

Official website for the Computer Laboratory of the **College of Technological and Developmental Education (CTDE)**, Camarines Sur Polytechnic Colleges (CSPC).

A static, no-backend website providing lab information, resources, and a time-slot reservation system for students.

---

## 🌐 Live Site

Published via GitHub Pages: `https://<your-username>.github.io/<repo-name>/`
*(replace with your actual custom domain once set up, e.g. `ctde.cspc.edu.ph`)*

---

## 📄 Pages

| File | Description |
|---|---|
| `index.html` | Home page — facilities overview, lab photo gallery, resources (PDF manual), software list, weekly class schedule, and laboratory rules. |
| `contact.html` | Contact page — Laboratory In-Charge and Technician profiles, photos, Google Certified Educator badges, office details. |
| `booking.html` | Lab reservation system — students pick a date, see hourly availability, and are routed to a Google Form to reserve an open slot. |

---

## 📁 Required Folder Structure

```
/
├── index.html
├── contact.html
├── booking.html
├── Pictures/
│   ├── CSPC-Seal.png
│   ├── CTDE 1.JPG
│   ├── CTDE 2.JPG
│   ├── CTDE 3.JPG
│   ├── CTDE 4.JPG
│   ├── Romeo-Sotto.jpg
│   ├── Matt-Glenn-Laynesa.jpg
│   ├── Google-Cert-1.png
│   └── Google-Cert-2.png
└── PDF/
    └── CSPC ICT Laboratory Manual.pdf
```

All image and PDF filenames must match exactly (including spaces and capitalization) — the HTML references these paths directly.

---

## ⚙️ Configuring the Reservation System (`booking.html`)

The booking page has no backend of its own — it reads live reservation counts from a Google Form's linked response Spreadsheet. All settings live in the `<script>` block near the bottom of `booking.html`.

| Setting | What it does |
|---|---|
| `GOOGLE_FORM_URL` | Link to the reservation Google Form (the public "fill out this form" link). |
| `SHEET_ID` | The ID of the Form's linked response Google Sheet (from its URL). |
| `SHEET_TAB_NAME` | The response tab name, usually `"Form Responses 1"`. |
| `TIME_COLUMN` | Must exactly match the Form's Time question title (e.g. `"Time Options"`). |
| `DATE_COLUMN` | Must exactly match the Form's Date question title (e.g. `"Reservation Date"`). |
| `OCCUPIED_RANGES` | Recurring weekly class hours that block out the lab, written as plain ranges (e.g. `"1:00 PM to 4:00 PM"`). |
| `SLOT_LIMIT` | Max reservations allowed per hour, per specific date (default `20`). |
| `FORM_TIME_ENTRY` / `FORM_DATE_ENTRY_BASE` | Optional — pre-fills the Time/Date fields when a student clicks a slot, from the Form's "Get pre-filled link" entry IDs. |

### Requirements on the Google Form/Sheet side
- The response Sheet must be shared as **Anyone with the link → Viewer** (read-only) so the page can fetch counts.
- The Form should be restricted to your institution's Google accounts (Settings → Responses → "Restrict to users in [domain]") to prevent outside spam.
- **Choice Eliminator 2** (Form add-on) is recommended as the actual hard cap enforcement — the live counter on the page is a convenience display, not a guaranteed limit on its own.

---

## 🚀 Publishing (GitHub Pages)

1. Push all files (including `Pictures/` and `PDF/`) to the repository's default branch.
2. Go to **Settings → Pages** → set the source to that branch.
3. Enable **Enforce HTTPS**.
4. *(Optional)* Add a custom domain (e.g. a subdomain from your school's IT team, like `ctde.cspc.edu.ph`) under **Settings → Pages → Custom domain**.

---

## 🔒 Security Notes

- Only collaborators added under **Settings → Collaborators** can push changes — enable **2FA** on all contributor accounts.
- No API keys or secrets are used anywhere in this site — everything client-side is inherently public/viewable, by design of how browsers work.
- The reservation system's real integrity relies on the Google Form's domain restriction and the Sheet's Viewer-only sharing — not on anything in the HTML/JS.

---

## 👤 Maintained By

- **Computer Laboratory Technician:** Matt Glenn L. Laynesa, LPT

---

## 📜 License

For educational use only. Not licensed for external redistribution.
