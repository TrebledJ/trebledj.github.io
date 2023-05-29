const path = require("path");
const eleventyImage = require("@11ty/eleventy-img");


module.exports = function (eleventyConfig) {
    const breakpoints = (process.env.ENVIRONMENT === 'production' ? [512, 1024] : []);

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
            widths: [...breakpoints, "auto"],
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
            classes.push('rw');     // Responsive-width for small screens.
            classes.push('mb-2');   // Extra spacing in the bottom.
        }
        classes.reverse();
        return classes;
    }

    function makeImage(src, classes, alt, style, loading = 'lazy', decoding = 'async') {
        return `<img src="${src}" class="${classes}" alt="${alt}" title="${alt}" style="${style}" loading="${loading}" decoding="${decoding}">`;
    }

    function makeImageFromMetadata(metadata, ext, classes, alt, loading = 'lazy', thumbnail = false, attrs = {}) {
        const fmt = metadata[ext];
        let auto = fmt.filter(e => !breakpoints.includes(e.width))[0]; // Get default (auto) image.
        if (!auto) // auto clashed with a breakpoint width.
            auto = fmt[fmt.length - 1]; // Use largest res item as default.

        function makeSizes() {
            const _default = `${auto.width}px`;
            if (thumbnail) {
                const special = 512, specialBreak = 2000;
                const max = Math.max(...breakpoints, auto.width);
                if (breakpoints.includes(special)) {
                    const bps = [`(max-width: ${specialBreak-1}px) ${special}px`, `(min-width: ${specialBreak}px) ${max}px`];
                    return [...bps, _default].join(', ');
                } else {
                    console.warn(`${special}px is not breakpoint size. Skipping thumbnail calculations.`);

                    return _default;
                }
            } else {
                const bps = [...breakpoints.filter(bp => bp <= max_width).map(bp => `(max-width: ${bp}px) ${bp}px`)];
                return [...bps, _default].join(', ');
            }
        }

        const max_width = fmt[fmt.length - 1].width;
        const srcset = fmt.map(entry => entry.srcset).join(", ");
        const sizes = makeSizes();
        const attr_str = Object.entries(attrs).map((k, v) => `${k}="${v}"`).join(' ');
        return `<img class="${classes.join(' ')}" src="${auto.url}" alt="${alt}" title="${alt}" srcset="${srcset}" sizes="${sizes}" loading="${loading}" decoding="async" style="aspect-ratio: auto ${auto.width} / ${auto.height}" />`.replaceAll(/\s{2,}/g, ' ');
    }


    async function imageShortcode(src, altText, classes, loading = 'lazy') {
        const { ext, file, options } = getOptions(src);
        const metadata = await eleventyImage(file, options);

        classes = amendClasses(classes);

        // const data = metadata[ext][metadata[ext].length - 1];
        // const ratio = `aspect-ratio: auto ${data.width} / ${data.height};`; // Alleviate content layout shift.

        // return makeImage(data.url, classes.join(' '), altText, ratio, loading = loading);
        return makeImageFromMetadata(metadata, ext, classes, altText, loading);
    }

    async function bannerImageShortcode(src, altText, classes) {
        // Image gets displayed near the top, so it'll almost always be displayed.
        // Load eagerly, to push first contentful paint.
        return imageShortcode(src, altText, classes, loading = 'eager');
    }

    function thumbnailShortcode(src, altText, classes) {
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
        // const data = metadata[ext][metadata[ext].length - 1];
        // const ratio = `aspect-ratio: auto ${data.width} / ${data.height};`; // Alleviate content layout shift.

        // return makeImage(data.url, classes.join(' '), altText, ratio);
        return makeImageFromMetadata(metadata, ext, classes, altText, thumbnail = true);
    }

    // Eleventy Image shortcode
    // https://www.11ty.dev/docs/plugins/image/
    eleventyConfig.addAsyncShortcode("image", imageShortcode);

    eleventyConfig.addAsyncShortcode("banner", bannerImageShortcode);

    // Synchronous shortcode. Useful for Nunjucks macro.
    // Doesn't work with remote URLs.
    eleventyConfig.addShortcode("thumbnail", thumbnailShortcode);

    eleventyConfig.addShortcode("video", function (src, classes) {
        classes = amendClasses(classes);
        if (src.startsWith('assets/')) {
            src = src.replace(/^assets/, '');
        }
        const ext = src.split('.').pop();
        return `<div class="${classes.join(' ')}"><video autoplay loop muted class="w-100"><source src="${src}" type="video/${ext}"></video></div>`;
    });
};