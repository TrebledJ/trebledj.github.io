// Lazy-load comments.
const commentsElement = document.querySelector('#comentario');

if (commentsElement) {
  const options = {
    rootMargin: '600px', // Lazy-load when the div is this far away from the viewport.
    threshold: 0,
  };

  const loadComments = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        console.log("loading comments...");
        commentsElement.main();
        observer.unobserve(entry.target);
      }
    });
  }, options);

  loadComments.observe(commentsElement);
}
