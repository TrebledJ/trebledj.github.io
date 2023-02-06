// --- 404 random meme --- //
$(function () {
    const title = $(".post-title").innerHTML || $(".post-title")[0].innerHTML;
    if (title.includes("404")) {
        const numMemes = 4;
        // const numMemes = $(".post-article img").length;
        // console.log("choosing meme...");
        let img = Math.floor(Math.random() * numMemes) + 1;
        $(".404-meme").html(`<img src="/img/posts/memes/404-${img}.jpg" class="w-75">`);
        // $(`#img-404-${img}`).removeClass("d-none");
        $(".post-posted-date").text(new Date().toISOString().split('T')[0]);
    }
});


// --- Scroll to Top --- //
$(function () {
    function check() {
        if ($(this).scrollTop() > 250) {
            $('#btn-back-to-top').fadeIn();
        } else {
            $('#btn-back-to-top').fadeOut();
        }
    }

    $(window).on("scroll", function () {
        check();
    });

    check(); // Check on doc ready, e.g. if page was reloaded, we could already be in the middle of the page.

    $('#btn-back-to-top').on("click", function () {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });
});
