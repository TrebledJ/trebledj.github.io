$(function () {
    var stickySideBar = function () {
        var show =
            $("#post-author-container").find("button").length === 0
                ? $(window).width() >= 992 // width should match lg bootstrap variable
                : !$("#post-author-container").find("button").is(":visible");
        if (show) {
            // fix
            $("#post-author-container").addClass("sticky");
        } else {
            // unfix
            $("#post-author-container").removeClass("sticky");
        }
    };

    stickySideBar();

    $(window).on('resize', function () {
        stickySideBar();
    });

    // Follow menu drop down
    $("#post-author-container").find("button").on("click", function () {
        $(".social-item-list").toggleClass("hidden");
        $("#post-author-container").find("button").toggleClass("open");
    });
});