const btnBackToTop = $('#btn-back-to-top');

const backtotopObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            btnBackToTop.fadeOut();
        } else {
            btnBackToTop.fadeIn();
        }
    });
}, {
    rootMargin: '250px',
    threshold: 0,
});

backtotopObserver.observe(document.querySelector('#top-of-the-morning-to-you'));

btnBackToTop.on('click', () => {
    document.body.scrollIntoView({
        behavior: 'smooth',
    });
});