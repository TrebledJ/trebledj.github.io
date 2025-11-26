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

/**
 * Find latest posts for each tag. Avoids duplicates. Prioritises tags listed first.
 *
 * For example, if a post is tagged as `[ctf, programming]`, it will be listed to `ctf`
 * first, rather than `programming`. Only if the `ctf` bucket is full, will it be considered
 * for the `programming` bucket.
 *
 * @param {Array[post]} posts Array of all posts, ordered by most recent. Just pass `collections.postsr` here.
 * @param {object} topics Array of tags, e.g. {tech: {tags: ["programming", "infosec"], min: 1, max: 5}, music: {tags: ["composition"], max: 2}}.
 * @returns An object, keys are topics, values are post objects.
 */
export function selectPostsWithAtLeastNPerTag(posts, topics) {
  if (!posts || !Array.isArray(posts))
    throw new Error(`Expected posts to be an array of posts, but got ${posts}.`);

  if (!topics)
    throw new Error(`Expected topics, but got ${topics}`);

  // Init buckets.
  const buckets = {};
  const bucketnames = Object.keys(topics);
  bucketnames.forEach(e => {
    buckets[e] = [];
    if (!topics[e].max) {
      throw new Error(`Please specify a max post count for bucket '${e}'.`);
    }
  });

  function findBucketForTag(tag) {
    for (const name of bucketnames) {
      if (topics[name].tags.includes(tag)) {
        return buckets[name];
      }
    }
    return null;
  }

  posts = posts.slice(); // Shallow copy.

  // Handle mandatory posts first.
  const featuredPosts = posts.filter(p => p.data.featured);
  for (const post of featuredPosts) {
    let pushed = false;
    for (const t of post.data.tags) {
      const bucket = findBucketForTag(t);
      if (bucket) {
        pushed = true;
        bucket.push(post);
        break;
      }
    }
    if (!pushed) {
      throw new Error(`[ERROR] Unable to find bucket for mandatory home-page post ${post}.`)
    }
    // Remove post from list.
    for (let i = 0; i < posts.length; i++)
      if (posts[i] === post) {
        posts.splice(i, 1);
        break;
      }
  }

  // Fill each bucket.
  for (const bucketname of bucketnames) {
    // First, fulfill the minimum.
    const min = topics[bucketname].min ?? 1;
    const max = topics[bucketname].max;
    for (const tag of topics[bucketname].tags) {
      // Count existing posts in the bucket which satisfy the tag.
      let count = buckets[bucketname].filter(p => p.data.tags.includes(tag)).length;
      while (count < min) {
        let found = false;
        for (let i = 0; i < posts.length; i++) {
          if (posts[i].data.tags.includes(tag)
              && !posts[i].data.tags.some(t => topics[bucketname].excludeTags.includes(t))) {
            count++;
            found = true;
            const [newPost] = posts.splice(i, 1);
            buckets[bucketname].push(newPost);
            break;
          }
        }
        if (!found) {
          console.warn(`Exhausted posts for tag '${tag}' in bucket '${bucketname}'. Unable to fulfill minimum required ${min} posts.`);
          break;
        }
      }
    }
    // Next, flesh out the bucket for the maximum.
    while (buckets[bucketname].length < max) {
      let found = false;
      for (let i = 0; i < posts.length; i++) {
        if (topics[bucketname].tags.some(t => posts[i].data.tags.includes(t))
            && !posts[i].data.tags.some(t => topics[bucketname].excludeTags.includes(t))) {
          found = true;
          const [newPost] = posts.splice(i, 1);
          buckets[bucketname].push(newPost);
          break;
        }
      }
      if (!found) {
        console.warn(`Exhausted posts for bucket '${bucketname}' with tags '${topics[bucketname].tags}'. Unable to fulfill maximum required ${max} posts.`);
        break;
      }
    }
  }

  // Finally, sort each bucket's posts by latest.
  for (const bucketname of bucketnames) {
    buckets[bucketname].sort((pa, pb) => pb.page.date - pa.page.date);
  }

  return buckets;
}
