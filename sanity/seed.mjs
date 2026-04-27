// Seed Sanity with existing hardcoded content
const PROJECT_ID = 'dhzbvx7r';
const DATASET = 'production';
const TOKEN = process.env.SANITY_TOKEN;
const API = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}`;

async function create(doc) {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ mutations: [{ createOrReplace: doc }] }),
  });
  const data = await res.json();
  if (!res.ok) console.error(`FAIL: ${doc._id}`, data);
  else console.log(`OK: ${doc._id} (${doc._type})`);
}

async function seed() {
  // === Site Settings (singleton) ===
  await create({
    _id: 'siteSettings',
    _type: 'siteSettings',
    ribbonBanner: {
      enabled: true,
      message: "We're hiring! Communications & Development Intern — Canada Summer Jobs 2026.",
      linkText: 'Apply Now →',
      linkUrl: '/careers/',
      style: 'laurel',
    },
    flyinPopup: {
      enabled: true,
      headline: "We're Hiring!",
      message: 'Join the team renewing Catholic culture in Canada. Communications & Development Intern — Summer 2026.',
      ctaText: 'Apply Now',
      ctaUrl: '/careers/',
      delay: 5,
      showOnPages: 'all',
    },
    socialLinks: {
      youtube: 'https://www.youtube.com/@gregorythegreatinstitute',
      instagram: 'https://www.instagram.com/gregorythegreatinstitute/',
    },
    contactEmail: 'info@gregorythegreat.ca',
    footerTagline: 'Fides • Ratio • Cultura',
    footerMission: 'Equipping Christians to renew culture in the light of faith and reason.',
  });

  // === Homepage (singleton) ===
  await create({
    _id: 'homepage',
    _type: 'homepage',
    heroHeadline: 'Inspiring Canadian Catholic Culture',
    heroSubtitle: 'Forming leaders. Teaching the tradition. Publishing research.',
    heroCta: { text: 'Subscribe to the Magnalia Letter', url: '/magnalia/letter/' },
    heroSecondaryCta: { text: 'Explore Our Programs →', url: '/programs/' },
    videoUrl: 'https://www.youtube.com/watch?v=Lhzqr8tMYsI',
    videoCaption: 'Why Catholic Culture Matters',
    magnaliaHeadline: 'Magnalia — A Journal for the Catholic Mind',
    magnaliaDescription: 'Each 60-page issue features original essays from leading Catholic thinkers, letters from the field, and beautiful visual art. Published twice yearly.',
    magnaliaCta: { text: 'Subscribe to Magnalia', url: '/magnalia/subscribe/' },
  });

  // === Events ===
  const events = [
    { id: 'book-study-feb-2026', title: 'Book Study — Searching for and Maintaining Peace', template: 'book-study', status: 'past', start: '2026-02-01', location: 'Locations across Canada', desc: "Fr. Jacques Philippe's beloved guide to interior peace. Join a local reading group or follow along online." },
    { id: 'prayer-breakfast-2026', title: 'GGI at Provincial Prayer Breakfast', template: 'community', status: 'past', start: '2026-03-18', location: 'Edmonton, AB', desc: 'The GGI team attended the annual Premier\'s Prayer Breakfast in Alberta.' },
    { id: 'finances-101', title: 'Personal Finances 101', template: 'masterclass', status: 'past', start: '2026-04-25', location: 'Concordia University of Edmonton', desc: 'Master your money, serve your vocation. Financial literacy as stewardship and Catholic formation. Led by Jesse Underwood.' },
    { id: 'book-study-may-2026', title: 'Book Study — Animal Farm', template: 'book-study', status: 'upcoming', start: '2026-05-01', location: 'Locations across Canada', desc: "George Orwell's classic political fable, read through the lens of Catholic social teaching." },
    { id: 'music-camp-2026', title: "St. Gregory's Music & Leadership Camp", template: 'camp', status: 'upcoming', start: '2026-07-12', end: '2026-07-16', location: 'Solara Water\'s Edge, Parkland County, AB', desc: 'Four nights of fiddle, penny whistle, voice, games, prayer, and leadership for youth ages 12–18. $350/child, family discounts available.', cost: '$350/child' },
    { id: 'book-study-sep-2026', title: 'Book Study — Leisure: The Basis of Culture', template: 'book-study', status: 'upcoming', start: '2026-09-01', location: 'Locations across Canada', desc: "Josef Pieper's masterwork on why contemplation — not productivity — is the foundation of civilization." },
    { id: 'conference-2026', title: 'Bringing Back Sunday — Renewing Culture Conference', template: 'conference', status: 'upcoming', start: '2026-10-02', end: '2026-10-03', location: 'Mt Carmel Spirituality Centre', desc: "2nd Annual Renewing Culture Conference. Two days of speakers, seminars, prayer, and fellowship reflecting on Pieper's Leisure." },
    { id: 'conference-2025', title: '1st Annual Renewing Culture Conference', template: 'conference', status: 'past', start: '2025-10-04', location: 'Newman Theological College', desc: 'Inaugural conference featuring Dr. Ryan Topping and guests. Socratic seminars on Newman, Chesterton, and the renewal of Catholic culture.' },
  ];

  for (const e of events) {
    await create({
      _id: `event-${e.id}`,
      _type: 'event',
      title: e.title,
      slug: { _type: 'slug', current: e.id },
      template: e.template,
      status: e.status,
      startDate: e.start,
      endDate: e.end || undefined,
      location: e.location,
      shortDescription: e.desc,
      cost: e.cost || undefined,
    });
  }

  // === Library Articles ===
  const articles = [
    { id: 'fine-gathering-ottawa', title: 'FINE Gathering in Ottawa and National Prayer Breakfast', author: 'Victor Carpay', category: 'News', date: '2026-04-15', excerpt: 'Dr. Topping and Victor were invited to the FINE Gathering coordinated by CCO and the National Prayer Breakfast by MP Shuv Majumbar (Calgary Heritage).' },
    { id: 'personal-finances', title: 'Master Your Money, Serve Your Vocation: Personal Finances 101', author: 'Jesse Underwood', category: 'News', date: '2026-04-10', excerpt: '64% of Canadians never learned money management. Financial literacy as stewardship and vocation — a preview of our upcoming masterclass.' },
    { id: 'medicine-forgets-vocation', title: 'Medicine Forgets Its Vocation: Alberta Places Guardrails', author: 'Dr. Joseph Woodard', category: 'Essay', date: '2026-03-15', excerpt: 'When hospital chaplains find themselves counselling traumatized healthcare professionals, something has gone badly wrong with the practice of medicine.' },
    { id: 'easter-family', title: '5 Ways to Celebrate Easter as a Family', author: 'Catherine Renneberg', category: 'Resource', date: '2026-01-20', excerpt: 'Practical ideas for families looking to deepen their celebration of the Paschal season at home.' },
    { id: 'abolition-of-man-guide', title: 'The Abolition of Man Study Guide', author: 'Gregory the Great Institute', category: 'Resource', date: '2025-12-15', excerpt: "A downloadable study guide for C.S. Lewis's The Abolition of Man, designed for use in reading groups and classrooms." },
    { id: 'christmas-books-2025', title: 'Christmas Book Recommendations 2025', author: 'Gregory the Great Institute', category: 'Resource', date: '2025-12-10', excerpt: 'Our annual curated list of books worth giving — and reading — this Christmas season.' },
  ];

  for (const a of articles) {
    await create({
      _id: `library-${a.id}`,
      _type: 'libraryItem',
      title: a.title,
      slug: { _type: 'slug', current: a.id },
      author: a.author,
      category: a.category,
      publishDate: a.date,
      excerpt: a.excerpt,
    });
  }

  // === People ===
  const people = [
    { id: 'ryan-topping', name: 'Dr. Ryan N.S. Topping', role: 'Founding Executive Director', group: 'staff', bio: 'Author of over 10 books on Catholic education and culture. DPhil from Oxford. Queen Elizabeth II Platinum Jubilee Medal recipient.', order: 1 },
    { id: 'catherine-renneberg', name: 'Catherine Renneberg', role: 'Director of Programs', group: 'staff', bio: 'M.Div. from Newman Theological College. Board member of St. Therese Institute (Saskatchewan). Experience in church ministry across Western Canada.', order: 2 },
    { id: 'victor-carpay', name: 'Victor Carpay', role: 'Communications & Development', group: 'staff', bio: 'Lifelong Albertan passionate about renewing culture through faith and reason. BA in Catholic Studies from Newman Theological College.', order: 3 },
    { id: 'brian-holdsworth', name: 'Brian Holdsworth', role: 'Director', group: 'board', order: 2 },
    { id: 'celene-sidloski', name: 'Dr. Celene Sidloski', role: 'Director', group: 'board', order: 3 },
    { id: 'caleb-ropp', name: 'Caleb Ropp', role: 'Director', group: 'board', order: 5 },
    { id: 'joe-woodard', name: 'Dr. Joe Woodard', role: 'Fellow · Calgary', group: 'fellow', bio: 'Ethics, bioethics, and Catholic social thought.', order: 1 },
    { id: 'celene-sidloski-fellow', name: 'Dr. Celene Sidloski', role: 'Fellow · Saskatoon', group: 'fellow', bio: 'Classical education and Canadian Catholic intellectual life.', order: 2 },
    { id: 'mark-ingham', name: 'Mark Ingham, PhD Cand.', role: 'Fellow · Barry\'s Bay', group: 'fellow', bio: 'Vocations research and Canadian Catholic demographics.', order: 3 },
    { id: 'fr-michael-bombak', name: 'Fr. Michael Bombak', role: 'Fellow · Toronto', group: 'fellow', bio: 'Theology, priesthood, and cultural renewal.', order: 4 },
    { id: 'jeff-lockert', name: 'Jeff Lockert', role: 'President, CCO Canada', group: 'advisory', order: 1 },
    { id: 'andrew-bennett', name: 'Fr Dcn Andrew Bennett', role: 'Cardus · Formerly Canadian Ambassador for Religious Freedom', group: 'advisory', order: 2 },
    { id: 'keith-cassidy', name: 'Dr. Keith Cassidy', role: 'Past President and Chair of the Board, Seat of Wisdom College', group: 'advisory', order: 3 },
    { id: 'alane-boudreau', name: 'Alane Boudreau', role: 'Founding Board Member, St John Choir Schola, Calgary', group: 'advisory', order: 4 },
    { id: 'thomas-collins', name: 'His Eminence Thomas Cardinal Collins', role: 'Patron', group: 'patron', order: 0 },
  ];

  for (const p of people) {
    await create({
      _id: `person-${p.id}`,
      _type: 'person',
      name: p.name,
      role: p.role,
      group: p.group,
      bio: p.bio || undefined,
      order: p.order,
    });
  }

  // === Magnalia Issue One ===
  await create({
    _id: 'magnalia-issue-1',
    _type: 'magnaliaIssue',
    issueNumber: 1,
    title: 'Winter 2026',
    publishDate: '2026-01-15',
    pageCount: 60,
    current: true,
    whatYoullFind: [
      'Original essays on faith, culture, and education',
      'Letters from Catholic leaders across Canada',
      'Visual art and photography',
      'Book reviews and reading recommendations',
      'Reports from the field — what\'s happening in Canadian Catholic life',
    ],
    tableOfContents: [
      { _key: 'toc1', _type: 'tocEntry', articleTitle: 'Irrigating the New Deserts', author: 'Dr. Ryan Topping', type: 'Essay' },
      { _key: 'toc2', _type: 'tocEntry', articleTitle: "The Editor's Letter", author: 'Dr. Ryan Topping', type: 'Letter' },
      { _key: 'toc3', _type: 'tocEntry', articleTitle: 'The State of Catholic Education in Alberta', author: 'Dr. Celene Sidloski', type: 'Essay' },
      { _key: 'toc4', _type: 'tocEntry', articleTitle: 'Medicine Forgets Its Vocation', author: 'Dr. Joseph Woodard', type: 'Essay' },
      { _key: 'toc5', _type: 'tocEntry', articleTitle: 'Beauty Will Save the World', author: 'Fr. Michael Bombak', type: 'Essay' },
    ],
    contributors: [
      { _key: 'c1', name: 'Dr. Ryan N.S. Topping', credentials: 'DPhil (Oxford)', bio: 'Founding Executive Director of the Gregory the Great Institute. Author of over 10 books.', contribution: 'Essay: Irrigating the New Deserts' },
      { _key: 'c2', name: 'Dr. Celene Sidloski', bio: 'Fellow of the Institute. Specialist in classical education.', contribution: 'Essay: The State of Catholic Education in Alberta' },
      { _key: 'c3', name: 'Dr. Joseph Woodard', bio: 'Fellow of the Institute. Ethics and bioethics.', contribution: 'Essay: Medicine Forgets Its Vocation' },
      { _key: 'c4', name: 'Fr. Michael Bombak', bio: 'Fellow of the Institute. Theology and cultural renewal.', contribution: 'Essay: Beauty Will Save the World' },
    ],
    pullQuote: {
      quote: 'A faith that does not become culture is not fully accepted, not entirely thought out, not faithfully lived.',
      attribution: 'Pope St. John Paul II',
    },
  });

  // === Giving Tiers ===
  const tiers = [
    { id: 'friend', name: 'Friend', monthly: '$15+', annual: '$180+', desc: 'Join the community renewing Catholic culture in Canada.', benefits: ['Monthly Magnalia Letter (free)', 'Member-only updates', 'Early access to events', 'Digital resources and study guides', 'Community of fellow Catholics'], featured: false, cta: 'Become a Friend', href: '/support/friend/', order: 1 },
    { id: 'patron', name: 'Patron', monthly: '$50+', annual: '$600+', desc: 'The backbone of the Institute. Patrons make everything possible.', benefits: ['Everything in Friend, plus:', 'Magnalia print subscription included', 'Named recognition in Magnalia', 'Signed copy of Renewing Catholic Schools', 'Annual Patron gathering with Dr. Topping', 'Conference early-bird + 10% discount'], featured: true, cta: 'Become a Patron', href: '/magnalia/patron/', order: 2 },
    { id: 'leadership', name: 'Leadership Circle', monthly: '—', annual: '$5,000+', desc: 'Strategic partners building the future of Catholic culture in Canada.', benefits: ['Everything in Patron, plus:', 'Annual one-on-one conversation with Dr. Topping', 'Input on Institute direction', 'Named recognition in flagship programs', 'Annual Leadership gathering'], featured: false, cta: 'Request a Conversation', href: '/support/leadership/', order: 3 },
  ];

  for (const t of tiers) {
    await create({
      _id: `tier-${t.id}`,
      _type: 'givingTier',
      name: t.name,
      monthlyPrice: t.monthly,
      annualPrice: t.annual,
      description: t.desc,
      benefits: t.benefits,
      featured: t.featured,
      ctaText: t.cta,
      ctaHref: t.href,
      order: t.order,
    });
  }

  // === Career Posting ===
  await create({
    _id: 'career-intern-2026',
    _type: 'careerPosting',
    title: 'Communications & Development Intern — Canada Summer Jobs 2026',
    slug: { _type: 'slug', current: 'communications-intern-2026' },
    type: 'internship',
    location: 'Edmonton, AB',
    compensation: 'Paid — Canada Summer Jobs rate',
    startDate: '2026-06-01',
    summary: 'A summer internship funded through the Canada Summer Jobs program. Work alongside the Institute\'s communications and development team to support donor relations, event planning, content creation, and community engagement.',
    active: true,
    externalPdfUrl: 'https://adbcbf1f-fcf5-4099-8aa0-1d9b99602ff4.filesusr.com/ugd/437a61_94bcb2ff7ea940748db1658ede8a843a.pdf',
    contactEmail: 'info@gregorythegreat.ca',
  });

  console.log('\n✅ Seed complete!');
}

seed().catch(console.error);
