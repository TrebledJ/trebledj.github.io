module.exports = function () {
	const email = "trebledjjj@gmail.com"

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
			bio: `Hi! I'm a final year HKUST mathematics undergrad.
			I'm passionate about [programming](/tags/programming) and [composing music](/tags/composition).
			I'm also interested in a wide range of fields: [robotics](/tags/robotics), [cybersecurity](/tags/ctf),
			[application development](/tags/apps), and software engineering in general.
			I'm excited about developing applications to solve problems and provide an educational interface for learners.`
		},
		navpages: [
			{ text: 'Home', url: '/' },
			{ text: 'Posts', url: '/posts' },
			{ text: 'Projects', url: '/tags/project' },
			{ text: 'Music', url: '/music' },
		],
		github_username: "TrebledJ",
		musescore_id: "20636901",
		google_analytics: "G-7TQ4WV0LMK",
		disqus_shortname: "trebledj",
		soundcloud_color: "2631c8",
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
		]
	};
};