import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'supporterEvenings',
  title: 'Supporter Evenings',
  type: 'document',
  icon: () => '🍷',
  fields: [
    defineField({
      name: 'seasonLabel',
      title: 'Season Label',
      type: 'string',
      description: 'e.g. "2026–2027 Season"',
      initialValue: '2026–2027 Season',
    }),
    defineField({
      name: 'heroHeading',
      title: 'Hero Heading',
      type: 'string',
      initialValue: 'Supporter Evenings',
    }),
    defineField({
      name: 'heroDescription',
      title: 'Hero Description',
      type: 'text',
      rows: 3,
      description: 'The paragraph below the heading.',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Background Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Background image for the hero section. Default: Caravaggio's Supper at Emmaus.',
    }),

    // What to Expect
    defineField({
      name: 'expectItems',
      title: 'What to Expect',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'description', title: 'Description', type: 'text', rows: 3 },
          ],
          preview: {
            select: { title: 'title', subtitle: 'description' },
          },
        },
      ],
      validation: (Rule: any) => Rule.max(4).warning('3–4 items recommended.'),
    }),

    // Quote
    defineField({
      name: 'quoteText',
      title: 'Quote',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'quoteAttribution',
      title: 'Quote Attribution',
      type: 'string',
      description: 'e.g. "Pope Benedict XVI"',
    }),

    // Form section
    defineField({
      name: 'formHeading',
      title: 'Form Section Heading',
      type: 'string',
      initialValue: 'Get Involved',
    }),
    defineField({
      name: 'formSubheading',
      title: 'Form Section Subheading',
      type: 'string',
      initialValue: 'Would you like to attend an evening, or host one in your community?',
    }),

    // Confirmation messages
    defineField({
      name: 'attendConfirmation',
      title: 'Attend Confirmation Message',
      type: 'string',
      initialValue: 'Thank you! We'll be in touch with details for an evening near you.',
    }),
    defineField({
      name: 'hostConfirmation',
      title: 'Host Confirmation Message',
      type: 'string',
      initialValue: 'Thank you! Our team will follow up within 48 hours to coordinate your evening.',
    }),

    defineField({
      name: 'enabled',
      title: 'Page Enabled',
      type: 'boolean',
      initialValue: true,
      description: 'Toggle this off to hide the Supporter Evenings banner and page.',
    }),
  ],
  preview: {
    select: { title: 'heroHeading', subtitle: 'seasonLabel' },
  },
});
