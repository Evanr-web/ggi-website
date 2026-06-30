#!/usr/bin/env node
/**
 * Seed the programsOverview singleton in Sanity with current static data.
 * Uploads images from public/ and creates the document.
 *
 * Usage: SANITY_TOKEN=xxx node scripts/seed-programs-overview.mjs
 */

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { resolve, basename } from 'path';

const PROJECT_ID = 'dhzbvx7r';
const DATASET = 'production';
const TOKEN = process.env.SANITY_TOKEN;

if (!TOKEN) {
  console.error('Error: SANITY_TOKEN env var required');
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  token: TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
});

const PUBLIC = resolve(import.meta.dirname, '..', 'public');

async function uploadImage(relPath) {
  const absPath = resolve(PUBLIC, relPath);
  const buffer = readFileSync(absPath);
  const filename = basename(absPath);
  const contentType = filename.endsWith('.jpeg') || filename.endsWith('.jpg')
    ? 'image/jpeg'
    : 'image/png';

  console.log(`  Uploading ${relPath}...`);
  const asset = await client.assets.upload('image', buffer, {
    filename,
    contentType,
  });
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
  };
}

async function main() {
  console.log('Uploading images to Sanity...');

  const heroImg = await uploadImage('images/art/Bodleian-Library-Oxford.jpg');
  const conferenceImg = await uploadImage('images/art/school-of-athens.jpg');
  const musicCampImg = await uploadImage('images/events/music-camp-hero-outdoor.jpeg');
  const bookStudiesImg = await uploadImage('images/events/2026-book-studies-reading-list.jpg');
  const faithReasonImg = await uploadImage('images/art/vanitas-still-life-painting.jpg');
  const masterclassesImg = await uploadImage('images/art/St-Gregory-Great-painting-dove.jpg');

  console.log('Creating programsOverview document...');

  const doc = {
    _id: 'programsOverview',
    _type: 'programsOverview',
    heroImage: heroImg,
    heroHeadline: 'Formation, Courses & Community',
    heroQuote: '"Be who God meant you to be and you will set the world on fire."',
    heroAttribution: '— St. Catherine of Siena',
    footerMessage: 'Every program is made possible by the faithful support of our Friends and Patrons.',
    footerLinkText: 'Join them →',
    footerLinkUrl: '/support/',
    cards: [
      {
        _type: 'programCard',
        _key: 'conference',
        title: 'Renewing Culture Conference',
        label: 'Annual Flagship Gathering',
        thumbnail: conferenceImg,
        thumbnailAlt: 'The School of Athens by Raphael — Renewing Culture Conference',
        artFilter: true,
        description: 'Join Christians from across Western Canada as renowned speakers explore cutting-edge topics through the lens of a great tradition text. The 2026 conference — Bringing Back Sunday — takes up Josef Pieper\'s Leisure: The Basis of Culture.',
        details: [
          { _type: 'detailPair', _key: 'aud', key: 'Audience', value: 'All welcome' },
          { _type: 'detailPair', _key: 'fmt', key: 'Format', value: '2-day conference' },
          { _type: 'detailPair', _key: 'freq', key: 'Frequency', value: 'Annual — October' },
          { _type: 'detailPair', _key: 'next', key: 'Next', value: 'October 2–3, 2026 · Mt Carmel Spirituality Centre' },
        ],
        ctaText: 'Learn More',
        ctaLink: '/events/conference-2026/',
        enabled: true,
      },
      {
        _type: 'programCard',
        _key: 'music-camp',
        title: "St. Gregory's Music & Leadership Camp",
        label: 'Youth Formation',
        thumbnail: musicCampImg,
        thumbnailAlt: "St. Gregory's Music Camp",
        artFilter: false,
        description: 'A four-night residential camp for youth ages 12–18. Instruction in fiddle, penny whistle, and voice, exploring sacred and folk music traditions. Daily prayer, leadership sessions, games, and community. Inspired by the von Trapp family singers\' camp.',
        details: [
          { _type: 'detailPair', _key: 'aud', key: 'Audience', value: 'Ages 12–18 (Leader-in-Training stream for 16–18)' },
          { _type: 'detailPair', _key: 'fmt', key: 'Format', value: '4-night residential camp' },
          { _type: 'detailPair', _key: 'freq', key: 'Frequency', value: 'Annual — July' },
          { _type: 'detailPair', _key: 'cost', key: 'Cost', value: '$350/child (family discounts available)' },
        ],
        ctaText: 'Register',
        ctaLink: '/events/music-camp-2026/',
        enabled: true,
      },
      {
        _type: 'programCard',
        _key: 'book-studies',
        title: 'Book Studies — Inklings Clubs',
        label: 'Free · Year-Round · Nationwide',
        thumbnail: bookStudiesImg,
        thumbnailAlt: '2026 Book Studies',
        artFilter: true,
        description: 'Free small-group reading clubs across Canada. Study guides, webinars, and discounts for participants. Dive into the treasures of culture while building community in your city. 2026 reads: Fr. Jacques Philippe, George Orwell, and Josef Pieper.',
        details: [
          { _type: 'detailPair', _key: 'aud', key: 'Audience', value: 'All welcome' },
          { _type: 'detailPair', _key: 'fmt', key: 'Format', value: 'Small group reading clubs' },
          { _type: 'detailPair', _key: 'freq', key: 'Frequency', value: 'Three studies per year (Feb, May, Sep)' },
          { _type: 'detailPair', _key: 'cost', key: 'Cost', value: 'Free' },
        ],
        ctaText: 'Join a Book Study',
        ctaLink: '/programs/book-studies/',
        enabled: true,
      },
      {
        _type: 'programCard',
        _key: 'faith-reason',
        title: 'Faith & Reason Seminar',
        label: 'Intensive Formation',
        thumbnail: faithReasonImg,
        thumbnailAlt: 'Faith and Reason Seminar',
        artFilter: true,
        description: 'An intensive 3-day Great Books immersion for Catholic leaders. Socratic seminars, cultural formation, prayer, and renewal. Unique in Western Canada — designed for those ready to go deeper into the intellectual and spiritual tradition.',
        details: [
          { _type: 'detailPair', _key: 'aud', key: 'Audience', value: 'Catholic leaders and serious seekers' },
          { _type: 'detailPair', _key: 'fmt', key: 'Format', value: '3-day residential intensive' },
          { _type: 'detailPair', _key: 'freq', key: 'Frequency', value: 'Annual' },
        ],
        ctaText: 'Learn More',
        ctaLink: '/programs/faith-and-reason/',
        enabled: true,
      },
      {
        _type: 'programCard',
        _key: 'masterclasses',
        title: 'Masterclasses',
        label: 'Short Courses',
        thumbnail: masterclassesImg,
        thumbnailAlt: 'Masterclasses',
        artFilter: true,
        description: 'Short courses on the great themes of Catholic intellectual life: Philosophy of Aquinas, Virtuous Leadership, Christian Beauty and Art, Classical Education for Teachers. Available online and in-person.',
        details: [
          { _type: 'detailPair', _key: 'aud', key: 'Audience', value: 'All welcome' },
          { _type: 'detailPair', _key: 'fmt', key: 'Format', value: 'Short course (1 day or multi-session)' },
          { _type: 'detailPair', _key: 'freq', key: 'Frequency', value: 'Ongoing' },
        ],
        ctaText: 'Browse Courses',
        ctaLink: '/programs/masterclasses/',
        enabled: false,  // Currently hidden — matches existing state
      },
    ],
  };

  await client.createOrReplace(doc);
  console.log('✅ programsOverview document created/updated successfully!');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
