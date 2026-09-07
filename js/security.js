// NOTE: this only discourages casual right-click / DevTools shortcuts.
// It is not real security — see the site's README for the actual
// protections (GitHub access control, 2FA, Google Form domain restriction).
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
  const k = e.key.toUpperCase();
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && (k === 'I' || k === 'J' || k === 'C')) ||
    (e.ctrlKey && k === 'U')
  ) {
    e.preventDefault();
  }
});
