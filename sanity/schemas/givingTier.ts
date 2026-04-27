import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'givingTier',
  title: 'Giving Tier',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Tier Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'monthlyPrice',
      title: 'Monthly Price',
      type: 'string',
      description: 'e.g. "$10–49" or "$50" or "—" for annual-only tiers',
    }),
    defineField({
      name: 'annualPrice',
      title: 'Annual Price',
      type: 'string',
      description: 'e.g. "$120–588" or "$600" or "$5,000+"',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      description: 'One sentence shown below the tier name on the Support page.',
    }),
    defineField({
      name: 'benefits',
      title: 'Benefits',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'One benefit per line. First item can be "Everything in [lower tier], plus:" to show progression.',
    }),
    defineField({
      name: 'recommended',
      title: 'Recommended / Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Toggle ON to highlight this tier with a gold border on the Support page. Only one tier should be featured.',
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA Button Text',
      type: 'string',
      initialValue: 'Get Started',
    }),
    defineField({
      name: 'ctaUrl',
      title: 'CTA URL (Stripe / Zeffy)',
      type: 'url',
    }),
    defineField({
      name: 'order',
      title: 'Sort Order',
      type: 'number',
      description: 'Controls display order. 1 = first, 2 = second, etc.',
    }),
  ],
  orderings: [
    { title: 'Sort Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'name', subtitle: 'monthlyPrice' },
    prepare({ title, subtitle }) {
      return { title, subtitle: subtitle ? `${subtitle}/mo` : '' };
    },
  },
});
