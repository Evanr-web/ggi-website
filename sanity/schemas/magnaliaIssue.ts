import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'magnaliaIssue',
  title: 'Magnalia Issue',
  type: 'document',
  fields: [
    defineField({
      name: 'issueNumber',
      title: 'Issue Number',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Issue Title / Theme',
      type: 'string',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishDate',
      title: 'Publish Date',
      type: 'date',
    }),
    defineField({
      name: 'pageCount',
      title: 'Page Count',
      type: 'number',
    }),
    defineField({
      name: 'editorsNote',
      title: "Editor's Note / Excerpt",
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'tableOfContents',
      title: 'Table of Contents',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'articleTitle', title: 'Article Title', type: 'string' },
            { name: 'author', title: 'Author', type: 'string' },
            { name: 'type', title: 'Type', type: 'string', options: { list: ['Essay', 'Letter', 'Review', 'Art', 'Interview', 'Poem'] } },
          ],
          preview: {
            select: { title: 'articleTitle', subtitle: 'author' },
          },
        },
      ],
    }),
    defineField({
      name: 'sampleContent',
      title: 'Sample Content (full essay or excerpt)',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
      ],
    }),
    defineField({
      name: 'contributors',
      title: 'Contributors',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'person' }] }],
    }),
    defineField({
      name: 'pullQuote',
      title: 'Featured Pull Quote',
      type: 'object',
      fields: [
        { name: 'quote', title: 'Quote', type: 'text' },
        { name: 'attribution', title: 'Attribution', type: 'string' },
      ],
    }),
    defineField({
      name: 'current',
      title: 'Current Issue',
      type: 'boolean',
      description: 'Mark as the current issue to feature on the Magnalia page',
      initialValue: false,
    }),
  ],
  orderings: [
    { title: 'Issue Number', name: 'issueDesc', by: [{ field: 'issueNumber', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', issue: 'issueNumber', media: 'coverImage' },
    prepare({ title, issue }) {
      return { title: `Issue ${issue || '?'}${title ? ': ' + title : ''}` };
    },
  },
});
