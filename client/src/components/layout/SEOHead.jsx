import { Helmet } from "react-helmet-async";

const DEFAULTS = {
  siteName: "StoryTub",
  titleSuffix: " - StoryTub",
  description:
    "Create viral short videos automatically with AI. Generate scripts, voiceovers, and captions in French and English.",
  image: "/og-image.png",
  type: "website",
  twitterCard: "summary_large_image",
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : "https://storytub.com",
};

export default function SEOHead({
  title,
  description = DEFAULTS.description,
  image = DEFAULTS.image,
  type = DEFAULTS.type,
  url,
  noindex = false,
  canonical,
  structuredData,
  children,
}) {
  const fullTitle = title
    ? `${title}${DEFAULTS.titleSuffix}`
    : `StoryTub - AI Video Generator`;
  const pageUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");
  const imageUrl = image.startsWith("http") ? image : `${DEFAULTS.url}${image}`;
  const canonicalUrl = canonical || pageUrl;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={DEFAULTS.siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      {pageUrl && <meta property="og:url" content={pageUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content={DEFAULTS.twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {children}
    </Helmet>
  );
}
