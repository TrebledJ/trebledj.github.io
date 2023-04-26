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

    /* Vars */
    var base_url = '{{site.baseurl}}';
    var soundcloud_color = '{{site.soundcloud_color}}';
    var defaultTheme = "dark";

    /* Nanobar */
    var options = {
        classname: 'load-progress-bar',
        id: 'my-id'
    };
    var nanobar = new Nanobar(options);
    nanobar.go(30);
    nanobar.go(76);
    nanobar.go(100);

    /* Load Tooltips */
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });

    /* Theme */
    function modeInit() {
        let currentTheme = localStorage.getItem("theme");
        if (currentTheme === "dark") {
            setMode("dark");
        } else if (currentTheme === "light") {
            setMode("light");
        } else {
            setMode(defaultTheme);
        }

        // Set switch to correct setting on load.
        document.getElementById('theme-toggle').checked = (currentTheme === "light");
    }

    function modeSwitcher() {
        let currentTheme = localStorage.getItem("theme");
        if (currentTheme === "dark") {
            setMode("light");
            if (reloadDisqus)
                reloadDisqus();
        } else if (currentTheme === "light") {
            setMode("dark");
            if (reloadDisqus)
                reloadDisqus();
        } else {
            setMode(defaultTheme);
        }
    }

    function setMode(mode) {
        if (mode === "dark") {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
        } else if (mode === "light") {
            document.documentElement.setAttribute("data-theme", "light");
            localStorage.setItem("theme", "light");
        }
    }

    modeInit();
});
