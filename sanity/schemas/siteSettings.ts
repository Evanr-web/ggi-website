import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'announcementBar',
      title: 'Announcement Bar',
      type: 'object',
      fields: [
        { name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: false },
        { name: 'message', title: 'Message', type: 'string' },
        { name: 'linkText', title: 'Link Text', type: 'string' },
        { name: 'linkUrl', title: 'Link URL', type: 'url' },
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      fields: [
        { name: 'youtube', title: 'YouTube', type: 'url' },
        { name: 'instagram', title: 'Instagram', type: 'url' },
        { name: 'substack', title: 'Substack', type: 'url' },
        { name: 'twitter', title: 'Twitter / X', type: 'url' },
      ],
    }),
    defineField({
      name: 'footerTagline',
      title: 'Footer Tagline',
      type: 'string',
      initialValue: 'Fides • Ratio • Cultura',
    }),
    defineField({
      name: 'footerMission',
      title: 'Footer Mission Statement',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'charitableRegistration',
      title: 'Charitable Registration Note',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      initialValue: 'info@gregorythegreat.ca',
    }),
    defineField({
      name: 'mailingAddress',
      title: 'Mailing Address',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' };
    },
  },
});
