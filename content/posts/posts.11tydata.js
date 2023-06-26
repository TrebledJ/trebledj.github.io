const { getGitCommitDateFromPath } = require("eleventy-plugin-git-commit-date");

const path = require("path");
const spawn = require("cross-spawn");

function getGitCommitDateFromPathByMessage(filePath, regex) {
	let logs;

	try {
		logs = spawn.sync(
			"git",
			["log", "--follow", "--format=%at %s", path.basename(filePath)],
			{ cwd: path.dirname(filePath) }
		);
	} catch {
		throw new Error("Fail to run 'git log'");
	}

	if (logs && logs.stdout) {
		const commits = logs.stdout.toString("utf-8").split('\n');

		// Filter commits which match the regex.
		const outputs = !regex ? commits : commits.filter(s => s.substring(s.indexOf(' ') + 1).match(regex));

		if (outputs && outputs[0]) {
			// Grab latest commit timestamp.
			const s = outputs[0];
			const ts = parseInt(s.substring(0, s.indexOf(' ')), 10) * 1000;

			// Paths not commited to Git returns empty timestamps, resulting in NaN.
			// So, convert only valid timestamps.
			if (!isNaN(ts)) {
				return new Date(ts);
			}
		}
	}
};


module.exports = {
	tags: [
		"posts"
	],
	layout: "layouts/post-default",
	eleventyComputed: {
		// If ever the updated date is wrong in production, just increase checkout fetch-depth in deploy.yml.
		// This is because git log couldn't find the old commits.
		updated: data => process.env.ENVIRONMENT === 'development' ? new Date() : getGitCommitDateFromPathByMessage(data.page.inputPath, /^content/),
		permalink: data => '/posts/' + data.page.fileSlug + '/index.html',
	},
	author: "trebledj",
	thumbnail: "/img/posts/thumbnail/default.png",
	include_thumbnail: false,
	sharable: true,
	comments: true,
	related: {
		auto: true,
		num: 4,
		disable: false,
	},
	eleventyExcludeFromCollections: false,
};
