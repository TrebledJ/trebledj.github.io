module.exports = function () {
	const email = "trebledjjj@gmail.com"
	const bio = `
Hi! I'm a final year undergrad studying mathematics at the Hong Kong University of Science and Technology. \
I love to [code](/tags/programming) and [compose music](/tags/composition). \
I'm also interested in a wide range of fields: [robotics](/tags/robotics), [cybersecurity](/tags/ctf), \
[application development](/tags/apps), and software engineering in general. \
I like [math](/tags/mathematics) as well, although I'm terrible at it. \
I'm excited to develop applications to solve problems, share ideas through writing, and learn more about the small world we're stuck on.

Feel free to [reach out](#contact) for whatever reason. ヽ(・∀・)ﾉ
`.trim();

	return {
		title: "TrebledJ's Pages",
		subtitle: "Dabbling in code, music, math, and memes since conception.",
		url: "https://trebledj.github.io",
		language: "en",
		description: "TrebledJ's personal blog on programming, music, and memes.",
		author: {
			alias: "TrebledJ",
			name: "Johnathan",
			email: email,
			logo: "profile.png",
			bio: bio,
		},
		navpages: [
			{ text: 'Home', url: '/' },
			{ text: 'Posts', url: '/posts' },
			{ text: 'Projects', url: '/tags/project' },
			{ text: 'Music', url: '/music' },
		],
		github_username: "TrebledJ",
		musescore_id: "20636901",
		// google_analytics: "G-7TQ4WV0LMK",
		disqus_shortname: "trebledj",
		soundcloud_color: "2631c8",
		getform_endpoint: "3b2a26ea-31c4-49ef-a496-d4d765773e59",
		getform_sitekey: "85d67539-c1f8-4bed-b164-17c3b4528972",
		social: [
			{ name: "GitHub", icon: "fab fa-github", color: 'rgb(150, 60, 180)', link: "http://github.com/TrebledJ" },
			{ name: "StackOverflow", icon: "fab fa-stack-overflow", color: 'rgb(236, 124, 34)', link: "https://stackoverflow.com/users/10239789/trebledj" },
			// { name: "CodinGame", img: "/img/logos/codingame.png", link: "https://www.codingame.com/profile/8444100ecb9723c1ec542346b0630aaa2821532" },
			{ name: "SoundCloud", icon: "fab fa-soundcloud", color: 'rgb(237, 110, 30)', link: "https://soundcloud.com/trebledj" },
			{ name: "MuseScore", img: "/img/logos/musescore.png", link: "https://musescore.com/user/20636901" },
			// {name: "Spotify", icon: "fab fa-spotify", link: "https://open.spotify.com/user/24i9exez29k1jr85olljuy94g?si=4213a229649f4ceb"},
			{ name: "Discord (TrebledJ#7595)", icon: "fab fa-discord", color: 'rgb(84, 100, 235)', link: `https://discordapp.com/users/220427982798454794` },
			{ name: "Mail", icon: "fas fa-envelope", link: `mailto:${email}` },
			{ name: "Feeds", icon: "fas fa-rss", link: "/feeds" },
		],
		environment: process.env.ENVIRONMENT || 'development',
		content_security_policy: `
		default-src 'self';
		script-src 'self' 'unsafe-inline' *.disqus.com a.disquscdn.com code.jquery.com gist.github.com cdn.jsdelivr.net launchpad-wrapper.privacymanager.io;
		style-src 'self' 'unsafe-inline' a.disquscdn.com cdn.jsdelivr.net github.githubassets.com;
		font-src 'self' cdn.jsdelivr.net;
		img-src 'self' data: *;
		frame-src disqus.com *.soundcloud.com;
		prefetch-src *.disquscdn.com disqus.com;
		`,
		contact_placeholder: {
			name: 'Jon Dough',
			email: 'jondough@example.com',
			subject: "Doh'nuts.",
			message: `Got blog content suggestions, feedback, or comments? Lemme know!`,
		},
	};
};