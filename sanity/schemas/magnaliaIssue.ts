import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'magnaliaIssue',
  title: 'Magnalia Issue',
  type: 'document',
  groups: [
    { name: 'basics', title: '📋 Basics' },
    { name: 'content', title: '📖 Content' },
    { name: 'contributors', title: '✍️ Contributors' },
    { name: 'promotion', title: '📣 Promotion' },
  ],
  fields: [
    defineField({
      name: 'issueNumber',
      title: 'Issue Number',
      type: 'number',
      group: 'basics',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Issue Title / Theme',
      type: 'string',
      group: 'basics',
      description: 'e.g. "Fall 2025" or "Renewing the Imagination"',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      group: 'basics',
      description: 'This image appears everywhere Magnalia is featured — homepage, subscribe page, patron page, etc.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishDate',
      title: 'Publish Date',
      type: 'date',
      group: 'basics',
    }),
    defineField({
      name: 'pageCount',
      title: 'Page Count',
      type: 'number',
      group: 'basics',
    }),
    defineField({
      name: 'current',
      title: '⭐ Current Issue',
      type: 'boolean',
      group: 'basics',
      description: 'Toggle ON for the latest issue. This controls what appears site-wide. Only one issue should be current at a time.',
      initialValue: false,
    }),

    // === Content ===
    defineField({
      name: 'whatYoullFind',
      title: "What You'll Find",
      type: 'array',
      group: 'content',
      description: 'Short blurbs for the subscribe page. e.g. "Original essays on faith, culture, and education"',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'tableOfContents',
      title: 'Table of Contents',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'object',
          name: 'tocEntry',
          title: 'Entry',
          fields: [
            { name: 'articleTitle', title: 'Article Title', type: 'string' },
            { name: 'author', title: 'Author', type: 'string' },
            {
              name: 'type',
              title: 'Type',
              type: 'string',
              options: {
                list: ['Essay', 'Letter', 'Review', 'Art', 'Interview', 'Poem', 'Editorial', 'Feature'],
              },
            },
            { name: 'pageNumber', title: 'Page Number', type: 'number' },
          ],
          preview: {
            select: { title: 'articleTitle', subtitle: 'author', type: 'type' },
            prepare({ title, subtitle, type }) {
              return { title, subtitle: `${type || ''} — ${subtitle || ''}` };
            },
          },
        },
      ],
    }),
    defineField({
      name: 'editorsNote',
      title: "Editor's Note / Excerpt",
      type: 'array',
      group: 'content',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'sampleArticle',
      title: 'Sample Article',
      type: 'object',
      group: 'content',
      description: 'A full essay or excerpt to showcase the issue. Appears on the issue page.',
      fields: [
        { name: 'title', title: 'Article Title', type: 'string' },
        { name: 'author', title: 'Author', type: 'string' },
        {
          name: 'body',
          title: 'Article Body',
          type: 'array',
          of: [
            { type: 'block' },
            { type: 'image', options: { hotspot: true } },
          ],
        },
        { name: 'pdfFile', title: 'PDF Version (optional)', type: 'file' },
      ],
    }),

    // === Contributors (separate from People collection) ===
    defineField({
      name: 'contributors',
      title: 'Contributors',
      type: 'array',
      group: 'contributors',
      description: 'List of contributors for this issue. Managed separately from the Leadership page.',
      of: [
        {
          type: 'object',
          name: 'contributor',
          title: 'Contributor',
          fields: [
            { name: 'name', title: 'Name', type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'photo', title: 'Photo', type: 'image', options: { hotspot: true } },
            { name: 'bio', title: 'Short Bio', type: 'text', rows: 3 },
            { name: 'credentials', title: 'Credentials', type: 'string', description: 'e.g. "DPhil (Oxford)"' },
            { name: 'contribution', title: 'Contribution to This Issue', type: 'string', description: 'e.g. "Essay: Irrigating the New Deserts"' },
          ],
          preview: {
            select: { title: 'name', subtitle: 'contribution', media: 'photo' },
          },
        },
      ],
    }),

    // === Promotion ===
    defineField({
      name: 'pullQuote',
      title: 'Featured Pull Quote',
      type: 'object',
      group: 'promotion',
      description: 'A compelling quote to use in promotions and on the homepage.',
      fields: [
        { name: 'quote', title: 'Quote', type: 'text' },
        { name: 'attribution', title: 'Attribution', type: 'string' },
      ],
    }),
    defineField({
      name: 'endorsements',
      title: 'Issue Endorsements',
      type: 'array',
      group: 'promotion',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'quote', title: 'Quote', type: 'text' },
            { name: 'name', title: 'Name', type: 'string' },
            { name: 'title', title: 'Title / Role', type: 'string' },
          ],
        },
      ],
    }),
  ],
  orderings: [
    { title: 'Issue Number', name: 'issueDesc', by: [{ field: 'issueNumber', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', issue: 'issueNumber', media: 'coverImage', current: 'current' },
    prepare({ title, issue, media, current }) {
      return {
        title: `${current ? '⭐ ' : ''}Issue ${issue || '?'}${title ? ': ' + title : ''}`,
        media,
      };
    },
  },
});
