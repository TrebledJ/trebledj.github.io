let items,
    itemsToLoad,
    isFetchingPosts = false,
    shouldFetchPosts = true,
    loadedItems = 0;

let site;

// Get site metadata.
$.getJSON('/assets/json/metadata.json', data => {
  site = data;
})

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
  let tags = item.tags.map(t => `&nbsp;•&nbsp;&nbsp;<a class="post-tags tag" href="${site['baseurl']}/tags/${t}">${t}</a>`).join("\n");

  $(` <li>
        <br/>
        <br/>
        <iframe allow="autoplay" frameborder="no" height="166" scrolling="no"
          src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${item.track_id}&color=%23${site['soundcloud_color']}&auto_play=false&hide_related=true&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
          width="100%"></iframe>
        <div>
          <span class="post-date">${item.date}</span>
          ${tags}
        </div>
        <div class="post-meta">
          <a href="${site['baseurl']}${item.url}">Preface</a>:
          <span>${item.summary}</span> 
          <a href="${site['baseurl']}${item.url}">(continue reading)</a>
        </div>
      </li>`
  ).appendTo("#track-list")
  // &nbsp;•&nbsp; <a class="post-meta" href="${site['baseurl']}${item.url}">read the preface</a>
}

function disableFetching() {
  isFetchingPosts = false;
  $(".infinite-spinner").fadeOut();
}
