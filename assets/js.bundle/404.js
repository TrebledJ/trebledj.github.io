// --- Random Meme --- //
$(() => {
  const numMemes = 4;
  const img = Math.floor(Math.random() * numMemes) + 1;
  $('.404-meme').html(`<img src="/img/memes/404-${img}.jpg" class="jw-75 mt-3">`);
});
