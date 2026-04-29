import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'dhzbvx7r',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
});

const bookStudies = [
  {
    _id: 'book-study-2026-feb',
    _type: 'bookStudy',
    title: 'Searching for and Maintaining Peace',
    author: 'Fr. Jacques Philippe',
    description: 'A beloved guide to interior peace — short, profound, and one of the most widely read spiritual books of the past generation. How to find and keep peace of heart in the midst of life\'s trials.',
    month: 'February',
    year: 2026,
    status: 'completed',
    eventPage: '/events/book-study-feb-2026/',
    order: 1,
  },
  {
    _id: 'book-study-2026-may',
    _type: 'bookStudy',
    title: 'Animal Farm',
    author: 'George Orwell',
    description: 'Orwell\'s classic political fable, read through the lens of Catholic social teaching. What does the barnyard revolution reveal about power, ideology, and the dignity of the human person?',
    month: 'May',
    year: 2026,
    status: 'current',
    eventPage: '/events/book-study-may-2026/',
    order: 2,
  },
  {
    _id: 'book-study-2026-sep',
    _type: 'bookStudy',
    title: 'Leisure: The Basis of Culture',
    author: 'Josef Pieper',
    description: 'Pieper\'s masterwork on why contemplation — not productivity — is the foundation of civilization. Prepares readers for the October Renewing Culture Conference, which takes up Pieper\'s vision in depth.',
    month: 'September',
    year: 2026,
    status: 'upcoming',
    eventPage: '/events/book-study-sep-2026/',
    order: 3,
  },
];

const readingGroups = [
  { province: 'BC', city: 'Vancouver', groups: 2 },
  { province: 'BC', city: 'Kelowna', groups: 1 },
  { province: 'AB', city: 'Edmonton', groups: 3 },
  { province: 'AB', city: 'St. Albert', groups: 1 },
  { province: 'AB', city: 'Sherwood Park', groups: 1 },
  { province: 'AB', city: 'Spruce Grove', groups: 1 },
  { province: 'AB', city: 'Fort McMurray', groups: 1 },
  { province: 'AB', city: 'Red Deer', groups: 1 },
  { province: 'AB', city: 'Lethbridge', groups: 1 },
  { province: 'AB', city: 'Calgary', groups: 3 },
  { province: 'SK', city: 'Saskatoon', groups: 3 },
  { province: 'SK', city: 'Regina', groups: 2 },
  { province: 'MB', city: 'Winnipeg', groups: 2 },
  { province: 'ON', city: 'Toronto', groups: 5 },
  { province: 'ON', city: 'Ottawa', groups: 3 },
  { province: 'QC', city: 'Montreal', groups: 1 },
  { province: 'NS', city: 'Halifax', groups: 2 },
  { province: 'NL', city: "St. John's", groups: 1 },
];

async function seed() {
  console.log('Seeding book studies...');
  for (const study of bookStudies) {
    await client.createOrReplace(study);
    console.log(`  ✓ ${study.title} (${study.month} ${study.year})`);
  }

  console.log('\nSeeding reading groups...');
  for (const group of readingGroups) {
    const id = `reading-group-${group.province.toLowerCase()}-${group.city.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    await client.createOrReplace({
      _id: id,
      _type: 'readingGroup',
      ...group,
      active: true,
    });
    console.log(`  ✓ ${group.city}, ${group.province} (${group.groups} groups)`);
  }

  console.log('\n✅ Done — seeded', bookStudies.length, 'book studies and', readingGroups.length, 'reading groups');
}

seed().catch(console.error);
