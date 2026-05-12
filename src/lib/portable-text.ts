import { toHTML } from '@portabletext/to-html';

/**
 * Render Sanity Portable Text blocks to HTML string.
 * Returns empty string if body is null/undefined/empty.
 */
export function renderPortableText(body: any): string {
  if (!body || !Array.isArray(body) || body.length === 0) {
    return '';
  }

  return toHTML(body, {
    components: {
      types: {
        image: ({ value }: { value: any }) => {
          const url = value?.url || value?.asset?.url || '';
          const alt = value?.alt || '';
          if (!url) return '';
          const caption = alt
            ? '<figcaption style="text-align:center;font-size:0.85rem;color:var(--color-gray,#666);margin-top:8px;">' + alt + '</figcaption>'
            : '';
          return '<figure><img src="' + url + '" alt="' + alt + '" style="width:100%;border-radius:3px;margin:24px 0;" />' + caption + '</figure>';
        },
      },
    },
  });
}
