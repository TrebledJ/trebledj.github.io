/**
 * Find latest posts for each tag. Avoids duplicates. Prioritises tags listed first.
 *
 * For example, if a post is tagged as `[ctf, programming]`, it will be listed to `ctf`
 * first, rather than `programming`. Only if the `ctf` bucket is full, will it be considered
 * for the `programming` bucket.
 *
 * @param {Array[post]} posts Array of all posts, ordered by most recent. Just pass `collections.postsr` here.
 * @param {Array[string]} topics Array of tags, e.g. ["programming", "music", "ctf"].
 * @param {number} nposts The number of posts to bucket into each topic.
 * @returns An object, keys are topics, values are post objects.
 */
export function selectHomePosts(posts, topics, nposts) {
  if (!posts)
    throw new Error('Expected posts to be an array of posts, got falsy value.');

  if (!nposts || nposts < 0)
    throw new Error(`Expected nposts to be a positive number, got ${nposts}.`);

  // Init buckets.
  const buckets = {};
  topics.forEach(e => {
    buckets[e] = [];
  });

  let npostsLeft = nposts * topics.length;

  for (const p of posts) {
    for (const t of p.data.tags) {
      if (buckets[t] !== undefined && buckets[t].length < nposts) {
        buckets[t].push(p);
        npostsLeft--;
        break;
      }
    }
    if (npostsLeft === 0)
      break;
  }

  return buckets;
};
