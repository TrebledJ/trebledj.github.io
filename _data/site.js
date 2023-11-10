const csp = require('./csp');

module.exports = function () {
  const email = 'trebledjjj@gmail.com';

  const banner = {
    enabled: true,
    sticky: true,
    closeButton: true,
    scope: 'session', // Possible values: 'session', 'local', ''.
    // bgColor: 'primary', // Any Bootstrap `bg-` values.
    // fgColor: 'black', // Any Bootstrap `text-` values.
    icon: 'rocket fa-bounce',
    icon_style: '--fa-animation-delay: 5s; --fa-animation-duration: 3s',
    /* eslint-disable max-len */
    content: `
      Welcome to the new *trebledj\\.me* site!
      Check out what's new: <a class="text-white" href="/posts/site-migration-to-cloudflare">***Site Updates and Migration***</a>.
      `.trim().replace(/^[ \t]+/gm, ''),
    /* eslint-enable max-len */
  };

  return {
    title: "TrebledJ's Pages",
    subtitle: 'Dabbling in code, music, math, and memes since conception.',
    url: 'https://trebledj.me',
    baseurl: '',
    language: 'en',
    description: "TrebledJ's personal blog on programming, music, and memes.",

    author: {
      alias: 'TrebledJ',
      name: 'Johnathan',
      email,
      logo: 'profile-icon.jpg',
      /* eslint-disable max-len */
      bio: `
      Hi! (｡＾ ᴗ＾)ﾉ
      I'm passionate in many things, from [software engineering](/tags/software-engineering) to [music](/tags/music).
      I like to solve problems, learn new things, and pass it on through teaching.
      In my spare time, I enjoy taking walks, [composing music](/tags/composition), [playing the occasional CTF](/tags/ctf), and [reflecting on life](/tags/faith).
      `.trim().replace(/^[ \t]+/gm, ''),
      /* eslint-enable max-len */
    },
    navpages: [
      { text: 'Home', url: '/' },
      { text: 'Posts', url: '/posts' },
      { text: 'Projects', url: '/tags/project' },
      { text: 'Music', url: '/music' },
      { text: 'About', url: '/about' },
    ],
    search: {
      // https://fontawesome.com/icons/
      resultIcons: [
        { tag: 'project', icon: 'star' },
        { tag: 'experience', icon: 'rocket' },
        { tag: 'ctf', icon: 'flag' },
        { tag: 'composition', icon: 'music' },
        { tag: 'embedded', icon: 'bolt' },
        { tag: 'programming', icon: 'code' },
      ],
      resultDefaultIcon: 'book',
    },
    lightbox: {
      // To disable lightbox, comment out the corresponding plugin in plugins.js.
      enabled: process.env.ENABLE_LIGHTBOX,
    },
    banner,
    // banner: {
    //   enabled: false,
    //   sticky: true,
    //   closeButton: true,
    //   // scope: 'session', // Possible values: 'session', 'local', ''.
    //   // bgColor: 'primary', // Any Bootstrap `bg-` values.
    //   // fgColor: 'black', // Any Bootstrap `text-` values.
    //   icon: 'rocket',
    //   content: 'Hello world!',
    // },
    typewrite: {
      strings:
        [
          [...'Coding ', '💻'],
          [...'Playing with embedded systems ', '⚡️'],
          [...'Composing (￣▽￣)/♫•*¨*•.¸¸♪'],
          [...'Capturing flags ', '🚩'],
          [...'Writing articles on this site ', '📄'],
          [...'Tinkering with this site ', '🌐'],
          [...'Napping (＿ ＿*) Z z z'],
          [...'Noodling with music ♪♪♪ ヽ(ˇ∀ˇ )ゞ'],
          [...'Making koalaty memes ', '🐨', ...' (－‸ლ)'],
        ],
      pauseDuration: 2500,
      keepPrefix: true,
      loop: true,
      shuffle: true,
    },
    analytics: {
      // Pick your poison.
      // google: "G-7TQ4WV0LMK",
      cloudflare: '52d99b3d385b4c9a98ac8ad109a95a2a',
    },
    id: {
      // Unique identifiers and instances.
      musescore: '20636901',
      disqus: 'trebledj',
      getform: '3b2a26ea-31c4-49ef-a496-d4d765773e59',
      hcaptcha: '85d67539-c1f8-4bed-b164-17c3b4528972',
    },
    color: {
      soundcloud: '2631c8',
    },
    social: [
      {
        name: 'GitHub', icon: 'fab fa-github', color: 'rgb(150, 60, 180)', link: 'https://github.com/TrebledJ',
      },
      {
        name: 'StackOverflow',
        icon: 'fab fa-stack-overflow',
        color: 'rgb(236, 124, 34)',
        link: 'https://stackoverflow.com/users/10239789/trebledj',
      },
      {
        name: 'CodinGame',
        img: '/img/logos/codingame.webp',
        link: 'https://www.codingame.com/profile/8444100ecb9723c1ec542346b0630aaa2821532',
      },
      {
        name: 'SoundCloud',
        icon: 'fab fa-soundcloud',
        color: 'rgb(237, 110, 30)',
        link: 'https://soundcloud.com/trebledj',
      },
      { name: 'MuseScore', img: '/img/logos/musescore.webp', link: 'https://musescore.com/user/20636901' },
      // {
      //   name: "Spotify",
      //   icon: "fab fa-spotify",
      //   link: "https://open.spotify.com/user/24i9exez29k1jr85olljuy94g?si=4213a229649f4ceb"
      // },
      {
        name: 'Discord (TrebledJ#7595)',
        icon: 'fab fa-discord',
        color: 'rgb(84, 100, 235)',
        link: 'https://discordapp.com/users/220427982798454794',
      },
      { name: 'Mail', icon: 'fas fa-envelope', link: `mailto:${email}` },
      { name: 'Feeds', icon: 'fas fa-square-rss', link: '/feeds' },
    ],
    environment: process.env.ENVIRONMENT,
    content_security_policy: csp,
    contact_placeholder: {
      name: 'Humpty Dumpty',
      email: 'example@gmail.com',
      subject: 'I had a great fall!',
      message: 'Got suggestions, feedback, or comments? Lemme know!',
    },
  };
};
