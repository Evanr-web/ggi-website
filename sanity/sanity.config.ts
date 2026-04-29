import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import type { StructureBuilder } from 'sanity/structure';
import { schemaTypes } from './schemas';

const structure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      // Singletons
      S.listItem()
        .title('⚙️ Site Settings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.listItem()
        .title('🏠 Homepage')
        .child(S.document().schemaType('homepage').documentId('homepage')),

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
                ),
              S.listItem()
                .title('Essays')
                .child(
                  S.documentList()
                    .title('Essays')
                    .filter('_type == "libraryItem" && category == "essay"')
                    .defaultOrdering([{ field: 'publishDate', direction: 'desc' }])
                ),
              S.listItem()
                .title('Videos & Lectures')
                .child(
                  S.documentList()
                    .title('Videos & Lectures')
                    .filter('_type == "libraryItem" && category == "video"')
                    .defaultOrdering([{ field: 'publishDate', direction: 'desc' }])
                ),
              S.listItem()
                .title('Resources')
                .child(
                  S.documentList()
                    .title('Resources')
                    .filter('_type == "libraryItem" && category == "resource"')
                    .defaultOrdering([{ field: 'publishDate', direction: 'desc' }])
                ),
              S.listItem()
                .title('⭐ Featured')
                .child(
                  S.documentList()
                    .title('Featured Items')
                    .filter('_type == "libraryItem" && featured == true')
                    .defaultOrdering([{ field: 'publishDate', direction: 'desc' }])
                ),
              S.divider(),
              S.listItem()
                .title('🏷️ Manage Tags')
                .child(S.documentTypeList('tag').title('Tags')),
            ])
        ),

      // Programs
      S.listItem()
        .title('🎓 Programs')
        .child(S.documentTypeList('program').title('Programs')),

      // Events
      S.listItem()
        .title('📅 Events')
        .child(
          S.documentTypeList('event')
            .title('Events')
            .defaultOrdering([{ field: 'startDate', direction: 'desc' }])
        ),

      // Magnalia
      S.listItem()
        .title('📖 Magnalia Issues')
        .child(S.documentTypeList('magnaliaIssue').title('Magnalia Issues')),

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

      // Careers
      S.listItem()
        .title('💼 Career Postings')
        .child(S.documentTypeList('careerPosting').title('Career Postings')),
    ]);

export default defineConfig({
  name: 'ggi',
  title: 'Gregory the Great Institute',
  projectId: 'dhzbvx7r',
  dataset: 'production',
  plugins: [structureTool({ structure })],
  schema: {
    types: schemaTypes,
  },
});
