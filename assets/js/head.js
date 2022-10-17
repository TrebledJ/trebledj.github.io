// --- 404 random meme --- //
$(document).ready(function () {
    var numMemes = 4;
    if ($("title")[0].innerText.includes("404")) {
        let img = Math.floor(Math.random() * numMemes) + 1;
        $(`#img-404-${img}`).removeClass("d-none");
        $(".post-posted-date").text(new Date().toISOString().split('T')[0]);
    }
});


// --- Scroll to Top --- //
$(document).ready(function () {
    function check() {
        if ($(this).scrollTop() > 250) {
            $('#btn-back-to-top').fadeIn();
        } else {
            $('#btn-back-to-top').fadeOut();
        }
    }

    $(window).scroll(function () {
        check();
    });

    check(); // Check on doc ready, e.g. if page was reloaded, we could already be in the middle of the page.

    $('#btn-back-to-top').click(function () {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });
});