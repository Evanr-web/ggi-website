import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'readingGroup',
  title: 'Reading Group',
  type: 'document',
  fields: [
    defineField({
      name: 'province',
      title: 'Province',
      type: 'string',
      options: {
        list: [
          { title: 'British Columbia', value: 'BC' },
          { title: 'Alberta', value: 'AB' },
          { title: 'Saskatchewan', value: 'SK' },
          { title: 'Manitoba', value: 'MB' },
          { title: 'Ontario', value: 'ON' },
          { title: 'Quebec', value: 'QC' },
          { title: 'New Brunswick', value: 'NB' },
          { title: 'Nova Scotia', value: 'NS' },
          { title: 'Prince Edward Island', value: 'PE' },
          { title: 'Newfoundland & Labrador', value: 'NL' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'groups',
      title: 'Number of Groups',
      type: 'number',
      validation: (Rule) => Rule.required().min(1),
      initialValue: 1,
    }),
    defineField({
      name: 'contactName',
      title: 'Contact Name',
      type: 'string',
      description: 'Optional — group leader or coordinator name (not shown publicly).',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      description: 'Optional — for internal coordination only (not shown publicly).',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Uncheck to hide this group from the map without deleting it.',
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'text',
      rows: 2,
      description: 'Internal notes (not shown on site).',
    }),
  ],
  preview: {
    select: { city: 'city', province: 'province', groups: 'groups', active: 'active' },
    prepare({ city, province, groups, active }) {
      return {
        title: `${city}, ${province}`,
        subtitle: `${groups} group${groups > 1 ? 's' : ''}${active === false ? ' (inactive)' : ''}`,
      };
    },
  },
});
