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

    // Nanobar.
    var options = {
        classname: 'load-progress-bar',
        id: 'my-id'
    };
    var nanobar = new Nanobar(options);
    nanobar.go(30);
    nanobar.go(76);
    nanobar.go(100);

    // Load tooltips.
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });

    // /**
    //  * @param {String} HTML representing a single element
    //  * @return {Element}
    //  */
    // function htmlToElement(html) {
    //     var template = document.createElement('template');
    //     html = html.trim(); // Never return a text node of whitespace as the result
    //     template.innerHTML = html;
    //     return template.content.firstChild;
    // }

    // /**
    //  * @param {String} HTML representing any number of sibling elements
    //  * @return {NodeList} 
    //  */
    // function htmlToElements(html) {
    //     var template = document.createElement('template');
    //     template.innerHTML = html;
    //     return template.content.childNodes;
    // }
});
