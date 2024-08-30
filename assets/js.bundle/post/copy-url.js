// Copy URL to clipboard.
$('#copy-link-button').on('click', async () => {
    try {
        await navigator.clipboard.writeText(window.location.href);
    } catch (err) {
        console.error('Failed to copy: ', err);
        return;
    }

    $('.copied').css({ opacity: 1 });
    $('.copied').animate({ opacity: 0 }, 1000);
});