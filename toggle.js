document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.toggle');
  toggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', toggle.checked);
  });
});