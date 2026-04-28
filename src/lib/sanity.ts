import { sanityClient } from 'sanity:client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Image URL builder
const builder = imageUrlBuilder(sanityClient);
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
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
    videoUrl,
    videoCaption
  }`);
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
  return sanityClient.fetch(`*[_type == "libraryItem"] | order(publishDate desc) {
    _id,
    title,
    slug,
    category,
    publishDate,
    author,
    excerpt,
    "image": image.asset->url
  }`);
}

export async function getLibraryArticle(slug: string) {
  return sanityClient.fetch(`*[_type == "libraryItem" && slug.current == $slug][0]{
    ...,
    "image": image.asset->url,
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
    registrationUrl
  }`);
}

export async function getProgram(slug: string) {
  return sanityClient.fetch(`*[_type == "program" && slug.current == $slug][0]{
    ...,
    "headerImage": headerImage.asset->url,
    testimonials
  }`, { slug });
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
  return sanityClient.fetch(`*[_type == "careerPosting" && active == true] | order(deadline asc) {
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
