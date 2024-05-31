/* eslint-disable no-undef */

document.addEventListener('keydown', function (event) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault();
    $('#search-modal').modal('show');
  }
});

$(() => {
  /* Scroll Progress */
  $(document).on('scroll', () => {
    const docElem = document.documentElement;
    const docBody = document.body;
    const scrollTop = (docBody.scrollTop || docElem.scrollTop);
    const height = docElem.scrollHeight - docElem.clientHeight;

    const progressBar = document.querySelector('#scroll-progress-bar');
    const progress = scrollTop / height * 100;
    progressBar.style.setProperty('--progress', `${Math.max(progress, 0)}%`);
  });

  /* Scroll to Top */
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

  // Add a special class for dropdown items.
  $('#btn-mobile-toc nav.toc a').addClass('dropdown-item');

  // Go to Tag Button in /posts/.
  const gototagsButton = $('#btn-go-to-tags');
  const tagsHeading = document.querySelector('#tags');
  gototagsButton.on('click', () => {
    tagsHeading.scrollIntoView({
      behavior: 'smooth',
    });
  });

  if (tagsHeading) {
    const tagsSection = document.querySelector('.sticky-right');
    const gototagObserver = new IntersectionObserver((entries, _observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gototagsButton.fadeOut();
        } else {
          gototagsButton.fadeIn();
        }
      });
    }, {
      rootMargin: '0px', // Lazy-load when the iframe is 300px away from the viewport.
      threshold: 0,
    });

    gototagObserver.observe(tagsSection);
  }

  /* Load Tooltips */
  const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  [...tooltips].forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

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

  // Carousel auto-label update.
  $('.carousel').each(function () {
    // Update labels on slide.
    const id = $(this).attr('id');
    $(this).on('slide.bs.carousel', event => {
      $(`#${id}-tab${event.from + 1}-label`).removeClass('active-tab');
      $(`#${id}-tab${event.to + 1}-label`).addClass('active-tab');
    });
  });
});
