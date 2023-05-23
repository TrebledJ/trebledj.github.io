const path = require("path");
const eleventyImage = require("@11ty/eleventy-img");


module.exports = function (eleventyConfig) {
    function relativeToInputPath(inputPath, relativeFilePath) {
        let split = inputPath.split("/");
        split.pop();

        return path.resolve(split.join(path.sep), relativeFilePath);
    }

    // Get settings and options.
    function getOptions(src) {
        const extDefault = ['gif'].find(ext => src.endsWith(ext)); // Use the extension special? Then use it.
        const ext = extDefault || 'webp';
        const animated = src.endsWith('gif');

        // Full list of formats here: https://www.11ty.dev/docs/plugins/image/#output-formats
        const formats = [ext];
        // let file = relativeToInputPath(this.page.inputPath, src);
        const file = src;
        const options = {
            widths: ["auto"],
            formats,
            outputDir: path.join(eleventyConfig.dir.output, "img"),
            sharpOptions: {
                animated,
            },
        };
        return { ext, file, options };
    }

    // Modify classes with custom processing, returns an array of classes.
    function amendClasses(classes) {
        classes = (typeof classes === 'string' ? classes.split(' ') : typeof classes === 'undefined' ? [] : classes);
        classes.reverse(); // Add classes to the front.
        if (classes.includes('post1')) {
            // Remove class.
            classes.splice(classes.indexOf('post1'), 1);

            if (classes.every(c => !c.startsWith('w-')))
                classes.push('w-100'); // Default to full-width;

            // Solo image.
            classes.push('center');
            classes.push('rw'); 	// Responsive-width for small screens.
            classes.push('mb-2'); 	// Extra spacing in the bottom.
        }
        classes.reverse();
        return classes;
    }

    function makeImage(src, classes, alt, style) {
        return `<img src="${src}" class="${classes}" alt="${alt}" title="${alt}" style="${style}" loading="lazy" decoding="async">`;
    }


    async function imageAsyncShortcode(src, altText, classes) {
        const { ext, file, options } = getOptions(src);
        const metadata = await eleventyImage(file, options);

        classes = amendClasses(classes);

        const data = metadata[ext][metadata[ext].length - 1];
        const ratio = `aspect-ratio: auto ${data.width} / ${data.height};`; // Alleviate content layout shift.

        return makeImage(data.url, classes.join(' '), altText, ratio)
    }

    function imageSyncShortcode(src, altText, classes) {
        if (process.env.ENVIRONMENT !== 'production') {
            // Skip image plugin.
            classes = amendClasses(classes);
            if (src.startsWith('assets')) {
                src = '/' + src.split('/').slice(1).join('/');
            }
            return makeImage(src, classes.join(' '), altText, '')
        }

        const { ext, file, options } = getOptions(src);
        eleventyImage(file, options);

        classes = amendClasses(classes);

        const metadata = eleventyImage.statsSync(file, options);
        const data = metadata[ext][metadata[ext].length - 1];
        const ratio = `aspect-ratio: auto ${data.width} / ${data.height};`; // Alleviate content layout shift.

        return makeImage(data.url, classes.join(' '), altText, ratio)
    }

    // Eleventy Image shortcode
    // https://www.11ty.dev/docs/plugins/image/
    eleventyConfig.addAsyncShortcode("image", imageAsyncShortcode);

    // Synchronous shortcode. Useful for Nunjucks macro.
    // Doesn't work with remote URLs.
    eleventyConfig.addShortcode("imageSync", imageSyncShortcode);
};