import { defineConfig } from 'sanity';
import { createElement } from 'react';
import { structureTool } from 'sanity/structure';
import type { StructureBuilder } from 'sanity/structure';
import { Iframe } from 'sanity-plugin-iframe-pane';
import { schemaTypes } from './schemas';

// Preview URL base — points at the Astro dev server
const PREVIEW_BASE = 'https://ggi-website.pages.dev';
const PREVIEW_SECRET = 'renewing-culture';

// Map document types to preview URL paths
function resolvePreviewUrl(doc: any) {
  const slug = doc?.slug?.current;

  switch (doc._type) {
    case 'libraryItem':
      return slug ? `${PREVIEW_BASE}/preview/library/${slug}/?secret=${PREVIEW_SECRET}` : null;
    case 'event':
      return slug ? `${PREVIEW_BASE}/preview/events/${slug}/?secret=${PREVIEW_SECRET}` : null;
    case 'program':
      return slug ? `${PREVIEW_BASE}/preview/programs/${slug}/?secret=${PREVIEW_SECRET}` : null;
    case 'magnaliaIssue':
      return slug ? `${PREVIEW_BASE}/preview/magnalia/${slug}/?secret=${PREVIEW_SECRET}` : null;
    case 'careerPosting':
      return slug ? `${PREVIEW_BASE}/preview/careers/${slug}/?secret=${PREVIEW_SECRET}` : null;
    case 'homepage':
      return `${PREVIEW_BASE}/preview/homepage/?secret=${PREVIEW_SECRET}`;
    case 'siteSettings':
      return `${PREVIEW_BASE}/preview/site-settings/?secret=${PREVIEW_SECRET}`;
    default:
      return null;
  }
}

// Helper to build a document view with editor + preview pane
function documentViewsWithPreview(S: StructureBuilder) {
  return [
    S.view.form(),
    S.view.component(Iframe as any).options({
      url: (doc: any) => resolvePreviewUrl(doc),
      reload: { button: true, revision: true },
    }).title('Preview'),
  ];
}

const structure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      // Singletons — with preview
      S.listItem()
        .title('⚙️ Site Settings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .views(documentViewsWithPreview(S))
        ),
      S.listItem()
        .title('🏠 Homepage')
        .child(
          S.document()
            .schemaType('homepage')
            .documentId('homepage')
            .views(documentViewsWithPreview(S))
        ),
      S.listItem()
        .title('🎓 Programs Overview')
        .child(
          S.document()
            .schemaType('programsOverview')
            .documentId('programsOverview')
        ),

      S.divider(),

      // Library with sub-groups
      S.listItem()
        .title('📚 Library')
        .child(
          S.list()
            .title('Library')
            .items([
              S.listItem()
                .title('All Items')
                .child(
                  S.documentTypeList('libraryItem')
                    .title('All Library Items')
                    .defaultOrdering([{ field: 'publishDate', direction: 'desc' }])
                    .child((documentId: string) =>
                      S.document()
                        .documentId(documentId)
                        .schemaType('libraryItem')
                        .views(documentViewsWithPreview(S))
                    )
                ),
              S.listItem()
                .title('Essays')
                .child(
                  S.documentList()
                    .title('Essays')
                    .filter('_type == "libraryItem" && category == "essay"')
                    .defaultOrdering([{ field: 'publishDate', direction: 'desc' }])
                    .child((documentId: string) =>
                      S.document()
                        .documentId(documentId)
                        .schemaType('libraryItem')
                        .views(documentViewsWithPreview(S))
                    )
                ),
              S.listItem()
                .title('Videos & Lectures')
                .child(
                  S.documentList()
                    .title('Videos & Lectures')
                    .filter('_type == "libraryItem" && category == "video"')
                    .defaultOrdering([{ field: 'publishDate', direction: 'desc' }])
                    .child((documentId: string) =>
                      S.document()
                        .documentId(documentId)
                        .schemaType('libraryItem')
                        .views(documentViewsWithPreview(S))
                    )
                ),
              S.listItem()
                .title('Resources')
                .child(
                  S.documentList()
                    .title('Resources')
                    .filter('_type == "libraryItem" && category == "resource"')
                    .defaultOrdering([{ field: 'publishDate', direction: 'desc' }])
                    .child((documentId: string) =>
                      S.document()
                        .documentId(documentId)
                        .schemaType('libraryItem')
                        .views(documentViewsWithPreview(S))
                    )
                ),
              S.listItem()
                .title('News & Updates')
                .child(
                  S.documentList()
                    .title('News & Updates')
                    .filter('_type == "libraryItem" && category == "news"')
                    .defaultOrdering([{ field: 'publishDate', direction: 'desc' }])
                    .child((documentId: string) =>
                      S.document()
                        .documentId(documentId)
                        .schemaType('libraryItem')
                        .views(documentViewsWithPreview(S))
                    )
                ),
              S.listItem()
                .title('⭐ Featured')
                .child(
                  S.documentList()
                    .title('Featured Items')
                    .filter('_type == "libraryItem" && featured == true')
                    .defaultOrdering([{ field: 'publishDate', direction: 'desc' }])
                    .child((documentId: string) =>
                      S.document()
                        .documentId(documentId)
                        .schemaType('libraryItem')
                        .views(documentViewsWithPreview(S))
                    )
                ),
              S.divider(),
              S.listItem()
                .title('✉️ Pending Substack')
                .child(
                  S.documentList()
                    .title('Pending Substack Cross-Post')
                    .filter('_type == "libraryItem" && crossPostSubstack.syndicate == true && crossPostSubstack.posted != true')
                    .defaultOrdering([{ field: 'publishDate', direction: 'desc' }])
                    .child((documentId: string) =>
                      S.document()
                        .documentId(documentId)
                        .schemaType('libraryItem')
                        .views(documentViewsWithPreview(S))
                    )
                ),
              S.listItem()
                .title('🏷️ Manage Tags')
                .child(S.documentTypeList('tag').title('Tags')),
            ])
        ),

      // Programs — with preview
      S.listItem()
        .title('🎓 Programs')
        .child(
          S.documentTypeList('program')
            .title('Programs')
            .child((documentId: string) =>
              S.document()
                .documentId(documentId)
                .schemaType('program')
                .views(documentViewsWithPreview(S))
            )
        ),

      // Events — with preview
      S.listItem()
        .title('📅 Events')
        .child(
          S.documentTypeList('event')
            .title('Events')
            .defaultOrdering([{ field: 'date', direction: 'desc' }])
            .child((documentId: string) =>
              S.document()
                .documentId(documentId)
                .schemaType('event')
                .views(documentViewsWithPreview(S))
            )
        ),

      // Magnalia — with preview
      S.listItem()
        .title('📖 Magnalia Issues')
        .child(
          S.documentTypeList('magnaliaIssue')
            .title('Magnalia Issues')
            .child((documentId: string) =>
              S.document()
                .documentId(documentId)
                .schemaType('magnaliaIssue')
                .views(documentViewsWithPreview(S))
            )
        ),

      S.divider(),

      // Book Studies
      S.listItem()
        .title('📕 Book Studies')
        .child(
          S.documentTypeList('bookStudy')
            .title('Book Studies')
            .defaultOrdering([{ field: 'year', direction: 'desc' }, { field: 'order', direction: 'asc' }])
        ),

      // Reading Groups
      S.listItem()
        .title('🗺️ Reading Groups')
        .child(
          S.documentTypeList('readingGroup')
            .title('Reading Groups')
            .defaultOrdering([{ field: 'province', direction: 'asc' }, { field: 'city', direction: 'asc' }])
        ),

      S.divider(),

      // People
      S.listItem()
        .title('👤 People')
        .child(S.documentTypeList('person').title('People')),

      // Giving Tiers
      S.listItem()
        .title('💰 Giving Tiers')
        .child(S.documentTypeList('givingTier').title('Giving Tiers')),

      // Careers — with preview
      S.listItem()
        .title('💼 Career Postings')
        .child(
          S.documentTypeList('careerPosting')
            .title('Career Postings')
            .child((documentId: string) =>
              S.document()
                .documentId(documentId)
                .schemaType('careerPosting')
                .views(documentViewsWithPreview(S))
            )
        ),
    ]);

const GoldG = () =>
  createElement(
    'svg',
    { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 32 32', width: '1em', height: '1em' },
    createElement('circle', { cx: 16, cy: 16, r: 16, fill: '#0e3352' }),
    createElement(
      'text',
      { x: 16, y: 21, textAnchor: 'middle', fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 'bold', fill: '#b89a47' },
      'G'
    )
  );

export default defineConfig({
  name: 'ggi',
  title: 'Gregory the Great Institute',
  projectId: 'dhzbvx7r',
  dataset: 'production',
  icon: GoldG,
  plugins: [structureTool({ structure })],
  schema: {
    types: schemaTypes,
  },
  document: {
    actions: (prev, context) => {
      // Singletons shouldn't be duplicated or deleted
      const singletons = ['siteSettings', 'homepage', 'programsOverview'];
      if (singletons.includes(context.schemaType)) {
        return prev.filter(
          (action: any) => !['duplicate', 'delete'].includes(action.action || '')
        );
      }
      return prev;
    },
  },
});
