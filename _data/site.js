const csp = require('./csp');

module.exports = function () {
	const email = "trebledjjj@gmail.com"

	return {
		title: "TrebledJ's Pages",
		subtitle: "Dabbling in code, music, math, and memes since conception.",
		url: "https://trebledj.github.io",
		baseurl: "",
		language: "en",
		description: "TrebledJ's personal blog on programming, music, and memes.",

		author: {
			alias: "TrebledJ",
			name: "Johnathan",
			email: email,
			logo: "profile-icon.jpg",
			bio: `
			Hi! (｡＾ ᴗ＾)ﾉ
			I'm a recent graduate of the [Hong Kong University of Science and Technology (HKUST)](http://hkust.edu.hk/).
			I'm passionate in a wide range of fields, from [software engineering](/tags/software-engineering) to [music](/tags/music).
			Software engineering is such a vast field.
			There's almost an endless thrill in building robust [apps](/tags/apps), exploring the deep field of [cybersecurity](/tags/ctf), and the toying with [robots](/tags/robotics) and circuitry.
			And let's not forget the gritty (yet beautiful) art of [programming](/tags/programming)—simply enjoying [languages](/tags/programming-languages) for their succinctness or ability to express complex thoughts.
			
			More about me? I like to solve problems, learn new things, and pass it on through teaching.
			In my spare time, I enjoy taking walks, [composing music](/tags/composition), playing the occasional [CTF](/tags/ctf), and putting my thoughts down to ~~paper~~ text.
			
			Feel free to [reach out](#contact) for whatever reason. ヽ(・∀・)ﾉ
			`.trim().replace(/^[ \t]+/gm, ''),
		},
		navpages: [
			{ text: 'Home', url: '/' },
			{ text: 'Posts', url: '/posts' },
			{ text: 'Projects', url: '/tags/project' },
			{ text: 'Music', url: '/music' },
		],
		search: {
			// https://fontawesome.com/icons/
			resultIcons: [
				{ tag: "project", icon: "star" },
				{ tag: "experience", icon: "rocket" },
				{ tag: "ctf", icon: "flag" },
				{ tag: "composition", icon: "music" },
				{ tag: "embedded", icon: "bolt" },
				{ tag: "programming", icon: "code" },
			],
			resultDefaultIcon: "book",
		},
		analytics: {
			// Pick your poison.
			// google: "G-7TQ4WV0LMK",
			cloudflare: "0c1f01f6fd2340a9a7c7abb8072e3857",
		},
		id: {
			// Unique identifiers and instances.
			musescore: "20636901",
			disqus: "trebledj",
			getform: "3b2a26ea-31c4-49ef-a496-d4d765773e59",
			hcaptcha: "85d67539-c1f8-4bed-b164-17c3b4528972",
		},
		color: {
			soundcloud: "2631c8",
		},
		social: [
			{ name: "GitHub", icon: "fab fa-github", color: 'rgb(150, 60, 180)', link: "https://github.com/TrebledJ" },
			{ name: "StackOverflow", icon: "fab fa-stack-overflow", color: 'rgb(236, 124, 34)', link: "https://stackoverflow.com/users/10239789/trebledj" },
			{ name: "CodinGame", img: "/img/logos/codingame.webp", link: "https://www.codingame.com/profile/8444100ecb9723c1ec542346b0630aaa2821532" },
			{ name: "SoundCloud", icon: "fab fa-soundcloud", color: 'rgb(237, 110, 30)', link: "https://soundcloud.com/trebledj" },
			{ name: "MuseScore", img: "/img/logos/musescore.webp", link: "https://musescore.com/user/20636901" },
			// {name: "Spotify", icon: "fab fa-spotify", link: "https://open.spotify.com/user/24i9exez29k1jr85olljuy94g?si=4213a229649f4ceb"},
			{ name: "Discord (TrebledJ#7595)", icon: "fab fa-discord", color: 'rgb(84, 100, 235)', link: `https://discordapp.com/users/220427982798454794` },
			{ name: "Mail", icon: "fas fa-envelope", link: `mailto:${email}` },
			{ name: "Feeds", icon: "fas fa-rss", link: "/feeds" },
		],
		environment: process.env.ENVIRONMENT || 'development',
		content_security_policy: csp,
		contact_placeholder: {
			name: 'Humpty Dumpty',
			email: 'example@gmail.com',
			subject: "I had a great fall!",
			message: `Got suggestions, feedback, or comments? Lemme know!`,
		},
	};
};
