import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'event',
  title: 'Event',
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
      name: 'date',
      title: 'Start Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'locationAddress',
      title: 'Full Address',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'program',
      title: 'Related Program',
      type: 'reference',
      to: [{ type: 'program' }],
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
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
      name: 'cost',
      title: 'Cost',
      type: 'string',
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
      name: 'documents',
      title: 'Attached Documents',
      type: 'array',
      of: [
        {
          type: 'file',
          fields: [
            { name: 'title', title: 'Document Title', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'template',
      title: 'Page Template',
      type: 'string',
      description: 'Choose the page layout for this event. Contact your developer if you need a new template.',
      options: {
        list: [
          { title: 'Conference (multi-day, speakers, schedule)', value: 'conference' },
          { title: 'Music & Leadership Camp (residential, activities)', value: 'camp' },
          { title: 'Book Study (reading list, small group)', value: 'book-study' },
          { title: 'Masterclass (short course, instructor)', value: 'masterclass' },
          { title: 'Workshop / Seminar (single session)', value: 'workshop' },
          { title: 'Community Event (social, fundraiser)', value: 'community' },
          { title: 'Simple (just details + registration)', value: 'simple' },
        ],
      },
      initialValue: 'simple',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Upcoming', value: 'upcoming' },
          { title: 'Past', value: 'past' },
          { title: 'Cancelled', value: 'cancelled' },
        ],
      },
      initialValue: 'upcoming',
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
  orderings: [
    { title: 'Date (Newest)', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
    { title: 'Date (Oldest)', name: 'dateAsc', by: [{ field: 'date', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'location', date: 'date', media: 'heroImage' },
    prepare({ title, subtitle, date }) {
      const d = date ? new Date(date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
      return { title, subtitle: `${d} — ${subtitle || ''}` };
    },
  },
});
