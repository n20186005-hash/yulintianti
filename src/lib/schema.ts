import { SITE } from '../data/site.js';

const abs = (path: string) => new URL(path, SITE.url).href;

export function breadcrumb(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.href),
    })),
  };
}

export function organization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    logo: abs('/logo.svg'),
  };
}

export function website() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.fullName,
    url: SITE.url,
    inLanguage: SITE.lang,
  };
}

export function touristAttraction(opts: {
  name: string;
  description: string;
  image: string;
  lat: number;
  lng: number;
  address?: string;
  url: string;
  alternateName?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    // 知識圖譜錨點：讓搜尋引擎將本頁綁定為該地理實體
    '@id': abs(opts.url) + '#attraction',
    name: opts.name,
    alternateName: opts.alternateName?.length
      ? opts.alternateName
      : [opts.name, `${SITE.regionName} ${opts.name}`],
    description: opts.description,
    url: abs(opts.url),
    image: [abs(opts.image)],
    isAccessibleForFree: true,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: opts.lat,
      longitude: opts.lng,
    },
    hasMap: SITE.mapsUrl,
    address: opts.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: opts.address,
          addressLocality: SITE.regionName,
          addressRegion: SITE.countryName,
          postalCode: SITE.postalCode,
          addressCountry: SITE.countryCode,
        }
      : undefined,
    sameAs: [SITE.mapsUrl, SITE.govtTourismUrl].filter(Boolean),
  };
}

export function touristDestination(opts: {
  name: string;
  description: string;
  image: string;
  url: string;
  includes: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: opts.name,
    description: opts.description,
    image: abs(opts.image),
    url: abs(opts.url),
    touristType: ['親子', '情侶', '攝影', '單車'],
    includesAttraction: opts.includes.map((n) => ({
      '@type': 'TouristAttraction',
      name: n,
    })),
  };
}

export function touristTrip(opts: {
  name: string;
  description: string;
  url: string;
  stops: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: opts.name,
    description: opts.description,
    url: abs(opts.url),
    itinerary: {
      '@type': 'ItemList',
      itemListElement: opts.stops.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: s,
      })),
    },
  };
}

export function article(opts: {
  headline: string;
  description: string;
  image: string;
  url: string;
  author: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    image: abs(opts.image),
    mainEntityOfPage: abs(opts.url),
    author: { '@type': 'Person', name: opts.author },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: { '@type': 'ImageObject', url: abs('/logo.svg') },
    },
  };
}

export function faqPage(qa: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa.map((x) => ({
      '@type': 'Question',
      name: x.q,
      acceptedAnswer: { '@type': 'Answer', text: x.a },
    })),
  };
}
