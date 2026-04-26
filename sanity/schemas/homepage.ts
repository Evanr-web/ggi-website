import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  groups: [
    { name: 'hero', title: '🏔️ Hero' },
    { name: 'video', title: '🎬 Video' },
    { name: 'magnalia', title: '📖 Magnalia Feature' },
  ],
  fields: [
    // === Hero ===
    defineField({
      name: 'heroImage',
      title: 'Hero Background Image',
      type: 'image',
      options: { hotspot: true },
      group: 'hero',
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
      title: 'Secondary CTA',
      type: 'object',
      group: 'hero',
      fields: [
        { name: 'text', title: 'Link Text', type: 'string', initialValue: 'Explore Our Programs →' },
        { name: 'url', title: 'Link URL', type: 'string' },
      ],
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

    // === Magnalia Feature ===
    defineField({
      name: 'magnaliaHeadline',
      title: 'Section Headline',
      type: 'string',
      group: 'magnalia',
      initialValue: 'Magnalia — A Journal for the Catholic Mind',
    }),
    defineField({
      name: 'magnaliaDescription',
      title: 'Section Description',
      type: 'text',
      rows: 3,
      group: 'magnalia',
    }),
    defineField({
      name: 'magnaliaCta',
      title: 'CTA Button',
      type: 'object',
      group: 'magnalia',
      fields: [
        { name: 'text', title: 'Button Text', type: 'string', initialValue: 'Subscribe to Magnalia' },
        { name: 'url', title: 'Button URL', type: 'string' },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Homepage' };
    },
  },
});
