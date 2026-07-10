import { sanityClient } from 'sanity:client';
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Image URL builder
const builder = imageUrlBuilder(sanityClient);
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/**
 * Generate an image URL that respects Sanity hotspot/crop data.
 * Falls back to raw URL if hotspot data isn't available.
 */
export function imageUrl(image: any, width?: number, height?: number): string {
  if (!image) return '';
  // If it's already a plain URL string (backward compat), return as-is
  if (typeof image === 'string') return image;
  // If we have the asset reference, use the URL builder
  if (image.asset) {
    let builder = urlFor(image);
    if (width) builder = builder.width(width);
    if (height) builder = builder.height(height);
    return builder.fit('crop').auto('format').url();
  }
  return image.asset?.url || '';
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
    endorsements[]{
      quote,
      name,
      title
    },
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
  return sanityClient.fetch(`*[_type == "event" && date >= $today] | order(date asc) [0...$limit]{
    _id,
    title,
    slug,
    "startDate": date,
    location,
    "shortDescription": description,
    tagline,
    programTag,
    template,
    "headerImage": headerImage{asset->{url, _id}, hotspot, crop}
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
    "author": author->name,
    excerpt,
    "image": featuredImage.asset->url
  }`, { limit });
}

// Events
export async function getEvents(status?: string) {
  const filter = status ? `&& status == "${status}"` : '';
  return sanityClient.fetch(`*[_type == "event" ${filter}] | order(date asc) {
    _id,
    title,
    slug,
    template,
    programTag,
    status,
    "startDate": date,
    endDate,
    location,
    "headerImage": headerImage{asset->{url, _id}, hotspot, crop},
    "shortDescription": description,
    tagline,
    registrationUrl,
    cost,
    capacity
  }`);
}

export async function getEvent(slug: string) {
  return sanityClient.fetch(`*[_type == "event" && slug.current == $slug][0]{
    ...,
    "startDate": date,
    "shortDescription": description,
    "headerImage": headerImage{asset->{url, _id}, hotspot, crop},
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
    "image": featuredImage{asset->{url, _id}, hotspot, crop}
  }`);
}

export async function getLibraryArticle(slug: string) {
  return sanityClient.fetch(`*[_type == "libraryItem" && slug.current == $slug][0]{
    ...,
    "image": featuredImage{asset->{url, _id}, hotspot, crop},
    "authorName": author->name,
    "authorImage": author->photo.asset->url,
    "downloadFile": downloadFile{asset->{url}},
    featuredImage { asset-> },
    body[]{
      ...,
      _type == "image" => { "url": asset->url }
    }
  }`, { slug });
}

// Magnalia Contributors
export async function getMagnaliaContributors() {
  return sanityClient.fetch(`*[_type == "person" && published == true && magnaliaContributor == true] | order(magnaliaOrder asc, order asc, name asc) {
    _id,
    name,
    role,
    shortBio,
    contributorBio,
    credentials,
    "photo": photo.asset->url
  }`);
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
    "shortDescription": description,
    "headerImage": headerImage{asset->{url, _id}, hotspot, crop},
    dates,
    location,
    cost,
    registrationUrl,
    enabled
  }`);
}

// Programs Overview (singleton — powers /programs/ index page)
export async function getProgramsOverview() {
  return sanityClient.fetch(`*[_type == "programsOverview"][0]{
    "heroImage": heroImage.asset->url,
    heroHeadline,
    heroQuote,
    heroAttribution,
    cards[]{
      title,
      label,
      "thumbnail": thumbnail.asset->url,
      thumbnailAlt,
      artFilter,
      imagePosition,
      description,
      details[]{ key, value },
      ctaText,
      ctaLink,
      enabled
    },
    footerMessage,
    footerLinkText,
    footerLinkUrl
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
    "headerImage": headerImage{asset->{url, _id}, hotspot, crop},
    testimonials,
    highlights,
    schedule,
    whoItsFor,
    introLabel,
    introHeading,
    introText,
    introDetails[]{ title, subtitle },
    readingListLabel,
    readingListHeading,
    readings[]{ author, work },
    readingListNote,
    scheduleLabel,
    scheduleHeading,
    audienceLabel,
    audienceHeading,
    audienceCards[]{ title, description },
    formLabel,
    formHeading,
    formSubtitle,
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

// Lead Magnets
export async function getLeadMagnets() {
  return sanityClient.fetch(`*[_type == "leadMagnet" && enabled == true] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    seoDescription,
    heroLabel,
    heroTitle,
    heroSubtitle,
    introText,
    benefits,
    "mockupImageUrl": mockupImage.asset->url,
    "downloadFileUrl": downloadFile.asset->url,
    formTitle,
    formDescription,
    formButtonText,
    acTagName,
    insideTitle,
    insideDescription,
    insideItems,
    ctaTitle,
    ctaText,
    thankYouTitle,
    thankYouMessage,
    thankYouNextSteps,
    thankYouCtaText,
    thankYouCtaUrl
  }`);
}

// Media Page (singleton)
export async function getMediaPage() {
  return sanityClient.fetch(`*[_type == "mediaPage"][0]{
    "heroImage": heroImage.asset->url,
    heroTitle,
    heroSubtitle,
    featuredVideoUrl,
    featuredVideoTitle,
    featuredVideoDescription,
    featuredVideoMeta,
    videosLabel,
    videosHeading,
    videosVisibleCount,
    videos[]{ youtubeUrl, title, meta },
    videosNote,
    outletsLabel,
    outletsHeading,
    outlets[]{ name, url },
    booksLabel,
    booksHeading,
    booksVisibleCount,
    books[]{ title, subtitle, url, note },
    booksTotalCount,
    booksCountNote,
    pressKitLabel,
    pressKitHeading,
    pressKitBoilerplateTitle,
    pressKitBoilerplate,
    keyFacts[]{ label, value, url },
    downloads[]{ name, meta, "fileUrl": file.asset->url, externalUrl },
    brandColors[]{ name, hex, light },
    "speakerPhoto": speakerPhoto.asset->url,
    speakingLabel,
    speakingHeading,
    speakingDescription,
    speakingTopics,
    speakingButtonText,
    speakingButtonUrl,
    speakingEmail
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
