let items,
    itemsToLoad,
    isFetchingPosts = false,
    shouldFetchPosts = true,
    loadedItems = 0;

// Load the JSON file containing all URLs
$.getJSON('/assets/json/all-tracks.json', data => {
  items = data["tracks"];
  
  // If there aren't any more items available to load than already visible, disable fetching
  if (items.length <= itemsToLoad)
    disableFetching();
  
  fetchPosts();
});

// If there's no spinner, it's not a page where items should be fetched
if ($(".infinite-spinner").length < 1)
  shouldFetchPosts = false;

function loadInfinite(num) {
  itemsToLoad = num;
  fetchPosts();
  $(window).on('scroll', e => {
    if (!shouldFetchPosts || isFetchingPosts || loadedItems >= items.length) return;
    
    // Are we close to the end of the page? If we are, load more items
    let scrollPercentage = 100 * $(window).scrollTop() / ($(document).height() - $(window).height());

    // If we've scrolled past the loadNewPostsThreshold, fetch items
    if (scrollPercentage > 90) {
      fetchPosts();
    }
  });
}

// Fetch a chunk of items
function fetchPosts() {
  // Exit if items haven't been loaded
  if (!items) {
    return;
  }
  
  // Wait for loadInfinite to be called
  if (!itemsToLoad) {
    return;
  }
  
  isFetchingPosts = true;
  
  // Load as many items as there were present on the page when it loaded
  // After successfully loading a post, load the next one
  for (let i = 0; i < itemsToLoad; i++) {
    let index = loadedItems;
    if (index >= items.length) {
      break;
    }
    
    fetchPostWithIndex(index);
    loadedItems++;
  }
  disableFetching();
}

function fetchPostWithIndex(index) {
  let item = items[index];
  let tags = item.tags.map(t => `<a class="post-tags tag" href="${base_url}/tags/${t}">${t}</a>`).join("\n");

  $(` <div>
        <br/>
        <iframe allow="autoplay" frameborder="no" height="166" scrolling="no"
          src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${item.track_id}&color=%23${soundcloud_color}&auto_play=false&hide_related=true&show_comments=true&show_user=true&show_reposts=false&show_teaser=false"
          width="100%"></iframe>
        <div class="d-flex flex-row align-items-center">
          <span class="post-date"><i class="fas fa-calendar post-meta-icon me-1"></i>${item.date}</span>
          <span class="fs-6">&nbsp;•&nbsp;</span>
          <span><i class="fas fa-tag post-meta-icon me-1"></i></span>
          <div>
          ${tags}
          </div>
        </div>
        <div class="post-meta">
          <a href="${base_url}${item.url}">Preface</a>:
          <span>${item.summary}</span> 
          <a href="${base_url}${item.url}">(continue reading)</a>
        </div>
      </div>`
  ).appendTo("#track-list")
  // &nbsp;•&nbsp; <a class="post-meta" href="${base_url}${item.url}">read the preface</a>
}

function disableFetching() {
  isFetchingPosts = false;
  $(".infinite-spinner").fadeOut();
}
