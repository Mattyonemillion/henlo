import { Metadata } from 'next'

/**
 * Default metadata values for the application
 */
const defaultMetadata = {
  siteName: 'Henlo',
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://henlo.nl',
  locale: 'nl_NL',
  twitterHandle: '@henlo',
}

/**
 * Generate metadata for listing detail pages
 */
export function generateListingMetadata({
  title,
  description,
  price,
  images,
  category,
  location,
}: {
  title: string
  description: string
  price: number
  images?: string[]
  category?: string
  location?: string
}): Metadata {
  const fullTitle = `${title} - €${price.toFixed(2)} | ${defaultMetadata.siteName}`
  const metaDescription = description.slice(0, 160)
  const imageUrl = images && images.length > 0 ? images[0] : undefined

  return {
    title: fullTitle,
    description: metaDescription,
    keywords: [
      'tweedehands',
      title,
      category,
      location,
      'kopen',
      'verkopen',
    ].filter(Boolean) as string[],
    openGraph: {
      title: fullTitle,
      description: metaDescription,
      type: 'website',
      locale: defaultMetadata.locale,
      siteName: defaultMetadata.siteName,
      images: imageUrl ? [{ url: imageUrl, alt: title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: metaDescription,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}

/**
 * Generate metadata for category pages
 */
export function generateCategoryMetadata({
  name,
  description,
  slug,
}: {
  name: string
  description?: string
  slug: string
}): Metadata {
  const fullTitle = `${name} | ${defaultMetadata.siteName}`
  const metaDescription =
    description || `Ontdek tweedehands ${name.toLowerCase()} op ${defaultMetadata.siteName}`

  return {
    title: fullTitle,
    description: metaDescription,
    keywords: ['tweedehands', name, 'kopen', 'verkopen', 'marktplaats'],
    openGraph: {
      title: fullTitle,
      description: metaDescription,
      type: 'website',
      locale: defaultMetadata.locale,
      url: `${defaultMetadata.siteUrl}/categorieen/${slug}`,
    },
  }
}

/**
 * Generate metadata for user profile pages
 */
export function generateUserProfileMetadata({
  fullName,
  bio,
  listingsCount,
}: {
  fullName: string
  bio?: string
  listingsCount?: number
}): Metadata {
  const fullTitle = `${fullName} | ${defaultMetadata.siteName}`
  const metaDescription =
    bio ||
    `Bekijk het profiel van ${fullName} op ${defaultMetadata.siteName}${
      listingsCount ? `. ${listingsCount} advertenties` : ''
    }`

  return {
    title: fullTitle,
    description: metaDescription.slice(0, 160),
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: fullTitle,
      description: metaDescription,
      type: 'profile',
      locale: defaultMetadata.locale,
    },
  }
}

/**
 * Generate metadata for dashboard pages
 */
export function generateDashboardMetadata(pageName: string): Metadata {
  return {
    title: `${pageName} | Dashboard`,
    description: `Beheer je ${pageName.toLowerCase()} op ${defaultMetadata.siteName}`,
    robots: {
      index: false,
      follow: false,
    },
  }
}
