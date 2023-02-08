async function InfiniteLoader(params) {
  const dataFile = params.data;                             // The JSON data file to load data from.
  const initialLoad = params.items.num || 10;               // Number of items to load initially.
  const subsequentLoad = params.items.after || initialLoad; // Number of items to load subsequently on scroll.
  const html = params.html || (item => item);               // The HTML data to load.
  const appendElement = params.append || '.post-list';      // Where to insert the items.
  const scrollPercentageTrigger = 90;                       // Scroll percentage when we should trigger a subsequent load (0-100).

  if (!dataFile)
    return console.error('no data file specified');

  if (!(['string', 'function'].includes(typeof html)))
    return console.error('params.html should be string or function');

  if (!appendElement)
    return console.error('no HTML element to insert to');

  let isFetchingPosts = false;
  let shouldFetchPosts = true;
  let loadedItems = 0; // Number of already loaded items.

  const p = await fetch(dataFile);
  const items = await p.json();
  const maxItemsToLoad = Math.min(params.items.max || Number.MAX_SAFE_INTEGER, items.length);

  fetchPosts(initialLoad);

  // If there's no spinner, it's not a page where items should be fetched.
  if ($(".infinite-spinner").length < 1)
    shouldFetchPosts = false;

  $(window).on('scroll', e => {
    if (!shouldFetchPosts || isFetchingPosts || !items || loadedItems >= items.length)
      return;

    // Are we close to the end of the page? If we are, load more items.
    const scrollPercentage = 100 * $(window).scrollTop() / ($(document).height() - $(window).height());

    if (scrollPercentage > scrollPercentageTrigger) {
      fetchPosts(subsequentLoad);
    }
  });

  // Fetch a chunk of items.
  function fetchPosts(num) {
    if (!shouldFetchPosts)
      return;

    isFetchingPosts = true;

    const n = Math.min(num, maxItemsToLoad - loadedItems);
    for (let i = 0; i < n; i++) {
      fetchPostWithIndex(loadedItems);
      loadedItems++;
    }

    if (loadedItems >= maxItemsToLoad) {
      // Disable fetching once we've finished loaded the max number of items.
      disableFetching();
      return;
    }

    isFetchingPosts = false;
  }


  // Fetches a post associated with the given index.
  function fetchPostWithIndex(index) {
    const item = items[index];
    let x = html;
    if (typeof html === 'function') {
      // Call the user-provided function, passing in the item and index.
      x = html(item, index);
    } else if (typeof html === 'string') {
      // Use the string directly.
      // x = html;
    } else {
      console.error("unrecognised html generator type:", typeof html);
    }
    $(x).appendTo(appendElement);
  }

  function disableFetching() {
    // No more posts should be fetched after calling this function...
    shouldFetchPosts = false;
    isFetchingPosts = false;
    $(".infinite-spinner").fadeOut();
  }
}