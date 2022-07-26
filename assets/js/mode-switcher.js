function modeInit() {
  let currentTheme = sessionStorage.getItem("theme");
  if (currentTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    sessionStorage.setItem("theme", "dark");
  } else if (currentTheme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    sessionStorage.setItem("theme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    sessionStorage.setItem("theme", "dark");
  }

  // Set switch to correct setting on load.
  $("#theme-toggle")[0].checked = (currentTheme === "light");
}

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
