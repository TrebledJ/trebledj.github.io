// Load SoundCloud embeds (dynamic src).
const visual = $(window).width() < 600;

const options = {
    rootMargin: '300px', // Lazy-load when the iframe is 300px away from the viewport.
    threshold: 0,
};

// Set up an intersection observer to detect when tracks are nearly visible.
const trackObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const track = entry.target;
            let src = track.dataset.src;
            if (visual)
                src += '&visual=true'; // Compressed view, more suitable for small screens.
            track.src = src;
            track.classList.remove('lazy');
            observer.unobserve(track);
        }
    });
}, options);

// Observe tracks for lazy loading.
const tracks = document.querySelectorAll('.soundcloud-track.lazy');
tracks.forEach(e => trackObserver.observe(e));