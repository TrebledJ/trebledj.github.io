async function InfiniteLoader(params) {
  const dataFile = params.data;
  const initialLoad = params.items.num || 10;
  const subsequentLoad = params.items.after || initialLoad;
  const html = params.html || (item => item);
  const htmlElement = params.element || '.post-list';
  const scrollPercentageTrigger = 90;

  if (!dataFile)
    return console.error('no data file specified');

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

  fetchPosts(initialLoad);

  // If there's no spinner, it's not a page where items should be fetched
  if ($(".infinite-spinner").length < 1)
    shouldFetchPosts = false;

  $(window).on('scroll', e => {
    if (!shouldFetchPosts || isFetchingPosts || !items || loadedItems >= items.length) return;

    // Are we close to the end of the page? If we are, load more items
    const scrollPercentage = 100 * $(window).scrollTop() / ($(document).height() - $(window).height());

    // If we've scrolled past the loadNewPostsThreshold, fetch items
    if (scrollPercentage > scrollPercentageTrigger) {
      fetchPosts(subsequentLoad);
    }
  });

  // Fetch a chunk of items.
  function fetchPosts(num) {
    if (!shouldFetchPosts)
      return;

    isFetchingPosts = true;

    // Load as many items as there were present on the page when it loaded.
    // After successfully loading a post, load the next one.
    for (let i = 0; i < num; i++) {
      const index = loadedItems;
      if (index >= items.length)
        break;
      
      fetchPostWithIndex(index);
      loadedItems++;
    }

    if (loadedItems >= maxItemsToLoad) {
      disableFetching();
      return;
    }

    isFetchingPosts = false;
  }

  function fetchPostWithIndex(index) {
    const item = items[index];
    if (typeof html === 'function') {
      $(html(item, index)).appendTo(htmlElement);
    } else if (typeof html === 'string') {
      $(html).appendTo(htmlElement);
    }
  }

  function disableFetching() {
    shouldFetchPosts = false;
    isFetchingPosts = false;
    $(".infinite-spinner").fadeOut();
  }
}