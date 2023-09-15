$(function () {
    // --- Author Socials Button --- //
    const authorSocialButton = $("#post-author-container").find("button");
    button.on("click", function () {
        $(".author-social-item-list").toggleClass("hidden");
        button.toggleClass("open");
    });

    // --- Copy URL --- //
    $("#copyLinkButton").on("click", async () => {
        try {
            await navigator.clipboard.writeText(location.href);
        } catch (err) {
            console.error("Failed to copy: ", err);
            return;
        }

        $(".copied").css({ opacity: 1 });
        $(".copied").animate({ opacity: 0 }, 1000);
    });

    // --- Content Header -> Back to Top --- //
    $('#toc-content').on('click', () => {
        $('#btn-back-to-top').trigger('click');
    })

    // --- TOC Current Section Highlight --- //
    const headerOffset = 150;
    const sections = document.querySelectorAll(".post-article h2,.post-article h3");
    const menu = document.querySelectorAll("#right-sidebar nav.toc a");
    const menuMobile = document.querySelectorAll("#btn-mobile-toc nav.toc a");

    if (menu.length !== menuMobile.length)
        console.warn("Welp. Lengths aren't the same here. But they should be. This probably shouldn't cause too much of a problem tho. (Hopefully.)");

    const hash = window.location.hash;
    const articleEnd = document.querySelector("#end-of-article").offsetTop;

    const makeActive = (link) => {
        if (menu[link]) {
            menu[link].classList.add("active");
            menuMobile[link].classList.add("active");
        }
    };
    const removeActive = (link) => {
        if (menu[link]) {
            menu[link].classList.remove("active");
            menuMobile[link].classList.remove('active');
        }
    };
    const removeAllActive = () =>
        [...Array(sections.length).keys()].forEach((link) =>
            removeActive(link)
        );

    let currentActive = 0;

    const updateTOCHighlight = () => {
        {
            var docElem = document.documentElement;
            var docBody = document.body;
            var scrollTop = (docBody.scrollTop || docElem.scrollTop);

            /* After scrolling past the article end (plus some offset), mark nothing as selected. */
            if (scrollTop > articleEnd - headerOffset) {
                if (currentActive !== -1) {
                    removeAllActive();
                    currentActive = -1;
                }
                return;
            }

            const currentHeading =
                sections.length -
                [...sections].reverse().findIndex((section) => {
                    return section.offsetTop - headerOffset <= scrollTop;
                }) - 1;

            if (currentHeading !== currentActive) {
                removeAllActive();
                currentActive = currentHeading;
                makeActive(currentHeading);
            }
        }
    };


    if (hash) {
        // Set pre-selected item.
        for (let i = 0; i < menu.length; i++) {
            if (menu[i].href.endsWith(hash)) {
                menu[i].classList.add("active");
                menuMobile[i].classList.add("active");
                break;
            }
        }
    }

    // Add a special class for dropdown items.
    $("#btn-mobile-toc nav.toc a").addClass('dropdown-item');

    $(window).on("scroll", updateTOCHighlight);
    // updateTOCHighlight();

    // --- Details Collapsible --- //
    $(".details-collapse-bottom a").on('click', function () {
        const p = this.closest("details");
        $(p).removeAttr('open');
        p.scrollIntoView();
    });
    
})