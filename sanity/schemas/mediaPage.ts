import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'mediaPage',
  title: 'Media & Press',
  type: 'document',
  groups: [
    { name: 'hero', title: '🏔️ Hero' },
    { name: 'featured', title: '⭐ Featured Video' },
    { name: 'videos', title: '🎬 Video Appearances' },
    { name: 'outlets', title: '📰 As Seen In' },
    { name: 'books', title: '📚 Books' },
    { name: 'pressKit', title: '📋 Press Kit' },
    { name: 'speaking', title: '🎤 Speaking CTA' },
  ],
  fields: [
    // === Hero ===
    defineField({
      name: 'heroImage',
      title: 'Hero Background Image',
      type: 'image',
      options: { hotspot: true },
      group: 'hero',
      description: 'Background image for the page hero. Darkened with navy overlay.',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      group: 'hero',
      initialValue: 'Media & Press',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'string',
      group: 'hero',
      initialValue: 'Articles, interviews, and press resources',
    }),

    // === Featured Video ===
    defineField({
      name: 'featuredVideoUrl',
      title: 'YouTube URL',
      type: 'url',
      group: 'featured',
      description: 'Full YouTube URL (e.g. https://www.youtube.com/watch?v=...). The embed ID is extracted automatically.',
    }),
    defineField({
      name: 'featuredVideoTitle',
      title: 'Title',
      type: 'string',
      group: 'featured',
    }),
    defineField({
      name: 'featuredVideoDescription',
      title: 'Description',
      type: 'text',
      rows: 3,
      group: 'featured',
    }),
    defineField({
      name: 'featuredVideoMeta',
      title: 'Meta Line',
      type: 'string',
      group: 'featured',
      description: 'e.g. "Gregory the Great Institute · 2025"',
    }),

    // === Video Appearances ===
    defineField({
      name: 'videosLabel',
      title: 'Section Label',
      type: 'string',
      group: 'videos',
      initialValue: 'Video',
    }),
    defineField({
      name: 'videosHeading',
      title: 'Section Heading',
      type: 'string',
      group: 'videos',
      initialValue: 'Interviews & Talks',
    }),
    defineField({
      name: 'videosVisibleCount',
      title: 'Videos Visible (before "View More")',
      type: 'number',
      group: 'videos',
      initialValue: 3,
      description: 'How many videos to show before the expandable section.',
      validation: (Rule) => Rule.min(1).max(12),
    }),
    defineField({
      name: 'videos',
      title: 'Video Appearances',
      type: 'array',
      group: 'videos',
      description: 'Order matters — the first N (set above) are visible, rest are in "View More".',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'youtubeUrl', title: 'YouTube URL', type: 'url', validation: (Rule) => Rule.required() }),
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'meta', title: 'Meta', type: 'string', description: 'e.g. "Brian Holdsworth · 2024"' }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'meta' },
          },
        },
      ],
    }),
    defineField({
      name: 'videosNote',
      title: 'Note (below videos)',
      type: 'string',
      group: 'videos',
      description: 'Optional italic note below the video grid. Leave blank to hide.',
    }),

    // === As Seen In ===
    defineField({
      name: 'outletsLabel',
      title: 'Section Label',
      type: 'string',
      group: 'outlets',
      initialValue: 'Appearances',
    }),
    defineField({
      name: 'outletsHeading',
      title: 'Section Heading',
      type: 'string',
      group: 'outlets',
      initialValue: 'As Seen In',
    }),
    defineField({
      name: 'outlets',
      title: 'Media Outlets',
      type: 'array',
      group: 'outlets',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'name', title: 'Outlet Name', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'url', title: 'URL (optional)', type: 'url', description: 'Link to author page or article. Leave blank for unlinked badge.' }),
          ],
          preview: {
            select: { title: 'name', subtitle: 'url' },
          },
        },
      ],
    }),

    // === Books ===
    defineField({
      name: 'booksLabel',
      title: 'Section Label',
      type: 'string',
      group: 'books',
      initialValue: 'Books',
    }),
    defineField({
      name: 'booksHeading',
      title: 'Section Heading',
      type: 'string',
      group: 'books',
      initialValue: 'Selected Publications by Dr. Topping',
    }),
    defineField({
      name: 'booksVisibleCount',
      title: 'Books Visible (before "See All")',
      type: 'number',
      group: 'books',
      initialValue: 5,
      description: 'How many books to show before the expandable section.',
      validation: (Rule) => Rule.min(1).max(20),
    }),
    defineField({
      name: 'books',
      title: 'Books',
      type: 'array',
      group: 'books',
      description: 'Order matters — the first N (set above) are visible, rest are in "See All Books".',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'subtitle', title: 'Subtitle', type: 'string' }),
            defineField({ name: 'url', title: 'Purchase/Info URL', type: 'url' }),
            defineField({ name: 'note', title: 'Note Badge', type: 'string', description: 'e.g. "Most recent" — shown as small gold label' }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'subtitle' },
          },
        },
      ],
    }),
    defineField({
      name: 'booksTotalCount',
      title: 'Total Book Count',
      type: 'number',
      group: 'books',
      initialValue: 11,
      description: 'Shown as "Author of X books on..." below the list.',
    }),
    defineField({
      name: 'booksCountNote',
      title: 'Book Count Note',
      type: 'string',
      group: 'books',
      initialValue: 'on Catholic culture, education, and intellectual life.',
      description: 'Text after the book count number.',
    }),

    // === Press Kit ===
    defineField({
      name: 'pressKitLabel',
      title: 'Section Label',
      type: 'string',
      group: 'pressKit',
      initialValue: 'For Journalists & Partners',
    }),
    defineField({
      name: 'pressKitHeading',
      title: 'Section Heading',
      type: 'string',
      group: 'pressKit',
      initialValue: 'Press Kit',
    }),
    defineField({
      name: 'pressKitBoilerplateTitle',
      title: 'Boilerplate Heading',
      type: 'string',
      group: 'pressKit',
      initialValue: 'About the Gregory the Great Institute',
    }),
    defineField({
      name: 'pressKitBoilerplate',
      title: 'About the Institute (Boilerplate)',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'pressKit',
      description: 'Standard organizational description for press use.',
    }),
    defineField({
      name: 'keyFacts',
      title: 'Key Facts',
      type: 'array',
      group: 'pressKit',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', description: 'e.g. "Founded"' }),
            defineField({ name: 'value', title: 'Value', type: 'string', description: 'e.g. "2025"' }),
            defineField({ name: 'url', title: 'Link URL (optional)', type: 'url' }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'value' },
          },
        },
      ],
    }),
    defineField({
      name: 'downloads',
      title: 'Press Downloads',
      type: 'array',
      group: 'pressKit',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'name', title: 'Name', type: 'string' }),
            defineField({ name: 'meta', title: 'Meta', type: 'string', description: 'e.g. "PNG · Transparent background"' }),
            defineField({ name: 'file', title: 'File', type: 'file', description: 'Upload the file here.' }),
            defineField({ name: 'externalUrl', title: 'Or External URL', type: 'url', description: 'If the file is hosted externally, use this instead.' }),
          ],
          preview: {
            select: { title: 'name', subtitle: 'meta' },
          },
        },
      ],
    }),
    defineField({
      name: 'brandColors',
      title: 'Brand Colors',
      type: 'array',
      group: 'pressKit',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'name', title: 'Color Name', type: 'string' }),
            defineField({ name: 'hex', title: 'Hex Code', type: 'string', description: 'e.g. "#0E3352"' }),
            defineField({ name: 'light', title: 'Light Color?', type: 'boolean', description: 'If checked, text will be dark on this swatch.', initialValue: false }),
          ],
          preview: {
            select: { title: 'name', subtitle: 'hex' },
          },
        },
      ],
    }),

    // === Speaking CTA ===
    defineField({
      name: 'speakerPhoto',
      title: 'Speaker Photo',
      type: 'image',
      options: { hotspot: true },
      group: 'speaking',
    }),
    defineField({
      name: 'speakingLabel',
      title: 'Label',
      type: 'string',
      group: 'speaking',
      initialValue: 'Speaking & Media',
    }),
    defineField({
      name: 'speakingHeading',
      title: 'Heading',
      type: 'string',
      group: 'speaking',
      initialValue: 'Invite Dr. Topping',
    }),
    defineField({
      name: 'speakingDescription',
      title: 'Description',
      type: 'text',
      rows: 3,
      group: 'speaking',
    }),
    defineField({
      name: 'speakingTopics',
      title: 'Topics',
      type: 'string',
      group: 'speaking',
      description: 'Separated by · (middle dot). Shown in italics.',
    }),
    defineField({
      name: 'speakingButtonText',
      title: 'Button Text',
      type: 'string',
      group: 'speaking',
      initialValue: 'Request a Speaking Engagement',
    }),
    defineField({
      name: 'speakingButtonUrl',
      title: 'Button URL',
      type: 'string',
      group: 'speaking',
    }),
    defineField({
      name: 'speakingEmail',
      title: 'Contact Email',
      type: 'string',
      group: 'speaking',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Media & Press' };
    },
  },
});
