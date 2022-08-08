// --- 404 random meme --- //
$(document).ready(function() {
    if ("{{page.title}}" === "404") {
        let img = Math.floor(Math.random() * 3) + 1;
        $(`#img-404-${img}`).removeClass("d-none");
        $(".post-posted-date").text(new Date().toISOString().split('T')[0]);
    }
});
