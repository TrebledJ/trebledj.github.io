$(() => {
  /* Scroll Progress */
  let debounce = false;
  $(document).on('scroll', () => {
    if (debounce) return;
    debounce = true;

    const docElem = document.documentElement;
    const docBody = document.body;
    const scrollTop = (docBody.scrollTop || docElem.scrollTop);
    const height = docElem.scrollHeight - docElem.clientHeight;

    progress = scrollTop / height * 100;

    if (progress > 0) {
      progressBar = document.querySelector('#scroll-progress-bar');
      progressBar.style.setProperty('--progress', `${progress}%`);
    } else {
      progressBar.style.setProperty('--progress', '0%');
    }

    debounce = false;
  });

  /* Scroll to Top */
  const btnBackToTop = $('#btn-back-to-top');
  function check() {
    if ($(this).scrollTop() > 250) {
      btnBackToTop.fadeIn();
    } else {
      btnBackToTop.fadeOut();
    }
  }

  $(window).on('scroll', () => {
    check();
  });

  check(); // Check on doc ready, e.g. if page was reloaded, we could already be in the middle of the page.

  btnBackToTop.on('click', () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  });

  /* Load Tooltips */
  $('body').tooltip({ selector: '[data-toggle=tooltip]' });

  // Compress SoundCloud embed for small screens.
  if ($(window).width() < 600) {
    const s = $('.soundcloud-track iframe');
    s.each(function () {
      $(this).attr('src', `${$(this).attr('src')}&visual=true`);
    });
  }

  $('.carousel').each(function () {
    // Update labels on slide.
    const id = $(this).attr('id');
    $(this).on('slide.bs.carousel', (event) => {
      $(`#${id}-tab${event.from + 1}-label`).removeClass('bg-primary text-white');
      $(`#${id}-tab${event.to + 1}-label`).addClass('bg-primary text-white');
    });
  });

  const lightboxCommonOptions = {
    type: 'image',
    fixedContentPos: false,
    callbacks: {
      open() {
        $('body').addClass('noscroll');
      },
      close() {
        $('body').removeClass('noscroll');
      },
    },
  };

  $('.lightbox-single').magnificPopup({
    ...lightboxCommonOptions,
  });

  $('.lightbox-gallery').each(function () {
    $(this).find('a').magnificPopup({
      gallery: {
        enabled: true,
      },
      ...lightboxCommonOptions,
    });
  });
});
