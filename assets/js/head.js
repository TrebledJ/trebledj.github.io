// --- 404 random meme --- //
$(document).ready(function() {
    if ("{{page.title}}" === "404") {
        let img = Math.floor(Math.random() * 3) + 1;
        $(`#img-404-${img}`).removeClass("d-none");
        $(".post-posted-date").text(new Date().toISOString().split('T')[0]);
    }
});

$(document).ready(function() {
    let article = $(".post-article");
    if (!article) {
        console.log("This page is not an article! Buh bye.");
    } else {
        console.log("oooh, it's an article!")
    }
    for (obj of $(".post-article pre, .post-article code")) {
        console.log(obj.contents());
    }
})