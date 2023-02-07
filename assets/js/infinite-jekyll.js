async function InfiniteLoader(params) {
  const dataFile = params.data;
  const initialLoad = params.items.num || 10;
  const subsequentLoad = params.items.after || initialLoad;
  const html = params.html;
  const htmlElement = params.element;
  const scrollPercentageTrigger = 85;

  if (!dataFile)
    return console.error('no data file specified');

  if (!html)
    return console.error('no HTML to load');

  if (!(['string', 'function'].includes(typeof html)))
    return console.error('params.html should be string or function');

  if (!htmlElement)
    return console.error('no HTML element to insert to');

  let isFetchingPosts = false;
  let shouldFetchPosts = true;
  let loadedItems = 0; /* Number of already loaded items. */

  const p = await fetch(dataFile);
  const items = await p.json();
  const maxItemsToLoad = Math.min(params.items.max || Number.MAX_SAFE_INTEGER, items.length);

  // if (items.length <= itemsToLoad) {
  //   disableFetching();
  // }
  fetchPosts(initialLoad);

  // If there's no spinner, it's not a page where items should be fetched
  if ($(".infinite-spinner").length < 1)
    shouldFetchPosts = false;

  // function loadInfinite(num) {
  //   itemsToLoad = num;
  // fetchPosts();
  $(window).on('scroll', e => {
    if (!shouldFetchPosts || isFetchingPosts || !items || loadedItems >= items.length) return;

    // Are we close to the end of the page? If we are, load more items
    const scrollPercentage = 100 * $(window).scrollTop() / ($(document).height() - $(window).height());

    // If we've scrolled past the loadNewPostsThreshold, fetch items
    if (scrollPercentage > scrollPercentageTrigger) {
      fetchPosts(subsequentLoad);
    }
  });
  // }

  // Fetch a chunk of items
  function fetchPosts(num) {
    // // Exit if items haven't been loaded.
    // if (!items) {
    //   return;
    // }

    // // Wait for loadInfinite to be called.
    // if (!itemsToLoad) {
    //   return;
    // }

    if (!shouldFetchPosts)
      return;

    if (loadedItems >= maxItemsToLoad)
      return;

    isFetchingPosts = true;

    // Load as many items as there were present on the page when it loaded
    // After successfully loading a post, load the next one.
    const n = Math.min(num, maxItemsToLoad - loadedItems);
    for (let i = 0; i < n; i++) {
      const index = loadedItems;
      if (index >= items.length) {
        break;
      }

      fetchPostWithIndex(index);
      loadedItems++;
    }
    disableFetching();
  }

  function fetchPostWithIndex(index) {
    const item = items[index];
    if (typeof html === 'function') {
      $(html(item, index)).appendTo(htmlElement);
    } else if (typeof html === 'string') {
      $(html).appendTo(htmlElement);
    }
    // let tags = item.tags.filter(t => !["composition", "music"].includes(t)).map(t => `<a class="post-tags tag" href="${base_url}/tags/${t}">${t}</a>`).join("\n");
    // let brk = (index ? '<br/>' : ''); // No break on the first item.

    // $(` <div>
    //     ${brk}
    //     <iframe allow="autoplay" frameborder="no" height="166" scrolling="no"
    //       src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${item.track_id}&color=%23${soundcloud_color}&auto_play=false&hide_related=true&show_comments=true&show_user=true&show_reposts=false&show_teaser=false"
    //       width="100%"></iframe>
    //     <div class="d-flex flex-row align-items-center">
    //       <span class="post-date"><i class="fa fa-calendar post-meta-icon me-1"></i>${item.date}</span>
    //       <span class="fs-6">&nbsp;•&nbsp;</span>
    //       <span><i class="fa fa-tag post-meta-icon me-1"></i></span>
    //       <div>
    //       ${tags}
    //       </div>
    //     </div>
    //     <div class="post-meta">
    //       <a href="${base_url}${item.url}">Preface</a>:
    //       <span>${item.description}</span> 
    //       <a href="${base_url}${item.url}">(continue reading)</a>
    //     </div>
    //   </div>`
    // ).appendTo("#track-list")
    // &nbsp;•&nbsp; <a class="post-meta" href="${base_url}${item.url}">read the preface</a>
  }

  function disableFetching() {
    isFetchingPosts = false;
    $(".infinite-spinner").fadeOut();
  }

  // loadInfinite(5);
}