document.querySelectorAll("span.spoiler").forEach(el => {
    el.addEventListener('click', () => {
        el.classList.add('active');
    });
});

