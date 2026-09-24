/* =====================================================================
   NAV TAB VISIBILITY CONTROL
   Edit ONLY this file to hide/show a nav tab across ALL pages at once.
   This works because every page (index.html, contact.html, booking.html,
   forms.html) loads this same script.

   IMPORTANT: a tab's href is written differently depending on which page
   it's on. For a section inside index.html (like Resources or Schedule):
     - On index.html itself, the link is written as "#resources"
     - On every OTHER page, the link is written as "index.html#resources"
   List BOTH forms below so it gets hidden everywhere consistently.
========================================================================*/

const HIDDEN_TABS = [
  "#resources",
  "index.html#resources",
];

document.addEventListener("DOMContentLoaded", () => {
  HIDDEN_TABS.forEach(href => {
    document.querySelectorAll(`nav a[href="${href}"]`).forEach(link => {
      const li = link.closest("li");
      if (li) li.style.display = "none";
    });
  });
});
