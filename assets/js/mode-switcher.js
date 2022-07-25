(() => {
  document.documentElement.setAttribute('data-theme', 'dark');
  sessionStorage.setItem('theme', 'dark');
})();

function modeSwitcher() {
  let currentTheme = sessionStorage.getItem("theme");
  if (currentTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "light");
    sessionStorage.setItem("theme", "light");
  } else if (currentTheme === "light") {
    document.documentElement.setAttribute("data-theme", "dark");
    sessionStorage.setItem("theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    sessionStorage.setItem("theme", "dark");
  }
}
