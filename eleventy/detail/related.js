const chalk = require('chalk');

/**
 * Helper function to convert a string pattern to a regex.
 * @param {string} slug
 */
function makeRelatedPostRegex(slug) {
  if (slug.startsWith('r/')) {
    const toks = slug.split('/');
    if (toks.length > 2) {
      // Discard first and last tokens.
      const flags = toks[toks.length - 1];
      const pat = toks.slice(1, toks.length - 1).join('/');
      return {
        regex: new RegExp(pat, `${flags.replace(/r/g, '')}g`),
        flags: {
          rev: flags.includes('r'),
        },
      };
    }
    throw new Error(`[related] Found pattern ${slug}, which looks like a regex pattern, but is missing some slashes.`);
  }
  // Match a full string.
  return { regex: new RegExp(`^${slug}$`), flags: {} };
}

/**
 * Find posts related to a particular post.
 * @param {Array[post]} posts All relevant posts to link.
 * @param {post} tags The tags of this post.
 * @param {object} related Settings and options.
 *  - disable: bool
 *      - Whether to disable the related posts section. (Handled in templating, not here.)
 *  - excludeOthers: bool
 *      - Whether to disable OTHER posts from linking to THIS post in their
 *        related section via tags/auto-algorithms.
 *  - num: int
 *      - Maximum number of posts to find.
 *  - posts: Array[string]
 *      - An array of posts that will be marked as related no matter what.
 *      - These can be a regex pattern, following the syntax: r/regex-inside.*[0-9]/[flags]
 *          - [flags]: Any regex-flags (g is enabled by default), along with...
 *              - r: Reverse the matched posts, so that the oldest ones appear first.
 *      - Only the first `related.num` items will be added.
 *  - tags: Array[string]
 *      - Find posts with the same tags contained in this array.
 *      - Only posts which contain all of the listed tags are considered.
 *  - auto: bool
 *      - Whether to automagically look for relevant posts using an internal algorithm.
 *  - minCommonTags: int
 *      - If a post has at least this many common tags, then it is considered related.
 *      - Applies only if related.auto is true.
 *
 * @returns An array of related posts.
 */
function getRelatedPosts(posts, tags, related) {
  if (!related)
    return [];

  const numTargetPosts = related.num ?? 0; // Number of related elements to find.

  // In auto checking, if a post has at least this many percentage of common tags, then it is considered related.
  const minCommonTags = related.minCommonTags ?? 3;

  const finalRelated = new Set(); // Final array of related posts.

  const fileSlug = this.page.fileSlug;

  function addPosts(candidatePosts, force = false) {
    for (const post of candidatePosts) {
      if (finalRelated.size >= numTargetPosts)
        break;
      if (post.page.fileSlug === fileSlug || finalRelated.has(post))
        continue;
      if (!force && post.data.related?.excludeOthers)
        continue;

      finalRelated.add(post);
    }
  }

  // Force related posts into the array.
  if (related.posts) {
    for (const slug of related.posts) {
      if (finalRelated.size >= numTargetPosts)
        break;

      // Find post(s)...
      const { regex, flags } = makeRelatedPostRegex(slug);
      const matches = posts.filter(e => e.page.fileSlug.match(regex));
      if (!matches) {
        console.error(chalk.red(
          `[related] No matches for post regex '${regex.source}' provided in related.posts of ${fileSlug}.`,
        ));
        continue;
      }

      if (flags.rev)
        matches.reverse();

      addPosts(matches, true);
    }
  }

  // Find relevant posts with same tags as `related.tags`.
  if (related.tags) {
    for (const post of posts) {
      if (finalRelated.size >= numTargetPosts)
        break;

      if (related.tags.every(t => post.data.tags.includes(t)))
        addPosts([post]);
    }
  }

  function countCommon(a, b) {
    let count = 0;
    for (const e of a) {
      if (e === 'posts')
        continue; // Skip meta, catch-all tags.
      if (b.includes(e))
        count++;
    }
    return count;
  }

  if (related.auto) {
    // Find posts that have common tags with this post.
    const sorted = posts.slice()
      .map(p => [p, countCommon(tags, p.data.tags) - 1])
      .filter(([_, n]) => n >= minCommonTags)
      .sort(([_a, na], [_b, nb]) => nb - na)
      .map(([post, _]) => post);

    // Add until full.
    addPosts(sorted.slice(0, numTargetPosts - finalRelated.size));
  }

  return Array.from(finalRelated);
}

/**
 * Find groups of tags related to some tags.
 *
 * @param {Array[String]} tags The list of tags to query.
 * @param {Array[Object]} tagPages A collection of tag pages and data.
 * @param {Object[String, Number]} tagCount Maps a tag to the number of pages containing that tag.
 */
function getRelatedTags(tags, tagPages, tagCount) {
  const groups = {};

  // Find the groups we're interested in, and create skeletons in the `tags` object.
  for (const p of tagPages) {
    if (tags.includes(p.data.tag)) {
      if (!groups[p.data.group]) {
        groups[p.data.group] = {
          src: [p.data.tag],
          related: [],
        };
      } else {
        groups[p.data.group].src.push(p.data.tag);
      }
    }
  }

  const wantedGroups = Object.keys(groups);
  for (const p of tagPages) {
    // const includeCurrentTags = !groups[p.data.group].src.includes(p.data.tag);
    const includeCurrentTags = true;
    if (wantedGroups.includes(p.data.group) && includeCurrentTags)
      groups[p.data.group].related.push(p.data);
  }

  const ret = [];
  Object.keys(groups).forEach(g => {
    groups[g].group = g;
    ret.push(groups[g]);
  });

  const depth = obj => (obj.group.match(/\./g) ?? []).length;

  // Sort by "depth" (most number of '.'s appear first).
  ret.sort((a, b) => depth(b) - depth(a));
  // Sort related tags by number of posts.
  ret.forEach(o => o.related.sort((a, b) => tagCount[b.tag] - tagCount[a.tag]));
  // console.log(JSON.stringify(ret.map(d => d.related.flatMap(p => p.tag + '-' + tagCount[p.tag]))));
  return ret;
}

/**
 * Get groups of tags by their directory prefix.
 * (Based on DIRECTORY, not title!)
 */
function getTagsByPrefix(prefix, tagPages) {
  const groups = {};

  // Find the groups we're interested in, and create skeletons in the `tags` object.
  for (const p of tagPages) {
    if (p.data.group.startsWith(prefix)) {
      if (!groups[p.data.group]) {
        groups[p.data.group] = {
          src: [],
          related: [p.data],
        };
      } else {
        groups[p.data.group].related.push(p.data);
      }
    }
  }

  const ret = [];
  Object.keys(groups).forEach(g => {
    groups[g].group = g;
    ret.push(groups[g]);
  });

  const depth = obj => (obj.group.match(/\./g) ?? []).length;

  // Sort by "depth" (least number of '.'s appear first).
  ret.sort((a, b) => depth(a) - depth(b));

  return ret;
}

module.exports = { getRelatedPosts, getRelatedTags, getTagsByPrefix };
