import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'announcements', title: '📢 Announcements' },
    { name: 'social', title: '🔗 Social & Contact' },
    { name: 'footer', title: '🦶 Footer' },
  ],
  fields: [
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    }),

    // === Ribbon Banner ===
    defineField({
      name: 'ribbonBanner',
      title: 'Ribbon Banner (top of page)',
      type: 'object',
      group: 'announcements',
      description: 'A thin banner above the navigation. Use for timely announcements.',
      fields: [
        { name: 'enabled', title: 'Show Banner', type: 'boolean', initialValue: false },
        { name: 'message', title: 'Message', type: 'string', description: 'Keep it short — one line.' },
        { name: 'linkText', title: 'Link Text', type: 'string', description: 'e.g. "Learn More" or "Register Now"' },
        { name: 'linkUrl', title: 'Link URL', type: 'string' },
        {
          name: 'style',
          title: 'Style',
          type: 'string',
          options: {
            list: [
              { title: 'Gold (default)', value: 'gold' },
              { title: 'Navy (urgent)', value: 'navy' },
              { title: 'Crimson (critical)', value: 'crimson' },
            ],
          },
          initialValue: 'gold',
        },
      ],
    }),

    // === Fly-in Popup ===
    defineField({
      name: 'flyinPopup',
      title: 'Fly-in Popup (bottom right)',
      type: 'object',
      group: 'announcements',
      description: 'A slide-in from the bottom-right corner. Use for promotions, hiring, events. Shows once per session.',
      fields: [
        { name: 'enabled', title: 'Show Popup', type: 'boolean', initialValue: false },
        { name: 'headline', title: 'Headline', type: 'string', description: 'e.g. "We\'re Hiring!" or "Conference Early Bird"' },
        { name: 'message', title: 'Message', type: 'text', rows: 3, description: '2-3 sentences max.' },
        { name: 'ctaText', title: 'Button Text', type: 'string', description: 'e.g. "Apply Now" or "Register"' },
        { name: 'ctaUrl', title: 'Button URL', type: 'string' },
        { name: 'image', title: 'Image (optional)', type: 'image', description: 'Small image or icon. Shows at the top of the popup.' },
        {
          name: 'delay',
          title: 'Delay (seconds)',
          type: 'number',
          description: 'How many seconds after page load before the popup appears.',
          initialValue: 5,
        },
        {
          name: 'showOnPages',
          title: 'Show On',
          type: 'string',
          options: {
            list: [
              { title: 'All pages', value: 'all' },
              { title: 'Homepage only', value: 'home' },
            ],
          },
          initialValue: 'all',
        },
      ],
    }),

    // === Social & Contact ===
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      group: 'social',
      fields: [
        { name: 'youtube', title: 'YouTube', type: 'url' },
        { name: 'instagram', title: 'Instagram', type: 'url' },
        { name: 'substack', title: 'Substack', type: 'url' },
        { name: 'twitter', title: 'Twitter / X', type: 'url' },
      ],
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      group: 'social',
      initialValue: 'info@gregorythegreat.ca',
    }),
    defineField({
      name: 'mailingAddress',
      title: 'Mailing Address',
      type: 'text',
      rows: 3,
      group: 'social',
    }),

    // === Footer ===
    defineField({
      name: 'footerTagline',
      title: 'Footer Tagline',
      type: 'string',
      group: 'footer',
      initialValue: 'Fides • Ratio • Cultura',
    }),
    defineField({
      name: 'footerMission',
      title: 'Footer Mission Statement',
      type: 'text',
      rows: 2,
      group: 'footer',
    }),
    defineField({
      name: 'charitableRegistration',
      title: 'Charitable Registration Note',
      type: 'text',
      rows: 3,
      group: 'footer',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' };
    },
  },
});
