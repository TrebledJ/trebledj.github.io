// --- Copy URL --- //
const copyUrlToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(location.href);
    } catch (err) {
        console.error("Failed to copy: ", err);
        return;
    }

    $(".copied").css({ top: 0, opacity: 1 });
    $(".copied").animate({ top: -25, opacity: 0 }, 1000);
};


// --- TOC Current Section Highlight --- //
$(function () {
    const headerOffset = 75;
    const sections = document.querySelectorAll(".post-article h2,.post-article h3");
    const menu = document.querySelectorAll("nav.toc a");

    const hash = window.location.hash;

    if (hash) {
        for (const item of menu) {
            if (menu.href === hash) {
                item.classList.add("active");
            }
        }
    }

    const makeActive = (link) => {
        if (menu[link]) {
            menu[link].classList.add("active");
        }
    };
    const removeActive = (link) => menu[link].classList.remove("active");
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

            const currentHeading =
                sections.length -
                [...sections].reverse().findIndex((section) => {
                    return section.offsetTop - headerOffset <= scrollTop;
                }) -
                1;

            if (currentHeading !== currentActive) {
                removeAllActive();
                currentActive = currentHeading;
                makeActive(currentHeading);
            }
        }
    };


    $(window).on("scroll", updateTOCHighlight);
    updateTOCHighlight();
})