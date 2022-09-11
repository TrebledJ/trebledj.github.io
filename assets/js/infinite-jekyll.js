let itemsToLoad,
    isFetchingPosts = false,
    shouldFetchPosts = true,
    loadedItems = 0;

let items = tracks;
if (items.length <= itemsToLoad) {
  disableFetching();
}
fetchPosts();

// If there's no spinner, it's not a page where items should be fetched
if ($(".infinite-spinner").length < 1)
  shouldFetchPosts = false;

function loadInfinite(num) {
  itemsToLoad = num;
  fetchPosts();
  $(window).on('scroll', e => {
    console.log("scroll");
    if (!shouldFetchPosts || isFetchingPosts || !items || loadedItems >= items.length) return;
    console.log("go go go");
    
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
  let tags = item.tags.filter(t => !["composition", "music"].includes(t)).map(t => `<a class="post-tags tag" href="${base_url}/tags/${t}">${t}</a>`).join("\n");

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
          <span>${item.description}</span> 
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
