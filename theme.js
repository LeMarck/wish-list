(() => {
  const root = document.documentElement;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let preference;
  try {
    const saved = localStorage.getItem('wishlist-theme');
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch {
    // The switch still works when browser storage is unavailable.
  }

  function applyTheme() {
    const theme = preference || (systemTheme.matches ? 'dark' : 'light');
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content =
      theme === 'dark' ? '#19181f' : '#f7f6f2';
    const button = document.querySelector('#theme-toggle');
    if (button) {
      const label =
        theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему';
      button.setAttribute('aria-label', label);
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.title = label;
    }
  }

  applyTheme();
  systemTheme.addEventListener('change', () => {
    if (!preference) applyTheme();
  });
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    document.querySelector('#theme-toggle').addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('wishlist-theme', preference);
      } catch {
        // Theme changes are available for the current page without storage.
      }
      applyTheme();
    });
  });
})();
