import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'leadMagnet',
  title: 'Lead Magnet',
  type: 'document',
  fieldsets: [
    { name: 'hero', title: 'Hero Section', options: { collapsible: true } },
    { name: 'media', title: 'Media & Files', options: { collapsible: true } },
    { name: 'form', title: 'Form Configuration', options: { collapsible: true } },
    { name: 'whatsInside', title: "What's Inside Section", options: { collapsible: true, collapsed: true } },
    { name: 'secondCta', title: 'Second CTA Section', options: { collapsible: true, collapsed: true } },
    { name: 'thankYou', title: 'Thank You Page', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    // ── Core ──
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      description: 'Internal name for this lead magnet (not shown on the page)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      description: 'Page will be at /resources/[slug]/',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      description: 'Uncheck to hide this landing page from the site',
      initialValue: true,
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 2,
      description: 'Meta description for search engines (150-160 characters)',
    }),

    // ── Hero ──
    defineField({
      name: 'heroLabel',
      title: 'Label',
      type: 'string',
      description: 'Small caps label above the headline, e.g., "Free Reading Guide"',
      fieldset: 'hero',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Headline',
      type: 'string',
      description: 'Main headline, e.g., "The Roadmap to Renewal"',
      fieldset: 'hero',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Italic subtitle below the headline',
      fieldset: 'hero',
    }),
    defineField({
      name: 'introText',
      title: 'Intro Paragraph',
      type: 'text',
      rows: 4,
      description: 'Introductory paragraph below the subtitle',
      fieldset: 'hero',
    }),
    defineField({
      name: 'benefits',
      title: 'Benefit Bullets',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Key benefits shown as bullet points (✦ markers)',
      fieldset: 'hero',
    }),

    // ── Media ──
    defineField({
      name: 'mockupImage',
      title: 'Preview Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Preview/mockup image shown above the form (e.g., blurred PDF screenshot)',
      fieldset: 'media',
    }),
    defineField({
      name: 'downloadFile',
      title: 'Download File (PDF)',
      type: 'file',
      options: { accept: '.pdf' },
      description: 'The actual PDF file that will be delivered via email',
      fieldset: 'media',
    }),

    // ── Form ──
    defineField({
      name: 'formTitle',
      title: 'Form Title',
      type: 'string',
      description: 'Heading above the form, e.g., "Get the Free Reading Guide"',
      fieldset: 'form',
    }),
    defineField({
      name: 'formDescription',
      title: 'Form Description',
      type: 'string',
      description: 'Short text below the form title, e.g., "We\'ll email the guide straight to your inbox."',
      fieldset: 'form',
    }),
    defineField({
      name: 'formButtonText',
      title: 'Submit Button Text',
      type: 'string',
      description: 'Button label, e.g., "Get the Reading Guide"',
      fieldset: 'form',
    }),
    defineField({
      name: 'acTagName',
      title: 'ActiveCampaign Tag Name',
      type: 'string',
      description: 'Create this tag in ActiveCampaign FIRST, then enter the exact tag name here. This connects the form to your AC automation. Example: "reading-guide"',
      fieldset: 'form',
      validation: (Rule) => Rule.required(),
    }),

    // ── What's Inside ──
    defineField({
      name: 'insideTitle',
      title: 'Section Title',
      type: 'string',
      description: 'Defaults to "What\'s Inside" if left blank',
      fieldset: 'whatsInside',
    }),
    defineField({
      name: 'insideDescription',
      title: 'Section Description',
      type: 'string',
      description: 'Italic description below the title',
      fieldset: 'whatsInside',
    }),
    defineField({
      name: 'insideItems',
      title: 'Items',
      type: 'array',
      fieldset: 'whatsInside',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'number', title: 'Number', type: 'number' }),
            defineField({ name: 'label', title: 'Label', type: 'string' }),
          ],
          preview: {
            select: { number: 'number', label: 'label' },
            prepare({ number, label }) {
              return { title: `${number}. ${label}` };
            },
          },
        },
      ],
    }),

    // ── Second CTA ──
    defineField({
      name: 'ctaTitle',
      title: 'CTA Heading',
      type: 'string',
      description: 'e.g., "Ready to Begin?"',
      fieldset: 'secondCta',
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA Text',
      type: 'string',
      description: 'e.g., "Get the free reading guide and start your roadmap to renewal."',
      fieldset: 'secondCta',
    }),

    // ── Thank You Page ──
    defineField({
      name: 'thankYouTitle',
      title: 'Thank You Headline',
      type: 'string',
      description: 'e.g., "Your Reading Guide Is on Its Way"',
      fieldset: 'thankYou',
    }),
    defineField({
      name: 'thankYouMessage',
      title: 'Thank You Message',
      type: 'text',
      rows: 3,
      description: 'Main confirmation message shown after form submission',
      fieldset: 'thankYou',
    }),
    defineField({
      name: 'thankYouNextSteps',
      title: 'Next Steps',
      type: 'array',
      fieldset: 'thankYou',
      description: 'Cards shown below the confirmation message (e.g., "Join a Book Study", "Read Magnalia")',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({ name: 'text', title: 'Description', type: 'string' }),
            defineField({ name: 'url', title: 'Link URL', type: 'url', validation: (Rule) => Rule.uri({ allowRelative: true }) }),
          ],
          preview: {
            select: { title: 'heading', subtitle: 'text' },
          },
        },
      ],
    }),
    defineField({
      name: 'thankYouCtaText',
      title: 'CTA Button Text',
      type: 'string',
      description: 'Optional button below next steps, e.g., "Explore the Institute"',
      fieldset: 'thankYou',
    }),
    defineField({
      name: 'thankYouCtaUrl',
      title: 'CTA Button URL',
      type: 'url',
      description: 'Where the button links to',
      fieldset: 'thankYou',
      validation: (Rule) => Rule.uri({ allowRelative: true }),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      enabled: 'enabled',
      media: 'mockupImage',
    },
    prepare({ title, enabled, media }) {
      return {
        title: `${enabled === false ? '🚫 ' : ''}${title}`,
        subtitle: enabled === false ? 'Disabled' : 'Active',
        media,
      };
    },
  },
});
