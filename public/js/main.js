// small client nicety: focus title input on load
window.addEventListener('load', () => {
  const t = document.getElementById('title');
  if (t) t.focus();
});
