// --- 404 random meme --- //
$(document).ready(function () {
    if ($("title")[0].innerText.includes("404")) {
        let img = Math.floor(Math.random() * 3) + 1;
        $(`#img-404-${img}`).removeClass("d-none");
        $(".post-posted-date").text(new Date().toISOString().split('T')[0]);
    }
});


// --- Scroll to Top --- //
$(document).ready(function () {
    $(window).scroll(function () {
        if ($(this).scrollTop() > 250) {
            $('#btn-back-to-top').fadeIn();
        } else {
            $('#btn-back-to-top').fadeOut();
        }
    });

    $('#btn-back-to-top').click(function () {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });
});