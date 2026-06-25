import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'libraryItem',
  title: 'Library Item',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Auto-generated from the title. This becomes the page URL (e.g. /library/my-article/).',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'person' }],
    }),
    defineField({
      name: 'publishDate',
      title: 'Publish Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Essay', value: 'essay' },
          { title: 'News', value: 'news' },
          { title: 'Video / Lecture', value: 'video' },
          { title: 'Resource', value: 'resource' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
      description: 'Topic tags for filtering and browsing (e.g. Aquinas, Education, Beauty).',
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      description: 'Shown on the Library listing page. Keep under 200 characters.',
      validation: (Rule) => Rule.max(250).warning('Try to keep this under 200 characters for the best card layout.'),
      rows: 3,
      description: 'Short excerpt for cards and previews',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
      ],
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL (YouTube)',
      type: 'url',
      description: 'For video/lecture items',
    }),
    defineField({
      name: 'downloadFile',
      title: 'Downloadable File',
      type: 'file',
      description: 'For resource items (PDFs, study guides)',
    }),
    defineField({
      name: 'crossPostSubstack',
      title: 'Substack Cross-Post',
      type: 'object',
      description: 'Manage Substack syndication for this item.',
      fields: [
        { name: 'syndicate', title: 'Syndicate to Substack', type: 'boolean', initialValue: false, description: 'Mark this item for cross-posting to Substack. Use for essays and academic work — not news or internal updates.' },
        { name: 'posted', title: 'Cross-posted', type: 'boolean', initialValue: false, description: 'Check this after the article has been published on Substack.' },
        { name: 'url', title: 'Substack URL', type: 'url', description: 'Link to the Substack version of this article.' },
        { name: 'postedDate', title: 'Date Cross-posted', type: 'date', description: 'When it was posted to Substack.' },
      ],
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show in the featured slot on the Library page',
      initialValue: false,
    }),
    defineField({
      name: 'readTime',
      title: 'Read Time (minutes)',
      type: 'number',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        { name: 'metaTitle', title: 'Meta Title', type: 'string', description: 'Custom page title for search engines. Keep under 60 characters. If blank, the article title is used.' },
        { name: 'metaDescription', title: 'Meta Description', type: 'text', rows: 2, description: 'The snippet shown in Google search results. Keep under 160 characters. If blank, the excerpt is used.' },
        { name: 'ogImage', title: 'OG Image', type: 'image', description: 'Social media preview image (Facebook, Twitter, iMessage). Recommended: 1200×630px. Falls back to hero image if blank.' },
      ],
    }),
  ],
  orderings: [
    { title: 'Publish Date (Newest)', name: 'publishDateDesc', by: [{ field: 'publishDate', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'category', date: 'publishDate', media: 'featuredImage', substack: 'crossPostSubstack.posted' },
    prepare({ title, subtitle, date, substack }) {
      const d = date ? new Date(date + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
      const sub = substack ? ' ✉️' : '';
      return { title: title + sub, subtitle: `${subtitle?.toUpperCase() || ''} — ${d}` };
    },
  },
});
