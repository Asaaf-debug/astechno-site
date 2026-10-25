"use strict";

// Keep the year current even when a static release spans a new year.
const currentYear = new Intl.DateTimeFormat("en", {
  year: "numeric",
  timeZone: "Europe/Amsterdam",
}).format(new Date());
document.querySelectorAll("[data-copyright-year]").forEach((element) => {
  element.textContent = currentYear;
  element.setAttribute("datetime", currentYear);
});

// Language links work without JavaScript. Preserve the section when switching.
document.querySelectorAll("[data-lang]").forEach((link) => {
  link.addEventListener("click", () => {
    const target = new URL(link.href);
    target.hash = window.location.hash;
    link.href = target.href;
  });
});
