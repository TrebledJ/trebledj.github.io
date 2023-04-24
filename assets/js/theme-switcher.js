let defaultTheme = "dark";

function modeInit() {
  let currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark") {
    setMode("dark");
  } else if (currentTheme === "light") {
    setMode("light");
  } else {
    setMode(defaultTheme);
  }

  // Set switch to correct setting on load.
  document.getElementById('theme-toggle').checked = (currentTheme === "light");
}

function modeSwitcher() {
  let currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark") {
    setMode("light");
    if (reloadDisqus)
      reloadDisqus();
  } else if (currentTheme === "light") {
    setMode("dark");
    if (reloadDisqus)
      reloadDisqus();
  } else {
    setMode(defaultTheme);
  }
}

function setMode(mode) {
  if (mode === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  } else if (mode === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
  }
}
