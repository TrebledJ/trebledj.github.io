$(() => {
  // --- Author Socials Button --- //
  const authorSocialButton = $('#post-author-container').find('button');
  authorSocialButton.on('click', () => {
    $('.social-item-list').toggleClass('hidden');
    authorSocialButton.toggleClass('open');
  });

  // --- Copy URL --- //
  $('#copy-link-button').on('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch (err) {
      console.error('Failed to copy: ', err);
      return;
    }

    $('.copied').css({ opacity: 1 });
    $('.copied').animate({ opacity: 0 }, 1000);
  });

  // --- Content Header -> Back to Top --- //
  $('#toc-content').on('click', () => {
    $('#btn-back-to-top').trigger('click');
  });

  // --- TOC Current Section Highlight --- //
  const headerOffset = 150;
  const sections = document.querySelectorAll('.post-article h2,.post-article h3');
  const mainNavLinks = document.querySelectorAll('#toc-sidebar nav.toc a');
  const mobileNavLinks = document.querySelectorAll('#btn-mobile-toc nav.toc a');

  if (mainNavLinks.length !== mobileNavLinks.length)
    console.warn("TOCs have different lengths?!? This shouldn't be much of an issue tho. (Hopefully.)");

  const { hash } = window.location;
  const articleEnd = document.querySelector('#end-of-article').offsetTop;

  const highlightLink = idx => {
    if (mainNavLinks[idx]) {
      mainNavLinks[idx].classList.add('active');
      mobileNavLinks[idx].classList.add('active');
    }
  };
  const lowlightLink = idx => {
    if (mainNavLinks[idx]) {
      mainNavLinks[idx].classList.remove('active');
      mobileNavLinks[idx].classList.remove('active');
    }
  };
  const removeAllActive = () => sections.forEach((_, i) => lowlightLink(i));

  let currentActive = 0;

  let debounce = false;
  const updateTOCHighlight = () => {
    if (debounce)
      return;
    debounce = true;

    const docElem = document.documentElement;
    const docBody = document.body;
    const scrollTop = (docBody.scrollTop || docElem.scrollTop);

    /* After scrolling past the article end (plus some offset), mark nothing as selected. */
    if (scrollTop > articleEnd - headerOffset) {
      if (currentActive !== -1) {
        removeAllActive();
        currentActive = -1;
      }
      return;
    }

    const idx = [...sections]
      .reverse()
      .findIndex(sec => sec.offsetTop - headerOffset <= scrollTop);
    const currentHeading = sections.length - idx - 1;

    if (currentHeading !== currentActive) {
      removeAllActive();
      currentActive = currentHeading;
      highlightLink(currentHeading);
    }

    debounce = false;
  };

  if (hash) { // Set pre-selected item.
    for (let i = 0; i < mainNavLinks.length; i++) {
      if (mainNavLinks[i].href.endsWith(hash)) {
        mainNavLinks[i].classList.add('active');
        mobileNavLinks[i].classList.add('active');
        break;
      }
    }
  }

  // Add a special class for dropdown items.
  $('#btn-mobile-toc nav.toc a').addClass('dropdown-item');

  $(window).on('scroll', updateTOCHighlight);
  // updateTOCHighlight();

  // --- Details Collapsible --- //
  $('.details-collapse-bottom a').on('click', function () {
    const p = this.closest('details');
    const sp = $(p);
    sp.removeAttr('open');

    const elementTop = sp.offset().top;
    const viewportTop = $(window).scrollTop();
    if (elementTop < viewportTop)
      p.scrollIntoView();
  });
});
