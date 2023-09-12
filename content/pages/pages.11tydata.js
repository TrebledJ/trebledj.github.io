// const { getGitCommitDateFromPath } = require("eleventy-plugin-git-commit-date");

// const path = require("path");
// const spawn = require("cross-spawn");

// function getGitCommitDate(filePath, options) {
// 	return options ? getGitCommitDateFiltered(filePath, options) : getGitCommitDateFast(filePath);
// };

// function getGitCommitDateFast(filePath) {
// 	let output;

// 	try {
// 		output = spawn.sync(
// 			"git",
// 			["log", "-1", "--format=%at", path.basename(filePath)],
// 			{ cwd: path.dirname(filePath) }
// 		);
// 	} catch {
// 		throw new Error("Fail to run 'git log'");
// 	}

// 	if (output && output.stdout) {
// 		const ts = parseInt(output.stdout.toString("utf-8"), 10) * 1000;

// 		// Paths not commited to Git returns empty timestamps, resulting in NaN.
// 		// So, convert only valid timestamps.
// 		if (!isNaN(ts)) {
// 			return new Date(ts);
// 		}
// 	}
// }

// function getGitCommitDateFiltered(filePath, options) {
// 	const { keep, ignore } = options || {};

// 	function matchesWhitelist(subject) {
// 		return keep ? subject.match(keep) : true;
// 	}
// 	function matchesBlacklist(subject) {
// 		return ignore ? !subject.match(ignore) : true;
// 	}

// 	let output;

// 	try {
// 		output = spawn.sync(
// 			"git",
// 			["log", "--follow", "--format=%at %s", path.basename(filePath)],
// 			{ cwd: path.dirname(filePath) }
// 		);
// 	} catch {
// 		throw new Error("Fail to run 'git log'");
// 	}

// 	if (output && output.stdout) {
// 		const commits = output.stdout.toString("utf-8").split('\n');

// 		// Filter commits which match filter options.
// 		const filtered = commits.filter(s => {
// 			const subject = s.substring(s.indexOf(' ') + 1);
// 			return matchesWhitelist(subject) && matchesBlacklist(subject);
// 		});

// 		if (filtered && filtered[0]) {
// 			// Grab latest commit timestamp.
// 			const s = filtered[0];
// 			const ts = parseInt(s.substring(0, s.indexOf(' ')), 10) * 1000;

// 			// Paths not commited to Git returns empty timestamps, resulting in NaN.
// 			// So, convert only valid timestamps.
// 			if (!isNaN(ts)) {
// 				return new Date(ts);
// 			}
// 		}
// 	}
// }


module.exports = {
	tags: [
	],
	layout: "layouts/post-default",
	eleventyComputed: {
		// If ever the updated date is wrong in production, just increase checkout fetch-depth in deploy.yml.
		// This is because git log couldn't find the old commits.
		// lastContentCommit: data => process.env.ENVIRONMENT === 'development' ? undefined : getGitCommitDate(data.page.inputPath, { keep: /^content/ }),
		permalink: data => '/' + data.page.fileSlug + '/index.html',
	},
	author: "trebledj",
	thumbnail_src: "~/assets/img/posts/thumbnail/default.png",
	thumbnail_banner: false,
	sharable: false,
	comments: false,
	related: {
		auto: true,
		num: 4,
		disable: false,
	},
	eleventyExcludeFromCollections: true,
};
