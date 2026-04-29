import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'bookStudy',
  title: 'Book Study',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Book Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: "Short description of the book and why we're reading it.",
    }),
    defineField({
      name: 'month',
      title: 'Month',
      type: 'string',
      options: {
        list: [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December',
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (Rule) => Rule.required().min(2024).max(2040),
      initialValue: new Date().getFullYear(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Upcoming', value: 'upcoming' },
          { title: 'Current Study', value: 'current' },
          { title: 'Completed', value: 'completed' },
        ],
        layout: 'radio',
      },
      initialValue: 'upcoming',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'eventPage',
      title: 'Event Page URL',
      type: 'string',
      description: 'Path to the event page, e.g. /events/book-study-may-2026/',
    }),
    defineField({
      name: 'studyGuideUrl',
      title: 'Study Guide URL',
      type: 'url',
      description: 'Link to the downloadable study guide PDF.',
    }),
    defineField({
      name: 'coverImage',
      title: 'Book Cover Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'order',
      title: 'Sort Order',
      type: 'number',
      description: 'Lower numbers appear first.',
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: 'By Date',
      name: 'dateAsc',
      by: [{ field: 'year', direction: 'asc' }, { field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'author', month: 'month', year: 'year', status: 'status' },
    prepare({ title, subtitle, month, year, status }) {
      const emoji = status === 'current' ? '📖 ' : status === 'completed' ? '✓ ' : '◻ ';
      return { title: `${emoji}${title}`, subtitle: `${subtitle} — ${month} ${year}` };
    },
  },
});
