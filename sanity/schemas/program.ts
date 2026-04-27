import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'program',
  title: 'Program',
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
      description: 'Auto-generated from the title. This becomes the page URL (e.g. /programs/my-program/).',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'template',
      title: 'Page Template',
      type: 'string',
      description: 'Choose the layout for this program page.',
      options: {
        list: [
          { title: 'Conference (flagship event)', value: 'conference' },
          { title: 'Book Studies (reading clubs)', value: 'book-studies' },
          { title: 'Masterclasses (short courses)', value: 'masterclasses' },
          { title: 'Seminar / Intensive (Faith & Reason)', value: 'seminar' },
          { title: 'Camp (residential youth)', value: 'camp' },
        ],
      },
      initialValue: 'conference',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline / Quote',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      description: 'Used on the Programs overview page cards',
    }),
    defineField({
      name: 'body',
      title: 'Full Description',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
      ],
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Recommended: 1600×900px or larger, landscape. Shown at the top of the program page.',
    }),
    defineField({
      name: 'audience',
      title: 'Audience',
      type: 'string',
      description: 'e.g. "Ages 12–18", "Catholic leaders", "All welcome"',
    }),
    defineField({
      name: 'format',
      title: 'Format',
      type: 'string',
      description: 'e.g. "4-night residential camp", "3-day intensive", "Monthly online"',
    }),
    defineField({
      name: 'frequency',
      title: 'Frequency',
      type: 'string',
      description: 'e.g. "Annual — October", "Year-round", "Summer"',
    }),
    defineField({
      name: 'pricing',
      title: 'Pricing',
      type: 'text',
      rows: 2,
      description: 'e.g. "$350/child" or "$50 early bird / $75 regular". Include family discounts or bursary info if available.',
    }),
    defineField({
      name: 'registrationUrl',
      title: 'Registration URL',
      type: 'url',
    }),
    defineField({
      name: 'contactPerson',
      title: 'Contact Person',
      type: 'reference',
      to: [{ type: 'person' }],
    }),
    defineField({
      name: 'relatedEvents',
      title: 'Related Events',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'event' }] }],
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'quote', title: 'Quote', type: 'text' },
            { name: 'attribution', title: 'Attribution', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'order',
      title: 'Sort Order',
      type: 'number',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        { name: 'metaTitle', title: 'Meta Title', type: 'string', description: 'Custom page title for search engines. Keep under 60 characters. If blank, the program title is used.' },
        { name: 'metaDescription', title: 'Meta Description', type: 'text', rows: 2, description: 'The snippet shown in Google search results. Keep under 160 characters. If blank, the short description is used.' },
        { name: 'ogImage', title: 'OG Image', type: 'image', description: 'The image shown when this page is shared on social media (Facebook, Twitter, iMessage, etc.). Recommended: 1200×630px, landscape. If left blank, the hero image is used.' },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'audience', media: 'heroImage' },
  },
});
