const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
[...tooltips].forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
