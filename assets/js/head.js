$(function () {
    /* Scroll Progress */
    $(document).on('scroll', () => {
        var docElem = document.documentElement;
        var docBody = document.body;
        var scrollTop = (docBody.scrollTop || docElem.scrollTop);
        var height = docElem.scrollHeight - docElem.clientHeight;

        progress = scrollTop / height * 100;

        if (progress > 0) {
            progressBar = document.querySelector('#scroll-progress-bar');
            progressBar.style.setProperty('--progress', progress + '%');
        } else {
            progressBar.style.setProperty('--progress', '0%');
        }
    });

    /* Scroll to Top */
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

    $('#btn-back-to-top').on("click", () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });

    /* Load Tooltips */
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });

    // Compress SoundCloud embed for small screens.
    if ($(window).width() < 600) {
        const s = $(".soundcloud-track iframe");
        s.each(function () {
            $(this).attr('src', $(this).attr('src') + '&visual=true');
        });
        console.log('#s:', s.length)
    }

    $('.carousel').each(function () {
        const id = $(this).attr('id');
        $(this).on('slide.bs.carousel', event => {
            $(`#${id}-tab${event.from + 1}-label`).removeClass('active');
            $(`#${id}-tab${event.to + 1}-label`).addClass('active');
        });
    });
});
