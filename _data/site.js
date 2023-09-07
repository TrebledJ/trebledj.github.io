module.exports = function () {
	const email = "trebledjjj@gmail.com"
	const bio = `
Hi! (｡＾ ᴗ＾)ﾉ
I'm a recent graduate of the [Hong Kong University of Science and Technology (HKUST)](http://hkust.edu.hk/).
I'm passionate in a wide range of fields, from [software engineering](/tags/software-engineering) to [music](/tags/music).
Software engineering is such a vast field.
There's the joy and pain of [app development](/tags/apps), the tension and fun in [cybersecurity](/tags/ctf), and the tangible excitement of [robotics](/tags/robotics).
And let's not forget the gritty (yet beautiful) backbone of [programming](/tags/programming).

More about me? I like to solve problems, learn new things, and pass it on through teaching/mentoring.
In my spare time, I enjoy taking walks, [composing music](/tags/composition), play the occasional CTF, and putting my thoughts down on ~~paper~~ text.

Feel free to [reach out](#contact) for whatever reason. ヽ(・∀・)ﾉ
`.trim();

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
		hcaptcha_sitekey: "85d67539-c1f8-4bed-b164-17c3b4528972",
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
		content_security_policy: `
		default-src 'self';
		script-src 'self' 'unsafe-inline' *.disqus.com *.disquscdn.com code.jquery.com gist.github.com cdn.jsdelivr.net static.cloudflareinsights.com launchpad-wrapper.privacymanager.io;
		style-src 'self' 'unsafe-inline' *.disquscdn.com cdn.jsdelivr.net github.githubassets.com;
		font-src 'self' data: cdn.jsdelivr.net;
		img-src 'self' data: *;
		frame-src disqus.com *.soundcloud.com;
		connect-src 'self' cloudflareinsights.com;
		`,
		contact_placeholder: {
			name: 'Humpty Dumpty',
			email: 'example@gmail.com',
			subject: "I had a great fall!",
			message: `Got suggestions, feedback, or comments? Lemme know!`,
		},
	};
};
