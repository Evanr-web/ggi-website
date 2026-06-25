import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  groups: [
    { name: 'hero', title: '🏔️ Hero' },
    { name: 'quote', title: '✝️ Quote' },
    { name: 'pillars', title: '🏛️ What We Do' },
    { name: 'video', title: '🎬 Video' },
    { name: 'library', title: '📚 Library' },
  ],
  fields: [
    // === Hero ===
    defineField({
      name: 'heroImage',
      title: 'Hero Background Image',
      type: 'image',
      options: { hotspot: true },
      group: 'hero',
      description: 'Minimum: 1920×1080px (16:9 landscape). Ideal: 2400×1350px. Keep the subject centered — edges are cropped on mobile. The image is darkened with a navy overlay, so high-contrast images work best.',
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero Headline',
      type: 'string',
      group: 'hero',
      description: 'The big text. e.g. "Renewing Catholic Culture in Canada"',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
      rows: 2,
      group: 'hero',
      description: 'The smaller text below the headline.',
    }),
    defineField({
      name: 'heroCta',
      title: 'Primary CTA',
      type: 'object',
      group: 'hero',
      fields: [
        { name: 'text', title: 'Button Text', type: 'string', initialValue: 'Subscribe to the Magnalia Letter' },
        { name: 'url', title: 'Button URL', type: 'string' },
      ],
    }),
    defineField({
      name: 'heroSecondaryCta',
      title: 'Secondary CTA (optional)',
      type: 'object',
      group: 'hero',
      description: 'A smaller text link below the main button. Leave both fields blank to show only the primary CTA.',
      fields: [
        { name: 'text', title: 'Link Text', type: 'string', initialValue: 'Explore Our Programs →' },
        { name: 'url', title: 'Link URL', type: 'string' },
      ],
    }),

    // === Quote ===
    defineField({
      name: 'quoteText',
      title: 'Quote Text',
      type: 'text',
      rows: 3,
      group: 'quote',
      description: 'The featured quote shown below the hero.',
    }),
    defineField({
      name: 'quoteAttribution',
      title: 'Quote Attribution',
      type: 'string',
      group: 'quote',
      description: 'Who said it. e.g. "Pope St. John Paul II"',
    }),

    // === What We Do Pillars ===
    defineField({
      name: 'pillarsLabel',
      title: 'Section Label',
      type: 'string',
      group: 'pillars',
      description: 'Small gold text above the heading. Default: "What We Do"',
    }),
    defineField({
      name: 'pillarsHeading',
      title: 'Section Heading',
      type: 'string',
      group: 'pillars',
      description: 'Default: "Formation, Courses, Publications"',
    }),
    defineField({
      name: 'pillarsDescription',
      title: 'Section Description',
      type: 'text',
      rows: 3,
      group: 'pillars',
      description: 'The paragraph below the heading.',
    }),
    defineField({
      name: 'pillars',
      title: 'Pillar Cards',
      type: 'array',
      group: 'pillars',
      description: 'The three main offering cards. Recommended: exactly 3.',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'description', title: 'Description', type: 'text', rows: 3 },
            { name: 'image', title: 'Image', type: 'image', options: { hotspot: true } },
            { name: 'imageAlt', title: 'Image Alt Text', type: 'string' },
            { name: 'linkUrl', title: 'Link URL', type: 'string' },
            { name: 'linkText', title: 'Link Text', type: 'string', description: 'e.g. "View Programs →"' },
          ],
          preview: {
            select: { title: 'title', media: 'image' },
          },
        },
      ],
      validation: (Rule) => Rule.max(4),
    }),

    // === Video ===
    defineField({
      name: 'videoUrl',
      title: 'YouTube Video URL',
      type: 'url',
      group: 'video',
      description: 'Full YouTube URL. The embed ID is extracted automatically.',
    }),
    defineField({
      name: 'videoCaption',
      title: 'Video Caption',
      type: 'string',
      group: 'video',
      description: 'Text shown below the video.',
    }),

    // === Library ===
    defineField({
      name: 'featuredLibraryItems',
      title: 'Featured Library Items',
      type: 'array',
      group: 'library',
      description: 'Manually pick items to feature on the homepage. If empty, the 3 most recent items are shown automatically.',
      of: [
        {
          type: 'reference',
          to: [{ type: 'libraryItem' }],
        },
      ],
      validation: (Rule) => Rule.max(3),
    }),

    // Magnalia feature section is hand-designed — content comes from the Magnalia Issue document
  ],
  preview: {
    prepare() {
      return { title: 'Homepage' };
    },
  },
});
