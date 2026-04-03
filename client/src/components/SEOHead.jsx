import React from "react";
import { Helmet } from "react-helmet-async";

/**
 * SEOHead — Per-page SEO meta tags using react-helmet-async.
 * Handles <title>, <meta description>, Open Graph, and JSON-LD.
 *
 * @param {string} title — Page title
 * @param {string} description — Meta description (max ~160 chars)
 * @param {string} url — Canonical URL
 * @param {string} image — OG image URL
 * @param {string} type — OG type (default: "website")
 * @param {object} jsonLd — Optional JSON-LD structured data
 */
export default function SEOHead({
  title,
  description,
  url,
  image = "/images/places/krishna_janmabhoomi.avif",
  type = "website",
  jsonLd,
}) {
  const fullTitle = title ? `${title} | BrajYatra.AI` : "BrajYatra.AI — Sacred Braj Travel Planner";
  const defaultDesc = "Plan your sacred pilgrimage through Mathura, Vrindavan, Agra, Govardhan, Barsana & Gokul with AI-powered trip planning.";
  const desc = description || defaultDesc;
  const siteUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={siteUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="BrajYatra.AI" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
