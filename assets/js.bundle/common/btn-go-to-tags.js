// "Go to Tags" in /posts/.
const gototagsButton = $('#btn-go-to-tags');
const tagsSection = document.querySelector('#tags-sidebar');

if (tagsSection) {
  gototagsButton.on('click', () => {
    tagsSection.scrollIntoView({
      behavior: 'smooth',
    });
  });

  const gototagObserver = new IntersectionObserver((entries, _observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        gototagsButton.fadeOut();
      } else {
        gototagsButton.fadeIn();
      }
    });
  }, {
    rootMargin: '0px',
    threshold: 0,
  });

  gototagObserver.observe(tagsSection);
}
