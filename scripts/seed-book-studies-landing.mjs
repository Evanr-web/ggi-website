#!/usr/bin/env node
/**
 * Seed the book-studies program document with landing page content.
 * Patches the existing document — does not replace it.
 *
 * Usage: SANITY_TOKEN=xxx node scripts/seed-book-studies-landing.mjs
 */

import { createClient } from '@sanity/client';

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

async function main() {
  console.log('Patching book-studies program with landing page content...');

  await client
    .patch('program-book-studies')
    .set({
      introLabel: 'What Are Inklings Clubs?',
      introHeading: 'Read Great Books. Build Community.',
      introText: [
        {
          _type: 'block',
          _key: 'intro1',
          style: 'normal',
          markDefs: [],
          children: [
            {
              _type: 'span',
              _key: 'intro1s',
              text: 'Named after the famous Oxford circle of C.S. Lewis, J.R.R. Tolkien, and Charles Williams, Inklings Clubs are free small-group reading communities that meet across Canada. Three times a year, the Institute selects a book that deepens Catholic intellectual life — and invites everyone to read together.',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: 'intro2',
          style: 'normal',
          markDefs: [],
          children: [
            {
              _type: 'span',
              _key: 'intro2s',
              text: "Each study comes with discussion guides written by our Fellows, live webinars to connect readers nationwide, and discounted copies of the book. Whether you join a local group or follow along online, you're part of a growing network of Canadians who believe reading well is a form of worship.",
              marks: [],
            },
          ],
        },
      ],
      introDetails: [
        { _type: 'introDetail', _key: 'detail1', title: 'Three studies per year', subtitle: 'February · May · September' },
        { _type: 'introDetail', _key: 'detail2', title: 'Always free', subtitle: 'No cost to join, ever' },
        { _type: 'introDetail', _key: 'detail3', title: 'Local groups + online', subtitle: 'Join in your city or from home' },
        { _type: 'introDetail', _key: 'detail4', title: 'Study guides provided', subtitle: 'Written by GGI Fellows' },
      ],
      readingListLabel: '2026 Reading List',
      readingListHeading: "This Year's Books",
    })
    .commit();

  console.log('✅ Book studies landing page content populated!');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
