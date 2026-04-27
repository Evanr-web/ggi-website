import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'person',
  title: 'Person',
  type: 'document',
  groups: [
    { name: 'basics', title: '👤 Basics', default: true },
    { name: 'details', title: '📝 Details' },
    { name: 'publications', title: '📚 Publications' },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      group: 'basics',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      group: 'basics',
      description: 'Headshot, square crop works best. Recommended: 400×400px or larger. Appears on the Leadership page next to this person\'s name.',
      validation: (Rule) => Rule.custom((value, context) => {
        const doc = context.document as any;
        if (doc?.published && !value) return 'Photo is required before showing on the website';
        return true;
      }),
    }),
    defineField({
      name: 'role',
      title: 'Role / Title',
      type: 'string',
      group: 'basics',
      description: 'Shown directly under the name on the Leadership page. e.g. "Executive Director" or "Fellow · Calgary".',
    }),
    defineField({
      name: 'personType',
      title: 'Person Type',
      type: 'string',
      group: 'basics',
      description: 'Controls which section this person appears in on the Leadership page.',
      options: {
        list: [
          { title: 'Staff', value: 'staff' },
          { title: 'Board', value: 'board' },
          { title: 'Fellow', value: 'fellow' },
          { title: 'Advisory Board', value: 'advisory' },
          { title: 'Patron', value: 'patron' },
          { title: 'Contributor', value: 'contributor' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      group: 'basics',
      description: 'Shown on the Leadership page for Staff only (e.g. rtopping@gregorythegreat.ca). Leave blank to hide.',
    }),
    defineField({
      name: 'published',
      title: 'Show on Website',
      type: 'boolean',
      group: 'basics',
      initialValue: false,
      description: 'Toggle ON when this person is ready to appear on the Leadership page. Leave OFF to save as a draft.',
    }),
    defineField({
      name: 'order',
      title: 'Sort Order',
      type: 'number',
      group: 'basics',
      description: 'Controls display order within the section. 1 = first, 2 = second, etc.',
    }),

    // === Details ===
    defineField({
      name: 'shortBio',
      title: 'Short Bio',
      type: 'text',
      rows: 2,
      group: 'details',
      description: 'Appears on the Leadership page under this person\'s card. Keep to 1-2 sentences.',
      validation: (Rule) => Rule.custom((value, context) => {
        const doc = context.document as any;
        if (doc?.published && doc?.personType !== 'board' && doc?.personType !== 'patron' && !value) {
          return 'Short bio is required for Staff, Fellows, and Advisory members before showing on the website';
        }
        return true;
      }),
    }),
    defineField({
      name: 'bio',
      title: 'Full Biography',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'details',
      description: 'Extended bio. Currently used for the Founding Director page only. For most people, the Short Bio is sufficient.',
    }),
    defineField({
      name: 'credentials',
      title: 'Credentials',
      type: 'string',
      group: 'details',
      description: 'Academic credentials shown after the name where space allows. e.g. "DPhil (Oxford), MA (Manitoba)".',
    }),

    // === Publications ===
    defineField({
      name: 'publications',
      title: 'Publications / Books',
      type: 'array',
      group: 'publications',
      description: 'Currently shown on the Founding Director page only. For other people, this is stored for future use.',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'year', title: 'Year', type: 'string' },
            { name: 'publisher', title: 'Publisher', type: 'string' },
            { name: 'url', title: 'URL', type: 'url' },
            { name: 'coverImage', title: 'Cover Image', type: 'image', description: 'Book cover. Recommended: 300×450px.' },
          ],
        },
      ],
    }),
  ],
  orderings: [
    { title: 'Sort Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
    { title: 'Name', name: 'nameAsc', by: [{ field: 'name', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'photo', published: 'published' },
    prepare({ title, subtitle, media, published }) {
      return {
        title: `${published ? '' : '🚫 '}${title}`,
        subtitle: subtitle || '',
        media,
      };
    },
  },
});
