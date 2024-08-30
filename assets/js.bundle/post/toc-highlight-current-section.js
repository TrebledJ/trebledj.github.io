// --- TOC Current Section Highlight --- //
// 1. Check if post is configured to also show h3, h4, h5, etc...
// 2. Get all HTML heading elements.
// 3. Construct main calculation logic and attach to event handler.

// eslint-disable-next-line no-var
var tocOptions;

const headerOffset = document.querySelector('header').offsetHeight + 20;

let tags = ['h2', 'h3']; // Default.
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

const headerSelectors = tags.map(t => `.post-body > ${t}`).join(',');
const sections = document.querySelectorAll(headerSelectors);
const mainNavLinks = document.querySelectorAll('#toc-sidebar nav.toc a');
const mobileNavLinks = document.querySelectorAll('#btn-mobile-toc nav.toc a');

const { hash } = window.location;

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

const docElem = document.documentElement;
const docBody = document.body;
const articleEndElement = document.querySelector('#end-of-article');

const sectionsBottomUp = [...sections].reverse();
let currentActive = 0;

const updateTOCHighlight = () => {
  const scrollTop = (docBody.scrollTop || docElem.scrollTop);

  /* After scrolling past the article end (plus some offset), mark nothing as selected. */
  if (scrollTop > articleEndElement.offsetTop - headerOffset) {
    if (currentActive !== -1) {
      removeAllActive();
      currentActive = -1;
    }
    return;
  }

  const idx = sectionsBottomUp.findIndex(sec => sec.offsetTop - headerOffset <= scrollTop);
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
updateTOCHighlight();
