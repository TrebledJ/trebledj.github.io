$(function () {
    var stickySideBar = function () {
        var show =
            $(".left-sidebar").find("button").length === 0
                ? $(window).width() >= 992 // width should match lg bootstrap variable
                : !$(".left-sidebar").find("button").is(":visible");
        if (show) {
            // fix
            $(".left-sidebar").addClass("sticky");
        } else {
            // unfix
            $(".left-sidebar").removeClass("sticky");
        }
    };

    stickySideBar();

    $(window).on('resize', function () {
        stickySideBar();
    });

    // Follow menu drop down
    $(".left-sidebar").find("button").on("click", function () {
        $(".author-social-item-list").toggleClass("hidden");
        $(".left-sidebar").find("button").toggleClass("open");
    });
});