/* =====================================================================
   NAV TAB VISIBILITY CONTROL
   Edit ONLY this file to hide/show a nav tab across ALL pages at once.
   This works because every page (index.html, contact.html, booking.html,
   forms.html) loads this same script.
========================================================================*/

// List the exact href value of each tab you want hidden, e.g.:
//   HIDDEN_TABS = ["forms.html", "index.html#resources"];
// Leave the array empty to show every tab normally.
const HIDDEN_TABS = [
   "index.html#resources"
];

document.addEventListener("DOMContentLoaded", () => {
  HIDDEN_TABS.forEach(href => {
    document.querySelectorAll(`nav a[href="${href}"]`).forEach(link => {
      const li = link.closest("li");
      if (li) li.style.display = "none";
    });
  });
});
