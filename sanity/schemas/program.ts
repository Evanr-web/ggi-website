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
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
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
      description: 'Include sliding-scale if applicable',
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
        { name: 'metaTitle', title: 'Meta Title', type: 'string' },
        { name: 'metaDescription', title: 'Meta Description', type: 'text', rows: 2 },
        { name: 'ogImage', title: 'OG Image', type: 'image' },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'audience', media: 'heroImage' },
  },
});
