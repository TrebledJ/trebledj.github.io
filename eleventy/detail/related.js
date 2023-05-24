const chalk = require('chalk');

/**
 * Helper function to convert a string pattern to a regex.
 * @param {*} string 
 */
function makeRelatedPostRegex(slug) {
    if (slug.startsWith('r/')) {
        const toks = slug.split('/');
        if (toks.length > 2) {
            // Discard first and last tokens.
            const flags = toks[toks.length - 1];
            const pat = toks.slice(1, toks.length - 1).join('/');
            return {
                regex: new RegExp(pat, flags.replace(/r/g, '') + 'g'),
                flags: {
                    rev: flags.includes('r'),
                },
            };
        } else {
            throw new Error(`[related] Found pattern ${slug}, which looks like a regex pattern, but is missing some slashes.`);
        }
    }
    // Match a full string.
    return { regex: new RegExp(`^${slug}$`), flags: {} };
}

/**
 * Find posts related to a particular post.
 * @param {*} posts All relevant posts to link.
 * @param {*} thisPost The post to target.
 * @param {*} related Settings and options.
 *  - disable: bool
 *      - Whether to disable the related posts section. (Handled in templating, not here.)
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
 *  - autoCommonTagsThreshold: float
 *      - If a post has at least this many percentage of common tags, then it is considered related.
 *      - Applies if related.auto is true.
 * 
 * @returns An array of related posts.
 */
module.exports = function (posts, thisPost, related) {
    const n = related.num || 0; // Number of related elements to find.

    // In auto checking, if a post has at least this many percentage of common tags, then it is considered related.
    const autoCommonTagsThreshold = related.autoCommonTagsThreshold || 0.4;

    const final_related = new Set(); // Final array of related posts.

    function add_posts(posts) {
        for (let i = 0; i < posts.length; i++) {
            if (final_related.size >= n)
                break;
            if (posts[i].page.fileSlug === thisPost.fileSlug)
                continue;

            final_related.add(posts[i]);
        }
    }

    // Force related posts into the array.
    if (related.posts) {
        for (const slug of related.posts) {
            if (final_related.size >= n) {
                break;
            }

            // Find post(s)...
            const {regex, flags} = makeRelatedPostRegex(slug);
            const matches = posts.filter(e => e.page.fileSlug.match(regex));
            if (!matches) {
                console.error(chalk.red(`[related] No matches for post regex '${pattern}' provided in related.posts of ${thisPost.fileSlug}.`));
                continue;
            }

            if (flags.rev) {
                matches.reverse();
            }

            add_posts(matches);
        }
    }

    // Find relevant posts with same tags as `related.tags`.
    if (related.tags) {
        for (const post of posts) {
            if (final_related.size >= n) {
                break;
            }
            if (post == thisPost || final_related.has(post)) {
                continue; // Already marked as related. Skip.
            }

            if (related.tags.every(t => post.data.tags.includes(t))) {
                final_related.add(post);
            }
        }
    }

    function countCommon(a, b) {
        let count = 0;
        for (const e of a) {
            if (b.includes(e))
                count++;
        }
        return count;
    }

    if (related.auto) {
        // Find posts that have common tags with this post.
        const thisTags = thisPost.data.tags;
        for (const post of posts) {
            if (final_related.size >= n) {
                break;
            }
            if (post == thisPost || final_related.has(post)) {
                continue; // Already marked as related. Skip.
            }

            if (countCommon(thisTags, post.data.tags) - 1 >= Math.ceil(thisTags.length * autoCommonTagsThreshold)) {
                final_related.add(post);
            }
        }
    }

    return Array.from(final_related);
};