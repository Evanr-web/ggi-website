import { toHTML } from '@portabletext/to-html';
import { urlFor } from './sanity';

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
          const alt = value?.alt || '';
          const size = value?.size || 'full';
          const float = value?.float || 'none';
          // Use URL builder for hotspot/crop support, fall back to raw URL
          let url = '';
          if (value?.asset) {
            try {
              const width = size === 'small' ? 300 : size === 'medium' ? 600 : 1200;
              url = urlFor(value).width(width).fit('crop').auto('format').url();
            } catch {
              url = value.asset?.url || '';
            }
          } else {
            url = value?.url || '';
          }
          if (!url) return '';
          const caption = alt
            ? '<figcaption style="text-align:center;font-size:0.85rem;color:var(--color-gray,#666);margin-top:8px;">' + alt + '</figcaption>'
            : '';
          const cls = `article__figure article__figure--${size}` + (float !== 'none' ? ` article__figure--${float}` : '');
          return '<figure class="' + cls + '"><img src="' + url + '" alt="' + alt + '" style="width:100%;border-radius:3px;" />' + caption + '</figure>';
        },
        bodyImage: ({ value }: { value: any }) => {
          const alt = value?.alt || '';
          const size = value?.size || 'full';
          const float = value?.float || 'none';
          let url = '';
          const img = value?.image;
          if (img?.asset) {
            try {
              const width = size === 'small' ? 300 : size === 'medium' ? 600 : 1200;
              url = urlFor(img).width(width).fit('crop').auto('format').url();
            } catch {
              url = img.asset?.url || '';
            }
          }
          if (!url) return '';
          const caption = alt
            ? '<figcaption style="text-align:center;font-size:0.85rem;color:var(--color-gray,#666);margin-top:8px;">' + alt + '</figcaption>'
            : '';
          const cls = `article__figure article__figure--${size}` + (float !== 'none' ? ` article__figure--${float}` : '');
          return '<figure class="' + cls + '"><img src="' + url + '" alt="' + alt + '" style="width:100%;border-radius:3px;" />' + caption + '</figure>';
        },
        inlineVideo: ({ value }: { value: any }) => {
          const title = value?.title || '';
          const caption = title
            ? '<figcaption style="text-align:center;font-size:0.85rem;color:var(--color-gray,#666);margin-top:8px;">' + title + '</figcaption>'
            : '';
          if (value?.source === 'youtube' && value?.youtubeUrl) {
            const match = value.youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
            const ytId = match ? match[1] : null;
            if (ytId) {
              return '<figure class="article__video-embed"><div class="article__video-wrapper"><iframe src="https://www.youtube-nocookie.com/embed/' + ytId + '?rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>' + caption + '</figure>';
            }
          }
          if (value?.fileUrl) {
            return '<figure class="article__video-embed"><video controls playsinline preload="metadata" style="width:100%;border-radius:3px;"><source src="' + value.fileUrl + '" /></video>' + caption + '</figure>';
          }
          return '';
        },
      },
    },
  });
}
