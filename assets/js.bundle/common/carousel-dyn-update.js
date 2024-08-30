// Carousel auto-label update.
$('.carousel').each(function () {
    // Update labels on slide.
    const id = $(this).attr('id');
    $(this).on('slide.bs.carousel', event => {
        $(`#${id}-tab${event.from + 1}-label`).removeClass('active-tab');
        $(`#${id}-tab${event.to + 1}-label`).addClass('active-tab');
    });
});