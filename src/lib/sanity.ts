import { sanityClient } from 'sanity:client';
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Image URL builder
const builder = imageUrlBuilder(sanityClient);
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// === Preview Client (fetches drafts) ===
let _previewClient: ReturnType<typeof createClient> | null = null;
export function getPreviewClient() {
  if (!_previewClient) {
    _previewClient = createClient({
      projectId: 'dhzbvx7r',
      dataset: 'production',
      useCdn: false,
      token: import.meta.env.SANITY_PREVIEW_TOKEN,
      perspective: 'previewDrafts',
      apiVersion: '2024-01-01',
    });
  }
  return _previewClient;
}

// Preview-aware fetch: uses draft client when preview=true
export async function previewFetch(query: string, params?: Record<string, any>) {
  return getPreviewClient().fetch(query, params || {});
}

// === GROQ Queries ===

// Site Settings (singleton)
export async function getSiteSettings() {
  return sanityClient.fetch(`*[_type == "siteSettings"][0]{
    ribbonBanner,
    flyinPopup,
    socialLinks,
    contactEmail,
    mailingAddress,
    footerTagline,
    footerMission,
    charitableRegistration,
    "logo": logo.asset->url
  }`);
}

// Homepage (singleton)
export async function getHomepage() {
  return sanityClient.fetch(`*[_type == "homepage"][0]{
    heroHeadline,
    heroSubtitle,
    "heroImage": heroImage.asset->url,
    heroCta,
    heroSecondaryCta,
    quoteText,
    quoteAttribution,
    pillarsLabel,
    pillarsHeading,
    pillarsDescription,
    pillars[]{
      title,
      description,
      "image": image.asset->url,
      imageAlt,
      linkUrl,
      linkText
    },
    videoUrl,
    videoCaption,
    featuredLibraryItems[]->{
      _id,
      title,
      slug,
      category,
      publishDate,
      author,
      excerpt,
      "image": featuredImage.asset->url
    }
  }`);
}

// Upcoming events (next 3 by date)
export async function getUpcomingEvents(limit = 3) {
  const today = new Date().toISOString().split('T')[0];
  return sanityClient.fetch(`*[_type == "event" && startDate >= $today] | order(startDate asc) [0...$limit]{
    _id,
    title,
    slug,
    startDate,
    location,
    shortDescription,
    tagline,
    programTag,
    template,
    "headerImage": headerImage.asset->url
  }`, { today, limit });
}

// Latest library items (fallback when no featured picks)
export async function getLatestLibraryItems(limit = 3) {
  return sanityClient.fetch(`*[_type == "libraryItem" && enabled != false] | order(publishDate desc) [0...$limit]{
    _id,
    title,
    slug,
    category,
    publishDate,
    author,
    excerpt,
    "image": featuredImage.asset->url
  }`, { limit });
}

// Events
export async function getEvents(status?: string) {
  const filter = status ? `&& status == "${status}"` : '';
  return sanityClient.fetch(`*[_type == "event" ${filter}] | order(startDate asc) {
    _id,
    title,
    slug,
    template,
    status,
    startDate,
    endDate,
    location,
    "headerImage": headerImage.asset->url,
    shortDescription,
    tagline,
    registrationUrl,
    cost,
    capacity
  }`);
}

export async function getEvent(slug: string) {
  return sanityClient.fetch(`*[_type == "event" && slug.current == $slug][0]{
    ...,
    "headerImage": headerImage.asset->url,
    "speakers": speakers[]{
      ...,
      "photo": photo.asset->url
    }
  }`, { slug });
}

// Library Articles
export async function getLibraryArticles() {
  return sanityClient.fetch(`*[_type == "libraryItem" && enabled != false] | order(publishDate desc) {
    _id,
    title,
    slug,
    category,
    publishDate,
    "author": author->name,
    excerpt,
    featured,
    "image": featuredImage.asset->url
  }`);
}

export async function getLibraryArticle(slug: string) {
  return sanityClient.fetch(`*[_type == "libraryItem" && slug.current == $slug][0]{
    ...,
    "image": featuredImage.asset->url,
    featuredImage { asset-> },
    body[]{
      ...,
      _type == "image" => { "url": asset->url }
    }
  }`, { slug });
}

// People
export async function getPeople(personType?: string) {
  const filter = personType ? `&& personType == "${personType}"` : '';
  return sanityClient.fetch(`*[_type == "person" && published == true ${filter}] | order(order asc, name asc) {
    _id,
    name,
    role,
    shortBio,
    personType,
    "photo": photo.asset->url,
    credentials,
    email
  }`);
}

// Programs
export async function getPrograms() {
  return sanityClient.fetch(`*[_type == "program"] | order(order asc) {
    _id,
    title,
    slug,
    template,
    tagline,
    shortDescription,
    "headerImage": headerImage.asset->url,
    dates,
    location,
    cost,
    registrationUrl,
    enabled
  }`);
}

// Program visibility map — returns { slug: enabled } for all programs
export async function getProgramVisibility(): Promise<Record<string, boolean>> {
  const results = await sanityClient.fetch(`*[_type == "program"]{ "slug": slug.current, enabled }`);
  const map: Record<string, boolean> = {};
  for (const r of results || []) {
    if (r.slug) map[r.slug] = r.enabled !== false; // default true if field not set
  }
  return map;
}

export async function getProgram(slug: string) {
  return sanityClient.fetch(`*[_type == "program" && slug.current == $slug][0]{
    ...,
    "headerImage": headerImage.asset->url,
    testimonials,
    highlights,
    schedule,
    whoItsFor,
    "seoOgImage": seo.ogImage.asset->url
  }`, { slug });
}

export async function getAllProgramSlugs() {
  return sanityClient.fetch(`*[_type == "program"]{ "slug": slug.current, enabled }`);
}

// Magnalia — current issue
export async function getCurrentMagnaliaIssue() {
  return sanityClient.fetch(`*[_type == "magnaliaIssue" && current == true][0]{
    _id,
    issueNumber,
    title,
    "coverImage": coverImage.asset->url,
    publishDate,
    pageCount,
    whatYoullFind,
    tableOfContents,
    editorsNote,
    sampleArticle{
      title,
      author,
      body[]{
        ...,
        _type == "image" => { "url": asset->url }
      }
    },
    contributors[]{
      name,
      "photo": photo.asset->url,
      bio,
      credentials,
      contribution
    },
    pullQuote,
    endorsements
  }`);
}

export async function getAllMagnaliaIssues() {
  return sanityClient.fetch(`*[_type == "magnaliaIssue"] | order(issueNumber desc) {
    _id,
    issueNumber,
    title,
    "coverImage": coverImage.asset->url,
    publishDate,
    current
  }`);
}

// Giving Tiers
export async function getGivingTiers() {
  return sanityClient.fetch(`*[_type == "givingTier"] | order(order asc) {
    _id,
    name,
    monthlyPrice,
    annualPrice,
    description,
    benefits,
    featured,
    ctaText,
    ctaHref
  }`);
}

// Career Postings
export async function getActiveCareerPostings() {
  return sanityClient.fetch(`*[_type == "careerPosting" && active == true && enabled != false] | order(deadline asc) {
    _id,
    title,
    slug,
    type,
    location,
    compensation,
    deadline,
    startDate,
    summary,
    description,
    externalPdfUrl,
    "detailsPdfUrl": detailsPdf.asset->url,
    contactEmail
  }`);
}

export async function getCareerPosting(slug: string) {
  return sanityClient.fetch(`*[_type == "careerPosting" && slug.current == $slug][0]{
    ...,
    "detailsPdfUrl": detailsPdf.asset->url
  }`, { slug });
}

// Book Studies
export async function getBookStudies(year?: number) {
  const filter = year ? `&& year == ${year}` : '';
  return sanityClient.fetch(`*[_type == "bookStudy" ${filter}] | order(order asc, year asc) {
    _id,
    title,
    author,
    description,
    month,
    year,
    status,
    eventPage,
    studyGuideUrl,
    "coverImage": coverImage.asset->url,
    order
  }`);
}

// Reading Groups
export async function getReadingGroups() {
  return sanityClient.fetch(`*[_type == "readingGroup" && active == true] | order(province asc, city asc) {
    _id,
    province,
    city,
    groups,
    active
  }`);
}
