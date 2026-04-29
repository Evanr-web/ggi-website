import { getLibraryArticles } from '../lib/sanity';

export async function GET() {
  const site = import.meta.env.SITE || 'https://gregorythegreat.ca';
  const base = import.meta.env.BASE_URL || '/';
  const articles = await getLibraryArticles();

  const items = (articles || [])
    .sort((a: any, b: any) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, 50)
    .map((article: any) => {
      const url = `${site}${base}library/${article.slug?.current || article.slug}/`.replace(/\/+/g, '/').replace(':/', '://');
      const pubDate = new Date(article.publishDate + 'T12:00:00Z').toUTCString();
      const category = article.category || 'essay';
      const image = article.image ? `<enclosure url="${article.image}" type="image/jpeg" />` : '';

      return `    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${article.excerpt || ''}]]></description>
      <category>${category}</category>
      ${image}
    </item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Gregory the Great Institute — Library</title>
    <description>Essays, lectures, and resources on Catholic culture, education, and the intellectual life. From the Gregory the Great Institute.</description>
    <link>${site}${base}library/</link>
    <atom:link href="${site}${base}rss.xml" rel="self" type="application/rss+xml" />
    <language>en-ca</language>
    <copyright>© ${new Date().getFullYear()} Gregory the Great Institute</copyright>
    <managingEditor>info@gregorythegreat.ca (Gregory the Great Institute)</managingEditor>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <image>
      <url>${site}${base}images/branding/ggi-seal.png</url>
      <title>Gregory the Great Institute</title>
      <link>${site}${base}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
