#!/usr/bin/env node
/**
 * Seed the mediaPage singleton in Sanity with current hardcoded content.
 * Usage: SANITY_TOKEN=<editor-token> node scripts/seed-media-page.mjs
 */

import { createClient } from '@sanity/client';

const token = process.env.SANITY_TOKEN;
if (!token) {
  console.error('Missing SANITY_TOKEN env var (needs Editor role)');
  process.exit(1);
}

const client = createClient({
  projectId: 'dhzbvx7r',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
});

const doc = {
  _id: 'mediaPage',
  _type: 'mediaPage',

  // Hero
  heroTitle: 'Media & Press',
  heroSubtitle: 'Articles, interviews, and press resources',

  // Featured Video
  featuredVideoUrl: 'https://www.youtube.com/watch?v=Lhzqr8tMYsI',
  featuredVideoTitle: 'Why Catholic Culture Matters',
  featuredVideoDescription:
    'Dr. Ryan Topping introduces the Gregory the Great Institute and the case for Catholic cultural renewal in Canada.',
  featuredVideoMeta: 'Gregory the Great Institute · 2025',

  // Videos
  videosLabel: 'Video',
  videosHeading: 'Interviews & Talks',
  videosVisibleCount: 3,
  videos: [
    {
      _key: 'v1',
      _type: 'object',
      youtubeUrl: 'https://www.youtube.com/watch?v=x1Z2YIqQWbA',
      title: 'Canada Needs Many More Priests',
      meta: 'w/ Archbishop Smith',
    },
    {
      _key: 'v2',
      _type: 'object',
      youtubeUrl: 'https://www.youtube.com/watch?v=T8NHbjgHpyE',
      title: 'Why Classical Education Now',
      meta: 'Raising Children Who Can Think, Discern & Believe',
    },
    {
      _key: 'v3',
      _type: 'object',
      youtubeUrl: 'https://www.youtube.com/watch?v=sDFohseLTlA',
      title: 'From Protestant to Catholic Through Newman',
      meta: 'Brian Holdsworth',
    },
    {
      _key: 'v4',
      _type: 'object',
      youtubeUrl: 'https://www.youtube.com/watch?v=-ETKa5Bo5qc',
      title: 'Renewal of Catholic Culture',
      meta: 'Heroic Men · Brett Powell',
    },
    {
      _key: 'v5',
      _type: 'object',
      youtubeUrl: 'https://www.youtube.com/watch?v=bEzhwfNvS9I',
      title: 'If You Want Vocations, Rebuild Catholic Culture',
      meta: 'Newman Theological College',
    },
    {
      _key: 'v6',
      _type: 'object',
      youtubeUrl: 'https://www.youtube.com/watch?v=Ue8DsP1bsJ0',
      title: '2024 Vocations Rally',
      meta: 'Calgary Diocese',
    },
  ],

  // Outlets
  outletsLabel: 'Appearances',
  outletsHeading: 'As Seen In',
  outlets: [
    { _key: 'o1', _type: 'object', name: 'First Things', url: 'https://firstthings.com/archive/?_author=ryan-n-s-topping' },
    { _key: 'o2', _type: 'object', name: 'Word on Fire', url: 'https://www.wordonfire.org/articles/the-elements-of-rhetoric-and-evangelization-with-dr-ryan-topping/' },
    { _key: 'o3', _type: 'object', name: 'Crisis Magazine', url: 'https://crisismagazine.com/author/ryan-n-s-topping' },
    { _key: 'o4', _type: 'object', name: 'Catholic World Report', url: 'https://www.catholicworldreport.com/?s=%22Dr.+Ryan+N.S.+Topping%22' },
    { _key: 'o5', _type: 'object', name: 'National Catholic Register', url: 'https://www.ncregister.com/blog/st-john-henry-newman-and-the-new-evangelization' },
    { _key: 'o6', _type: 'object', name: 'The Epoch Times', url: 'https://www.theepochtimes.com/bright/intelligent-people-have-kids-couple-choose-faith-over-contraception-give-birth-to-9-boys-and-1-girl-5541271' },
  ],

  // Books
  booksLabel: 'Books',
  booksHeading: 'Selected Publications by Dr. Topping',
  booksVisibleCount: 5,
  books: [
    { _key: 'b1', _type: 'object', title: 'Thinking as Though God Exists', subtitle: "Newman on Evangelizing the 'Nones'", url: 'https://angelicopress.com/products/thinking-as-though-god-exists', note: 'Most recent' },
    { _key: 'b2', _type: 'object', title: 'The Case for Catholic Education', subtitle: 'Why Parents, Teachers, and Politicians Should Reclaim the Principles of Catholic Pedagogy', url: 'https://angelicopress.com/products/the-case-for-catholic-education' },
    { _key: 'b3', _type: 'object', title: 'Rebuilding Catholic Culture', subtitle: 'How the Catechism Can Shape Our Common Life', url: 'https://www.amazon.ca/Rebuilding-Catholic-Culture-Catechism-Common/dp/1933184949' },
    { _key: 'b4', _type: 'object', title: 'Renewing Catholic Schools', subtitle: 'How to Regain a Catholic Vision for a Secular Age', url: 'https://www.amazon.ca/Renewing-Catholic-Schools-Regain-Secular/dp/1949822044' },
    { _key: 'b5', _type: 'object', title: 'The Elements of Rhetoric', subtitle: 'How to Write and Speak Clearly and Persuasively', url: 'https://angelicopress.com/products/the-elements-of-rhetoric' },
    { _key: 'b6', _type: 'object', title: 'St. Augustine', subtitle: 'Moral and Educational Philosophy', url: 'https://www.amazon.ca/-/fr/Ryan-N-S-Topping-ebook/dp/B07FK7QDYG' },
    { _key: 'b7', _type: 'object', title: 'Christmas Around the Fire', subtitle: "Stories for Christ's Season", url: 'https://www.amazon.ca/Christmas-Around-Fire-Stories-Christs/dp/1505111153' },
    { _key: 'b8', _type: 'object', title: 'Renewing the Reader', subtitle: 'A Philosophy of Catholic Education', url: 'https://www.amazon.ca/Renewing-Reader-Philosophy-Catholic-Education/dp/0813227313' },
    { _key: 'b9', _type: 'object', title: 'Happiness and Wisdom', subtitle: "Augustine's Theology of Education", url: 'https://www.amazon.ca/Happiness-Wisdom-Augustines-Theology-Education/dp/0813219736' },
  ],
  booksTotalCount: 11,
  booksCountNote: 'on Catholic culture, education, and intellectual life.',

  // Press Kit
  pressKitLabel: 'For Journalists & Partners',
  pressKitHeading: 'Press Kit',
  pressKitBoilerplateTitle: 'About the Gregory the Great Institute',
  pressKitBoilerplate: [
    {
      _key: 'bp1',
      _type: 'block',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _key: 'c1',
          _type: 'span',
          text: 'The Gregory the Great Institute is a Canadian non-profit dedicated to Catholic cultural renewal through formation, courses, and publications. Founded by Dr. Ryan N.S. Topping (DPhil, Oxford), the Institute runs formation programs in four provinces, publishes ',
          marks: [],
        },
        {
          _key: 'c2',
          _type: 'span',
          text: 'Magnalia',
          marks: ['em'],
        },
        {
          _key: 'c3',
          _type: 'span',
          text: ' — the journal of Catholic cultural renewal in Canada — and hosts the annual Renewing Culture Conference. His Eminence Thomas Cardinal Collins serves as Patron.',
          marks: [],
        },
      ],
    },
    {
      _key: 'bp2',
      _type: 'block',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _key: 'c4',
          _type: 'span',
          text: 'The Institute is named for St. Gregory the Great (d. 604), pope and Doctor of the Church, who rebuilt civilization from the ruins of the Roman Empire through liturgy, education, and pastoral care.',
          marks: [],
        },
      ],
    },
  ],
  keyFacts: [
    { _key: 'f1', _type: 'object', label: 'Founded', value: '2025' },
    { _key: 'f2', _type: 'object', label: 'Headquarters', value: 'Edmonton, Alberta, Canada' },
    { _key: 'f3', _type: 'object', label: 'Patron', value: 'His Eminence Thomas Cardinal Collins' },
    { _key: 'f4', _type: 'object', label: 'Executive Director', value: 'Dr. Ryan N.S. Topping (DPhil, Oxford)' },
    { _key: 'f5', _type: 'object', label: 'Community', value: '1,500+ members across Canada' },
    { _key: 'f6', _type: 'object', label: 'Programs', value: 'Active in four provinces (AB, SK, ON, NB)' },
    { _key: 'f7', _type: 'object', label: 'Publication', value: 'Magnalia — distributed to every Catholic bishop in Canada' },
    { _key: 'f8', _type: 'object', label: 'Website', value: 'gregorythegreat.ca', url: 'https://gregorythegreat.ca' },
  ],
  downloads: [
    { _key: 'd1', _type: 'object', name: 'GGI Seal', meta: 'PNG · Transparent background', externalUrl: 'https://gregorythegreat.ca/images/branding/ggi-seal.png' },
    { _key: 'd2', _type: 'object', name: 'Dr. Ryan Topping — Headshot', meta: 'JPG · High resolution', externalUrl: 'https://gregorythegreat.ca/images/people/Ryan-Topping-headshot.jpg' },
    { _key: 'd3', _type: 'object', name: 'Dr. Ryan Topping — Portrait', meta: 'JPG · High resolution', externalUrl: 'https://gregorythegreat.ca/images/people/ryan-topping-portrait.jpg' },
    { _key: 'd4', _type: 'object', name: 'Magnalia Cover — Issue One', meta: 'JPG', externalUrl: 'https://gregorythegreat.ca/images/branding/Magnalia_Cover.jpg' },
  ],
  brandColors: [
    { _key: 'c1', _type: 'object', name: 'Navy', hex: '#0E3352', light: false },
    { _key: 'c2', _type: 'object', name: 'Gold', hex: '#B89A47', light: false },
    { _key: 'c3', _type: 'object', name: 'Crimson', hex: '#84292D', light: false },
    { _key: 'c4', _type: 'object', name: 'Parchment', hex: '#F8EBD9', light: true },
  ],

  // Speaking CTA
  speakingLabel: 'Speaking & Media',
  speakingHeading: 'Invite Dr. Topping',
  speakingDescription:
    'Dr. Topping is available for conferences, parish events, lectures, podcasts, and media interviews on Catholic education, cultural renewal, intellectual life, and the state of the Church in Canada.',
  speakingTopics:
    'Renewing Catholic culture · Classical education · Catholic intellectual life in Canada · Newman and the \'Nones\' · The case for Catholic schools · Faith and reason · The role of beauty in evangelization',
  speakingButtonText: 'Request a Speaking Engagement',
  speakingButtonUrl: '/contact/',
  speakingEmail: 'rtopping@gregorythegreat.ca',
};

async function seed() {
  console.log('Creating/replacing mediaPage document...');
  const result = await client.createOrReplace(doc);
  console.log(`✅ mediaPage seeded (rev: ${result._rev})`);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
