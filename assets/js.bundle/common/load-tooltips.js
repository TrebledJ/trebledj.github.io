const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
// eslint-disable-next-line no-undef
[...tooltips].forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
