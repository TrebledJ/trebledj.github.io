const path = require("path");
const cheerio = require('cheerio');
const chalk = require('chalk');
const eleventyImage = require("@11ty/eleventy-img");


module.exports = function (eleventyConfig) {
    const thumbWidth = 512; // Thumbnail default max width.
    const breakpoints = (process.env.ENVIRONMENT === 'production' ? [256, thumbWidth, 1024] : [thumbWidth]);
    const imageWidths = [...breakpoints, "auto"];

    // Returns a path relative to a file.
    // For example, relativeToInputPath(./content/posts/a/foo.md, assets/image.jpg) --> ./content/posts/a/assets/image.jpg.
    function relativeToInputPath(inputPath, relativeFilePath) {
        return path.dirname(inputPath) + path.sep + relativeFilePath;
    }

    // Get settings and options.
    function getOptions(src) {
        const extDefault = ['gif'].find(ext => src.endsWith(ext)); // Use the extension special? Then use it.
        const ext = extDefault || 'webp';
        const animated = src.endsWith('gif');

        // Full list of formats here: https://www.11ty.dev/docs/plugins/image/#output-formats
        const file = src;
        const options = {
            widths: imageWidths,
            formats: [ext],
            outputDir: path.join(eleventyConfig.dir.output, "img"),
            sharpOptions: {
                animated,
            },
            filenameFormat: function (id, src, width, format, options) {
                const extension = path.extname(src);
                const name = path.basename(src, extension);
        
                return `${name}-${width}w.${format}`;
            },
        };
        return { ext, file, options };
    }

    // Modify classes with custom processing, returns an array of classes.
    function amendClasses(classes) {
        classes = (typeof classes === 'string' ? classes.split(' ') : typeof classes === 'undefined' ? [] : classes);
        classes.reverse(); // Add classes to the front.

        const substitutions = {
            'post1': [
                'center',
                'rw',       // Responsive-width for small screens.
                'mb-2',     // Extra spacing in the bottom.
            ],
            'floatl1': ['m-1', 'float-left', 'rw'],
            'floatr1': ['m-1', 'float-right', 'rw'],
            'floatl1-md': ['m-1', 'float-left-md', 'rw-md'],
            'floatr1-md': ['m-1', 'float-right-md', 'rw-md'],
        };

        for (const key of Object.keys(substitutions)) {
            if (classes.includes(key)) {
                // Remove class.
                classes.splice(classes.indexOf(key), 1);

                if (classes.every(c => !c.startsWith('w-')))
                    classes.push('w-100'); // Default to full-width;
        
                // Push rest of classes.
                classes.push(...substitutions[key]);
            }
        }
        
        classes.reverse();
        return classes;
    }

    function makeImageFromMetadata(metadata, ext, classes, alt, thumbnail = false, attrs = {}) {
        const fmt = metadata[ext];
        // Get default ("auto" width) image.
        let defsrc = fmt.filter(e => !breakpoints.includes(e.width))[0];
        if (thumbnail) {
            // For thumbnails, use the prescribed-width image.
            defsrc = fmt.filter(e => e.width == thumbWidth)[0] || defsrc;
        }
        if (!defsrc) {
            // Use largest res item as default.
            defsrc = fmt[fmt.length - 1];
        }

        // Use a smaller max width for thumbnails.
        const maxWidth = thumbnail ? thumbWidth : fmt[fmt.length - 1].width;

        // Construct srcset/sizes.
        const srcset = fmt.map(entry => entry.srcset).join(", ");
        const bps = breakpoints.filter(bp => bp <= maxWidth);
        const sizes = [...bps.map(bp => `(max-width: ${bp}px) ${bp}px`), `${defsrc.width}px`].join(', ');

        // Overwrite params.
        attrs = {
            decoding: 'async',
            style: '',
            ...attrs,
            srcset,
            sizes,
        };

        attrs.style += `aspect-ratio: auto ${defsrc.width} / ${defsrc.height}`;

        const attr_str = Object.entries(attrs).map(e => `${e[0]}="${e[1]}"`).join(' ');
        return `<img class="${classes.join(' ')}" alt="${alt}" title="${alt}" src="${defsrc.url}" ${attr_str} />`.replaceAll(/\s{2,}/g, ' ');
    }

    async function imageShortcode(src, altText, classes, loading = 'lazy') {
        altText ||= '';
        classes ||= '';
        const { ext, file, options } = getOptions(src);
        const metadata = await eleventyImage(file, options);
        classes = amendClasses(classes);
        return makeImageFromMetadata(metadata, ext, classes, altText, false, {loading});
    }

    async function heroImageShortcode(src, altText, classes) {
        // Image gets displayed near the top, so it'll almost always be displayed.
        // Load eagerly, to push first contentful paint.
        src = resolveResourcePath(this.page, src);
        return imageShortcode(src, altText, classes, 'eager');
    }

    function thumbnailShortcode(post, classes) {
        const page = post.page;
        const src = resolveResourcePath(page, post.data.thumbnail_src);
        const altText = post.data.title;

        const { ext, file, options } = getOptions(src);
        eleventyImage(file, options);
        classes = amendClasses(classes);
        const metadata = eleventyImage.statsSync(file, options);

        return makeImageFromMetadata(metadata, ext, classes, altText, true, {loading: 'lazy'});
    }

    /**
     * Resolve a resource path from a post (.md) context to an input path relative to the project dir.
     * 
     * Example:
     * 
     * Suppose we're writing in ./content/posts/a/b.md
     *  ~/assets/img/c.jpg  ~>  ./assets/img/c.jpg
     *  ./assets/img/d.jpg  ~>  ./content/posts/a/d.jpg
     */
    function resolveResourcePath(page, src) {
        if (page !== undefined) {
            if (src.startsWith('http')) {
                // Online resource. Don't touch.
            } else if (src.startsWith('~/')) {
                // Relative to the project folder.
                src = './' + src.slice(2);
            } else {
                // Relative to the current page.
                src = relativeToInputPath(page.inputPath, src);
            }
        }
        return src;
    }

    // Returns path of image relative to _site.
    eleventyConfig.addFilter("resolveImageOutputPath", function (src, page) {
        const path = resolveResourcePath(page, src);
        const { ext, file, options } = getOptions(path);
        const metadata = eleventyImage.statsSync(file, options);
        return metadata[ext][0].url;
    });

    // Eleventy Image shortcode
    // https://www.11ty.dev/docs/plugins/image/
    eleventyConfig.addAsyncShortcode("image", async function (src, ...args) {
        const file = resolveResourcePath(this.page, src);
        return imageShortcode(file, ...args);
    });

    eleventyConfig.addAsyncShortcode("hero", heroImageShortcode);

    // Synchronous shortcode. Useful for Nunjucks macro.
    // Doesn't work with remote URLs.
    eleventyConfig.addShortcode("thumbnail", thumbnailShortcode);

    eleventyConfig.addShortcode("video", function (src, classes) {
        classes = amendClasses(classes);
        classes.push('video');
        if (src.startsWith('assets/')) {
            src = src.replace(/^assets\//, '');
        }
        const ext = src.split('.').pop();
        return `<div class="${classes.join(' ')}"><video autoplay loop muted class="w-100"><source src="/img/${src}" type="video/${ext}"></video></div>`;
    });

    eleventyConfig.addPairedShortcode("images", function (images, containerClasses) {
        // Width ratio threshold. Images with a width ratio lower than this may be hard to see.
        const H_AUTO_WIDTH_RATIO_THRESHOLD = 0.2;

        // Multiplier to shrink the effective width so that images fit within the container.
        const CONTAINER_EFFECTIVE_WIDTH = 0.92;

        containerClasses ||= '';

        const defaultWidths = {
            2: 'w-45',
            3: 'w-30',
        };
        
        const $ = cheerio.load(images, null, false); // Load images (in fragment mode).
        const imgNodes = $("img");
        const numImages = imgNodes.length;

        const wh = [...imgNodes].map(e => e.attribs.style.match(/(\d+) \/ (\d+)/).slice(1).map(n => +n));
        const widths = wh.map(x => x[0]);
        const heights = wh.map(x => x[1]);

        if (containerClasses.split(' ').includes('h-auto')) {
            // h-auto: Make images have equal height so it appears as one seamless block.
            
            // Make equal height.
            for (let i = 1; i < numImages; i++) {
                scale = heights[0] / heights[i];
                widths[i] *= scale;
                heights[i] *= scale;
            }
            
            // Calculate width ratios.
            const totalWidth = widths.reduce((a, b) => a + b, 0);
            const ratios = widths.map(w => w / totalWidth * CONTAINER_EFFECTIVE_WIDTH);

            for (let i = 0; i < numImages; i++) {
                if (ratios[i] < H_AUTO_WIDTH_RATIO_THRESHOLD) {
                    console.warn(chalk.yellow(`[images][h-auto]: width for image[${i}] is less than ${Math.ceil(H_AUTO_WIDTH_RATIO_THRESHOLD * 100)}%.`));
                    console.warn(chalk.yellow(`\tUsers may need to squint hard to see the image.`));
                    console.warn(chalk.yellow(`\tConsider reorganising your images.`));
                    console.warn(chalk.yellow(`\tsource: ${imgNodes[i].attribs.src}`));
                }
            }

            for (let i = 0; i < numImages; i++) {
                // Express ratio as percentage, rounded to two dp.
                perc = Math.round((ratios[i] * 100 + Number.EPSILON) * 100) / 100;
                imgNodes[i].attribs.style = `width:${perc}%;` + imgNodes[i].attribs.style;
            }

        } else {
            // Default: assign equal-width.
    
            if (!defaultWidths[numImages]) {
                throw new Error(`Default {% images %} is only implemented for ${Object.keys(defaultWidths).join(',')} images`);
            }

            // Don't add width if already added.
            for (let i = 0; i < numImages; i++) {
                if (!imgNodes[i].attribs.class.split(' ').some(e => e.startsWith('w-'))) {
                    imgNodes.slice(i, i+1).addClass(defaultWidths[numImages]);
                }
            }
        }

        // Add `multi` class.
        for (let i = 0; i < numImages; i++) {
            imgNodes.slice(i, i+1).addClass('multi');
        }

        images = $.html();

        return `<div class="center rw ${containerClasses}">${images}</div>`;
    });

};