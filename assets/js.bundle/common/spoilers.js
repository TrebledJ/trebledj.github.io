document.querySelectorAll("span.spoiler").forEach(el => {
    el.addEventListener('keyup', (evt) => {
        if (evt.key === 'Enter' || evt.keyCode === 13) {
            el.classList.add('active');
        }
    });
    el.addEventListener('click', () => {
        el.classList.add('active');
    });
});

