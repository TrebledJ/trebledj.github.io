import csp from './csp.js';
import vulns from './vulns.js';

const multiline = text => text.trim().replace(/^[ \t]+/gm, '');

function djb2(str) {
  const len = str.length;
  let hash = 5381;
  for (let idx = 0; idx < len; ++idx) {
    hash = ((hash << 5) + hash + str.charCodeAt(idx)) & 0xFFFFFFFF;
  }
  return hash >>> 0;
}

export default function () {
  const email = 'trebledjjj@gmail.com';
  const domain = {
    production: 'trebledj.me',
    preview: 'preview.trebledj.pages.dev',
  }[process.env.DOMAIN_ENVIRONMENT || 'production'];

  const extraNavPages = [];
  if (process.env.ENVIRONMENT !== 'production') {
    extraNavPages.push({ text: 'StyleGuide', url: '/styleguide' });
  }

  return {
    title: "TrebledJ's Pages",
    url: `https://${domain}`,
    baseurl: '',
    language: 'en',
    description: "TrebledJ's personal blog on programming, cybersecurity, music, and memes.",

    author: {
      alias: 'TrebledJ',
      name: 'Johnathan',
      email,
      logo: 'profile-icon.jpg',
      /* eslint-disable max-len */
      shortbio: multiline(`
      Passionate problem-solver,
      pentester,
      and autodidact.
      I thrive on learning new things and enjoy passing it on.
      When not immersed in bughunting or programming, I can be found taking walks, composing a short tune, 
      and occasionally indulging in CTF challenges.
      `),
      bio: multiline(`
      Hi! (｡＾ ᴗ＾)ﾉ
      I'm Johnathan, a passionate problem-solver,
      pentester,
      and autodidact.
      I thrive on learning new things and enjoy passing it on.
      When not immersed in bughunting or programming, I can be found taking walks, composing a short tune, 
      and occasionally indulging in CTF challenges.

      Pineapple on pizza rocks! ╚(•⌂•)╝
      `),
      /* eslint-enable max-len */
    },
    navpages: [
      { text: 'Home', url: '/' },
      { text: 'About', url: '/about' },
      { text: 'Posts', url: '/posts' },
      // { text: 'Projects', url: '/tags/project/' },
      { text: 'CVEs', url: '/vulnerability-research' },
      { text: 'Music', url: '/music' },
      ...extraNavPages,
    ],
    home: {
      topics: {
        infosec: {
          tags: ["research", "infosec", "cve", "embedded"],
          max: 3,
          excludeTags: ["satire", "reflection"],
        },
        programming: {
          tags: ["programming", "embedded"],
          max: 3,
          excludeTags: ["satire", "reflection"],
        },
        music: {
          tags: ["composition"],
          max: 2,
          excludeTags: [],
        },
        // reflection: {
        //   tags: ["reflection", "essay"],
        //   min: 0,
        //   max: 2
        // },
        humor: {
          tags: ["satire"],
          max: 2,
          excludeTags: [],
        },
      },
    },
    cves: vulns,
    search: {
      // https://fontawesome.com/icons/
      resultIcons: [
        { tag: 'project', icon: 'fas fa-star' },
        { tag: 'experience', icon: 'fas fa-rocket' },
        { tag: 'infosec', icon: 'fas fa-user-secret' },
        { tag: 'ctf', icon: 'fas fa-flag' },
        { tag: 'composition', icon: 'fas fa-music' },
        { tag: 'embedded', icon: 'fas fa-bolt' },
        { tag: 'programming', icon: 'fas fa-code' },
        { tag: 'reading', icon: 'fas fa-book' },
      ],
      resultDefaultIcon: 'fas fa-newspaper',
      maxResults: 50,
    },
    lightbox: {
      // To disable lightbox, comment out the corresponding plugin in plugins.js.
      enabled: process.env.ENABLE_LIGHTBOX,
      combined: true, // Combines all lightbox images in a post into a single gallery.
    },
    banner: {
      enabled: false,
      sticky: false,
      closeButton: true,
      disableInPosts: false, // Don't detract from content.
      scope: 'session', // Possible values: 'session', 'local', ''.
      // bgColor: 'primary', // Any Bootstrap `bg-` values.
      // fgColor: 'black', // Any Bootstrap `text-` values.
      icon: 'fas fa-rocket',
      icon_style: '--fa-animation-delay: 5s; --fa-animation-duration: 5s',
      /* eslint-disable max-len */
      content: multiline(`
        Check out my **FREE** [video course on **data structures** and **algorithms**](https://www.youtube.com/watch?v=dQw4w9WgXcQ). Increase your chances of getting hired at **MAMAA** by **100x**!!!
        `),
      /* eslint-enable max-len */
      hash() {
        return djb2(this.content).toString(36);
      },
    },
    typewrite: {
      selector: '#typewrite-text',
      strings:
        [
          'Coding 💻',
          // 'Playing with embedded systems ⚡️',
          // 'Composing (￣▽￣)/♫•*¨*•.¸¸♪',
          // 'Capturing flags 🚩',
          // 'Writing articles on this site 📄',
          // 'Tinkering with this site 🌐',
          // 'Napping (＿ ＿*) Z z z',
          // 'Noodling with music ♪♪♪ ヽ(ˇ∀ˇ )ゞ',
          'Making koalaty memes 🐨 (－‸ლ)',
          'Baking an artificial singularity',
          'Poking holes in sh!7?y software',
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
      formcarry: '17b5CJZ3OWy',
      // hcaptcha: '85d67539-c1f8-4bed-b164-17c3b4528972',
    },
    color: {
      soundcloud: '2631c8',
    },
    social: [
      {
        name: 'GitHub', icon: 'fab fa-github', color: 'rgb(150, 60, 180)', link: 'https://github.com/TrebledJ',
      },
      {
        name: 'Mastodon (infosec.exchange)',
        icon: 'fab fa-mastodon',
        color: 'rgb(99, 101, 255)',
        link: 'https://infosec.exchange/@trebledj',
      },
      {
        name: 'Twitter/X',
        icon: 'fab fa-twitter',
        color: 'rgb(99, 101, 255)',
        link: 'https://x.com/trebledjjj',
      },
      {
        name: 'StackOverflow',
        icon: 'fab fa-stack-overflow',
        color: 'rgb(236, 124, 34)',
        link: 'https://stackoverflow.com/users/10239789/trebledj',
      },
      // {
      //  name: 'CodinGame',
      //  img: '/img/logos/codingame.webp',
      //  link: 'https://www.codingame.com/profile/8444100ecb9723c1ec542346b0630aaa2821532',
      // },
      {
        name: 'SoundCloud',
        icon: 'fab fa-soundcloud',
        color: 'rgb(237, 110, 30)',
        link: 'https://soundcloud.com/trebledj',
      },
      // { name: 'MuseScore', img: '/img/logos/musescore.webp', link: 'https://musescore.com/user/20636901' },
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
