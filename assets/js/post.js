// eslint-disable-next-line no-var
var tocOptions;

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
  const headerOffset = document.querySelector('header').offsetHeight + 20;

  let tags = ['h2', 'h3'];
  if (tocOptions) {
    tocOptions = JSON.parse(tocOptions);
    if (tocOptions.tags && tocOptions.tags.length > 0) {
      const newTags = [];
      for (const t of tocOptions.tags) {
        // Check if it matches hN header pattern.
        if (t.startsWith('h') && !Number.isNaN(t[1]) && t[1] > 0 && t[1] <= 6) {
          newTags.push(t);
        }
      }
      if (newTags.length > 0) {
        tags = newTags;
      }
    }
  }

  const headerSelectors = tags.map(t => `.post-body ${t}`).join(',');
  const sections = document.querySelectorAll(headerSelectors);
  const mainNavLinks = document.querySelectorAll('#toc-sidebar nav.toc a');
  const mobileNavLinks = document.querySelectorAll('#btn-mobile-toc nav.toc a');

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

  const debounce = f => {
    let flag = false;
    return (...args) => {
      if (flag)
        return;
      flag = true;
      f(...args);
      flag = false;
    };
  };

  const updateTOCHighlight = () => {
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

  $(window).on('scroll', debounce(updateTOCHighlight));
  // updateTOCHighlight();

  // --- Details Collapsible --- //
  $('.details-collapse-bottom a').on('click', function () {
    const p = this.closest('details');
    const sp = $(p);
    sp.find('summary').trigger('click');
    // sp.removeAttr('open');

    const elementTop = sp.offset().top;
    const viewportTop = $(window).scrollTop();
    if (elementTop < viewportTop)
      p.scrollIntoView();
  });

  // --- Details Animations --- //
  class Accordion {
    constructor(el) {
      // Store the <details> element
      this.el = el;
      // Store the <summary> element
      this.summary = el.querySelector('summary');
      // Store the <div class="content"> element
      this.content = el.querySelector('.details-content');

      // Store the animation object (so we can cancel it if needed)
      this.animation = null;
      // Store if the element is closing
      this.isClosing = false;
      // Store if the element is expanding
      this.isExpanding = false;
      // Detect user clicks on the summary element
      this.summary.addEventListener('click', e => this.onClick(e));
    }

    onClick(e) {
      // Stop default behaviour from the browser
      e.preventDefault();
      // Add an overflow on the <details> to avoid content overflowing
      this.el.style.overflow = 'hidden';
      // Check if the element is being closed or is already closed
      if (this.isClosing || !this.el.open) {
        this.open();
        // Check if the element is being openned or is already open
      } else if (this.isExpanding || this.el.open) {
        this.shrink();
      }
    }

    shrink() {
      // Set the element as "being closed"
      this.isClosing = true;

      // Store the current height of the element
      const startHeight = `${this.el.offsetHeight}px`;
      // Calculate the height of the summary
      const endHeight = `${this.summary.offsetHeight}px`;

      // If there is already an animation running
      if (this.animation) {
        // Cancel the current animation
        this.animation.cancel();
      }

      // Start a WAAPI animation
      this.animation = this.el.animate({
        // Set the keyframes from the startHeight to endHeight
        height: [startHeight, endHeight],
      }, {
        duration: 400,
        easing: 'ease-out',
      });

      // When the animation is complete, call onAnimationFinish()
      this.animation.onfinish = () => this.onAnimationFinish(false);
      // If the animation is cancelled, isClosing variable is set to false
      this.animation.oncancel = () => { this.isClosing = false; };
    }

    open() {
      // Apply a fixed height on the element
      this.el.style.height = `${this.el.offsetHeight}px`;
      // Force the [open] attribute on the details element
      this.el.open = true;
      // Wait for the next frame to call the expand function
      window.requestAnimationFrame(() => this.expand());
    }

    expand() {
      // Set the element as "being expanding"
      this.isExpanding = true;
      // Get the current fixed height of the element
      const startHeight = `${this.el.offsetHeight}px`;
      // Calculate the open height of the element (summary height + content height)
      const endHeight = `${this.summary.offsetHeight + this.content.offsetHeight}px`;

      // If there is already an animation running
      if (this.animation) {
        // Cancel the current animation
        this.animation.cancel();
      }

      // Start a WAAPI animation
      this.animation = this.el.animate({
        // Set the keyframes from the startHeight to endHeight
        height: [startHeight, endHeight],
      }, {
        duration: 400,
        easing: 'ease-out',
      });
      // When the animation is complete, call onAnimationFinish()
      this.animation.onfinish = () => this.onAnimationFinish(true);
      // If the animation is cancelled, isExpanding variable is set to false
      this.animation.oncancel = () => { this.isExpanding = false; };
    }

    onAnimationFinish(open) {
      // Set the open attribute based on the parameter
      this.el.open = open;
      // Clear the stored animation
      this.animation = null;
      // Reset isClosing & isExpanding
      this.isClosing = false;
      this.isExpanding = false;
      // Remove the overflow hidden and the fixed height
      this.el.style.height = this.el.style.overflow = '';
    }
  }

  document.querySelectorAll('details').forEach(el => {
    new Accordion(el);
  });
});
