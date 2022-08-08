$(document).ready(function() {
  'use strict';
  var search_field = $('#search-box'),
      results_list = $('#search-results-list'),
      toggle_search = $('#toggle-search-button'),
      search_result_template = "\
        <div class='results-list__item'>\
          <a class='results-list__item__title' href='{{link}}'>{{title}}</a>\
          <span class='post__date'>{{pubDate}}</span>\
        </div>";

  // toggle_search.click(function(event) {
  //   event.preventDefault();
  //   $('.search-form-container').toggleClass('is-active');
  //   // TODO: change search icon to X.
  //   setTimeout(function() {
  //     $().focus();
  //   }, 400);
  // })

  // $('.search-form-container')
  // search_field
  // .on('keyup', function(event) {
  //   // Escape key.
  //   if (event.keyCode == 27) {
  //     console.log("Escape key pressed.");
  //     $('.search-form-container').removeClass('is-active');
  //   }
  // });

  toggle_search.click(function() {
    search_field.focus();
  });

  search_field.ghostHunter({
    results: results_list,
    onKeyUp         : true,
    rss             : base_url + '/feed.xml',
    zeroResultsInfo : true,
    info_template   : "<h4 class='heading'>Number of posts found: {{amount}}</h4>",
    result_template : search_result_template,
    before: function() {
      results_list.fadeIn();
    }
  });

});