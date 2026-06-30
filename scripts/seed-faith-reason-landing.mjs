#!/usr/bin/env node
/**
 * Seed the faith-and-reason program document with landing page content.
 *
 * Usage: SANITY_TOKEN=xxx node scripts/seed-faith-reason-landing.mjs
 */

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'dhzbvx7r',
  dataset: 'production',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
});

async function main() {
  // First find the document ID
  const doc = await client.fetch('*[_type == "program" && slug.current == "faith-and-reason"][0]{ _id }');
  if (!doc) {
    console.error('No faith-and-reason program document found!');
    process.exit(1);
  }

  console.log(`Patching ${doc._id} with landing page content...`);

  await client
    .patch(doc._id)
    .set({
      // Intro section
      introLabel: 'Intensive Formation',
      introHeading: 'Go Deeper',
      introText: [
        {
          _type: 'block', _key: 'fr1', style: 'normal', markDefs: [], children: [{
            _type: 'span', _key: 'fr1s', marks: [],
            text: 'For three days, a small group of Catholic leaders steps away from the noise and into the company of the greatest minds in the tradition. Using the Socratic method, participants read and discuss primary texts — Augustine, Aquinas, Newman, Chesterton, Pieper. No lectures. No PowerPoints. Just the text, the table, and the conversation.',
          }],
        },
        {
          _type: 'block', _key: 'fr2', style: 'normal', markDefs: [], children: [{
            _type: 'span', _key: 'fr2s', marks: [],
            text: 'Structured around the rhythm of prayer, study, and fellowship, participants leave not with a certificate but with a renewed mind and a deeper love for the tradition.',
          }],
        },
      ],

      // At a Glance
      introDetails: [
        { _type: 'introDetail', _key: 'fmt', title: 'Format', subtitle: '3-day residential intensive' },
        { _type: 'introDetail', _key: 'mth', title: 'Method', subtitle: 'Socratic seminar (discussion-based)' },
        { _type: 'introDetail', _key: 'sz', title: 'Size', subtitle: '15–20 participants' },
        { _type: 'introDetail', _key: 'frq', title: 'Frequency', subtitle: 'Once per year' },
        { _type: 'introDetail', _key: 'loc', title: 'Location', subtitle: 'Alberta (venue TBA)' },
        { _type: 'introDetail', _key: 'cst', title: 'Cost', subtitle: 'Includes lodging and meals' },
      ],

      // Reading List
      readingListLabel: 'The Reading List',
      readingListHeading: "What You'll Read",
      readings: [
        { _type: 'readingItem', _key: 'r1', author: 'St. Augustine', work: 'Confessions' },
        { _type: 'readingItem', _key: 'r2', author: 'St. Thomas Aquinas', work: 'Summa Theologiae' },
        { _type: 'readingItem', _key: 'r3', author: 'John Henry Newman', work: 'The Idea of a University' },
        { _type: 'readingItem', _key: 'r4', author: 'G.K. Chesterton', work: 'Orthodoxy' },
        { _type: 'readingItem', _key: 'r5', author: 'Josef Pieper', work: 'Leisure: The Basis of Culture' },
        { _type: 'readingItem', _key: 'r6', author: 'Pope Benedict XVI', work: 'Regensburg Address' },
      ],
      readingListNote: 'Reading packets provided in advance.',

      // Schedule
      scheduleLabel: 'A Typical Day',
      scheduleHeading: 'The Experience',
      schedule: [
        { _type: 'scheduleItem', _key: 's1', label: '7:30', content: 'Morning Prayer' },
        { _type: 'scheduleItem', _key: 's2', label: '8:00', content: 'Breakfast' },
        { _type: 'scheduleItem', _key: 's3', label: '9:00', content: 'Morning Seminar' },
        { _type: 'scheduleItem', _key: 's4', label: '12:00', content: 'Holy Mass' },
        { _type: 'scheduleItem', _key: 's5', label: '1:00', content: 'Lunch & Rest' },
        { _type: 'scheduleItem', _key: 's6', label: '3:00', content: 'Afternoon Seminar' },
        { _type: 'scheduleItem', _key: 's7', label: '5:30', content: 'Vespers' },
        { _type: 'scheduleItem', _key: 's8', label: '6:30', content: 'Dinner & Fellowship' },
      ],

      // Who It's For
      audienceLabel: "Who It's For",
      audienceHeading: 'Is This for You?',
      audienceCards: [
        { _type: 'audienceCard', _key: 'a1', title: 'Parish Leaders', description: 'Pastors, DREs, and lay leaders who want to deepen their intellectual formation and bring it back to their communities.' },
        { _type: 'audienceCard', _key: 'a2', title: 'Catholic Professionals', description: 'Doctors, lawyers, teachers, and business owners who want to integrate faith and reason in their vocation.' },
        { _type: 'audienceCard', _key: 'a3', title: 'Seminarians & Religious', description: 'Those in formation who want an immersive encounter with the Great Books tradition beyond the classroom.' },
        { _type: 'audienceCard', _key: 'a4', title: 'Serious Seekers', description: 'Anyone drawn to the Catholic intellectual tradition — converts, reverts, and lifelong Catholics hungry for more.' },
      ],

      // Form section
      formLabel: 'Limited to 15–20 Participants',
      formHeading: 'Join the Interest List',
      formSubtitle: "Tell us about yourself and we'll notify you when registration opens for the next seminar.",
    })
    .commit();

  console.log('✅ Faith & Reason landing page content populated!');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
