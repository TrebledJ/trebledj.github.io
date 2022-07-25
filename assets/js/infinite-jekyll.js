$(function() {
  
  let items,
      isFetchingPosts = false,
      shouldFetchPosts = true,
      itemsToLoad = $("#track-list li").length,
      loadedItems = itemsToLoad,
      loadNewPostsThreshold = 3000;

  // Load the JSON file containing all URLs
  $.getJSON('/assets/json/all-tracks.json', function(data) {
    items = data["tracks"];
    
    // If there aren't any more items available to load than already visible, disable fetching
    if (items.length <= itemsToLoad)
      disableFetching();
  });

  // If there's no spinner, it's not a page where items should be fetched
  if ($(".infinite-spinner").length < 1)
    shouldFetchPosts = false;
	
  // Are we close to the end of the page? If we are, load more items
  $(window).on('scroll', function(e){
    if (!shouldFetchPosts || isFetchingPosts || loadedItems >= items.length) return;
    
    var windowHeight = $(window).height(),
        windowScrollPosition = $(window).scrollTop(),
        bottomScrollPosition = windowHeight + windowScrollPosition,
        documentHeight = $(document).height();
    
    let scrollPercentage = 100 * $(window).scrollTop() / ($(document).height() - $(window).height());

    // If we've scrolled past the loadNewPostsThreshold, fetch items
    // if ((documentHeight - loadNewPostsThreshold) < bottomScrollPosition) {
    if (scrollPercentage > 90) {
      fetchPosts();
    }
  });
  
  // Fetch a chunk of items
  function fetchPosts() {
    // Exit if items haven't been loaded
    if (!items) return;
    
    isFetchingPosts = true;
    
    // Load as many items as there were present on the page when it loaded
    // After successfully loading a post, load the next one
    for (let i = 0; i < itemsToLoad; i++) {
      let index = loadedItems + 1;
      if (index >= items.length) {
        break;
      }
      
      fetchPostWithIndex(index);
      loadedItems++;
    }
    disableFetching();
  }
	
  function fetchPostWithIndex(index) {
    var item = items[index];

    $([
      "<li>",
      " <hr/>",
      "   <iframe allow=\"autoplay\" frameborder=\"no\" height=\"166\" scrolling=\"no\"",
      "     src=\"https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/" + item + "&color=%233e45c5&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true\"",
      "     width=\"100%\"></iframe>",
      "</li>",
    ].join("\n")).appendTo("#track-list")
  }
  
  function disableFetching() {
    isFetchingPosts = false;
    $(".infinite-spinner").fadeOut();
  }
	
});
