// --- Random Meme --- //
$(function () {
    const numMemes = 4;
    let img = Math.floor(Math.random() * numMemes) + 1;
    $(".404-meme").html(`<img src="/img/posts/memes/404-${img}.jpg" class="w-75">`);
    // $(".post-posted-date").text('Posted on ' + new Date().toISOString().split('T')[0]);
});