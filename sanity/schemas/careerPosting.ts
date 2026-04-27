import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'careerPosting',
  title: 'Career / Opportunity',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Position Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g. "Communications Intern — Canada Summer Jobs 2026"',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Auto-generated from the title. This becomes the page URL (e.g. /careers/communications-intern/).',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Opportunity Type',
      type: 'string',
      options: {
        list: [
          { title: 'Full-time', value: 'full-time' },
          { title: 'Part-time', value: 'part-time' },
          { title: 'Internship', value: 'internship' },
          { title: 'Volunteer', value: 'volunteer' },
          { title: 'Contract', value: 'contract' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g. "Edmonton, AB" or "Remote" or "Hybrid"',
    }),
    defineField({
      name: 'compensation',
      title: 'Compensation',
      type: 'string',
      description: 'e.g. "$18/hr" or "Volunteer (stipend available)" or "Salary commensurate with experience"',
    }),
    defineField({
      name: 'deadline',
      title: 'Application Deadline',
      type: 'date',
      description: 'Leave blank if rolling applications.',
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
    }),
    defineField({
      name: 'summary',
      title: 'Short Summary',
      type: 'text',
      rows: 3,
      description: 'Appears on the careers listing page. 2-3 sentences.',
      validation: (Rule) => Rule.max(300).warning('Keep under 300 characters for the best layout.'),
    }),
    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Responsibilities, qualifications, about the role, etc.',
    }),
    defineField({
      name: 'detailsPdf',
      title: 'Full Details PDF (optional)',
      type: 'file',
      description: 'Link to a downloadable PDF with the full posting.',
    }),
    defineField({
      name: 'externalPdfUrl',
      title: 'External PDF URL (optional)',
      type: 'url',
      description: 'If the PDF is hosted elsewhere (e.g. Wix), paste the URL here.',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'Toggle OFF when the position is filled. Inactive postings are hidden from the careers page.',
      initialValue: true,
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      description: 'Email for questions about this posting.',
    }),
  ],
  orderings: [
    { title: 'Deadline', name: 'deadlineAsc', by: [{ field: 'deadline', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', type: 'type', active: 'active' },
    prepare({ title, type, active }) {
      return {
        title: `${active ? '' : '🚫 '}${title}`,
        subtitle: type ? type.charAt(0).toUpperCase() + type.slice(1) : '',
      };
    },
  },
});
