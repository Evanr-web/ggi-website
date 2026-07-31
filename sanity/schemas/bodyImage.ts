import { defineType, defineField } from 'sanity';
import { ImageIcon } from '@sanity/icons';

export default defineType({
  name: 'bodyImage',
  title: 'Custom Image',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'size',
      title: 'Size',
      type: 'string',
      description: 'How wide the image appears. "Small" works well for headshots beside text.',
      options: {
        list: [
          { title: 'Small (inline, beside text)', value: 'small' },
          { title: 'Medium (half width)', value: 'medium' },
          { title: 'Full width (default)', value: 'full' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'full',
    }),
    defineField({
      name: 'float',
      title: 'Position',
      type: 'string',
      description: 'Float the image left or right so text wraps around it. Only applies to Small and Medium sizes.',
      options: {
        list: [
          { title: 'Left', value: 'left' },
          { title: 'Right', value: 'right' },
          { title: 'Centre (own line)', value: 'none' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'none',
      hidden: ({ parent }: any) => !parent?.size || parent?.size === 'full',
    }),
    defineField({
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
      description: 'Describe the image for accessibility.',
    }),
  ],
  preview: {
    select: {
      title: 'alt',
      size: 'size',
      media: 'image',
    },
    prepare({ title, size, media }: any) {
      return {
        title: title || 'Image',
        subtitle: size ? `${size.charAt(0).toUpperCase() + size.slice(1)}` : 'Full width',
        media,
      };
    },
  },
});
