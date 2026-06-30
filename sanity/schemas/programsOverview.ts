import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'programsOverview',
  title: 'Programs Overview',
  type: 'document',
  groups: [
    { name: 'hero', title: '🏔️ Hero' },
    { name: 'cards', title: '📋 Program Cards' },
    { name: 'footer', title: '🔗 Footer Message' },
  ],
  fields: [
    // === Hero Section ===
    defineField({
      name: 'heroImage',
      title: 'Hero Background Image',
      type: 'image',
      options: { hotspot: true },
      group: 'hero',
      description: 'Background image for the hero banner. Recommended: 1920×1080px landscape.',
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero Headline',
      type: 'string',
      group: 'hero',
      description: 'e.g. "Formation, Courses & Community"',
    }),
    defineField({
      name: 'heroQuote',
      title: 'Hero Quote',
      type: 'text',
      rows: 2,
      group: 'hero',
      description: 'Italicized quote below the headline.',
    }),
    defineField({
      name: 'heroAttribution',
      title: 'Quote Attribution',
      type: 'string',
      group: 'hero',
      description: 'e.g. "— St. Catherine of Siena"',
    }),

    // === Program Cards ===
    defineField({
      name: 'cards',
      title: 'Program Cards',
      type: 'array',
      group: 'cards',
      description: 'Each card appears on the Programs overview page. Drag to reorder. Cards alternate left/right layout automatically.',
      of: [
        {
          type: 'object',
          name: 'programCard',
          title: 'Program Card',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'Gold text above the title, e.g. "Annual Flagship Gathering", "Youth Formation"',
            }),
            defineField({
              name: 'thumbnail',
              title: 'Thumbnail Image',
              type: 'image',
              options: { hotspot: true },
              description: 'Card image. Recommended: 800×500px landscape.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'thumbnailAlt',
              title: 'Thumbnail Alt Text',
              type: 'string',
              description: 'Describes the image for accessibility.',
            }),
            defineField({
              name: 'artFilter',
              title: 'Apply Art Filter',
              type: 'boolean',
              description: 'Apply the subtle art-filter effect to the thumbnail. Best for paintings/classical art.',
              initialValue: false,
            }),
            defineField({
              name: 'imagePosition',
              title: 'Image Focus Point',
              type: 'string',
              description: 'CSS object-position value. Default: "center center". Use "center 20%" to show the top of the image (e.g. for portraits), or "center 80%" for the bottom.',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 4,
              description: 'Short paragraph describing this program/event.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'details',
              title: 'Details',
              type: 'array',
              description: 'Key/value pairs like Audience, Format, Frequency, Cost, Next date.',
              of: [
                {
                  type: 'object',
                  name: 'detailPair',
                  fields: [
                    { name: 'key', title: 'Label', type: 'string', validation: (Rule: any) => Rule.required() },
                    { name: 'value', title: 'Value', type: 'string', validation: (Rule: any) => Rule.required() },
                  ],
                  preview: {
                    select: { title: 'key', subtitle: 'value' },
                  },
                },
              ],
            }),
            defineField({
              name: 'ctaText',
              title: 'Button Text',
              type: 'string',
              description: 'e.g. "Learn More", "Register", "Join a Book Study"',
              initialValue: 'Learn More',
            }),
            defineField({
              name: 'ctaLink',
              title: 'Button Link',
              type: 'string',
              description: 'Relative URL, e.g. "/events/conference-2026/" or "/programs/book-studies/"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'enabled',
              title: 'Show This Card',
              type: 'boolean',
              description: 'Toggle off to hide this card without deleting it.',
              initialValue: true,
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'label',
              media: 'thumbnail',
              enabled: 'enabled',
            },
            prepare({ title, subtitle, media, enabled }) {
              return {
                title: `${enabled === false ? '🚫 ' : ''}${title || 'Untitled'}`,
                subtitle: subtitle || '',
                media,
              };
            },
          },
        },
      ],
    }),

    // === Footer Message ===
    defineField({
      name: 'footerMessage',
      title: 'Footer Message',
      type: 'text',
      rows: 2,
      group: 'footer',
      description: 'The "Made possible by..." line at the bottom. Supports a link.',
    }),
    defineField({
      name: 'footerLinkText',
      title: 'Footer Link Text',
      type: 'string',
      group: 'footer',
      description: 'e.g. "Join them →"',
    }),
    defineField({
      name: 'footerLinkUrl',
      title: 'Footer Link URL',
      type: 'string',
      group: 'footer',
      description: 'e.g. "/support/"',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Programs Overview' };
    },
  },
});
