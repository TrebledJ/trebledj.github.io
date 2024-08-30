const docElem = document.documentElement;
const docBody = document.body;
const progressBar = document.querySelector('#scroll-progress-bar');

document.addEventListener('scroll', () => {
  const scrollTop = (docBody.scrollTop || docElem.scrollTop);
  const height = docElem.scrollHeight - docElem.clientHeight;
  const progress = scrollTop / height * 100;
  progressBar.style.setProperty('--progress', `${Math.max(progress, 0)}%`);
});
