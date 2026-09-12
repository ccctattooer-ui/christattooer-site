// schema.org LocalBusiness record, built from site.json so the admin stays the one place to edit the
// shop details. Rendered as JSON-LD in the <head>: this is what tells Google the site belongs to a
// tattoo shop in Vancouver WA, which is how "tattoo shop near me" searches find it.
// Anything left blank in Site settings is left out rather than guessed — wrong hours or a wrong
// postcode here would show up in Google, so an empty field is always safer than a made-up one.
import fs from "node:fs";

export default function () {
  const site = JSON.parse(fs.readFileSync("src/_data/site.json", "utf8"));
  const base = (site.domain || "").replace(/\/$/, "");
  const shop = site.shop || {};
  const sameAs = [
    site.instagram && `https://instagram.com/${site.instagram}`,
    site.youtube?.handle && `https://www.youtube.com/@${site.youtube.handle}`,
    site.twitch && `https://www.twitch.tv/${site.twitch}`,
  ].filter(Boolean);

  const address = {
    "@type": "PostalAddress",
    ...(shop.street ? { streetAddress: shop.street } : {}),
    ...(shop.locality ? { addressLocality: shop.locality } : {}),
    ...(shop.region ? { addressRegion: shop.region } : {}),
    ...(shop.postalCode ? { postalCode: shop.postalCode } : {}),
    addressCountry: "US",
  };

  return {
    "@context": "https://schema.org",
    "@type": "TattooParlor",
    name: `${site.name} — tattooing at ${shop.name}`,
    description: site.tagline,
    ...(base ? { url: base, "@id": base + "/#shop" } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(Object.keys(address).length > 1 ? { address } : {}),
    ...(shop.mapUrl ? { hasMap: shop.mapUrl } : {}),
    ...(site.openingHours?.length ? { openingHours: site.openingHours } : {}),
    ...(site.pricing?.shopMinimum ? { priceRange: `from $${site.pricing.shopMinimum}` } : {}),
    ...(base && site.ogImage ? { image: base + site.ogImage } : {}),
    makesOffer: {
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: "Traditional tattooing", serviceType: "Tattoo" },
      ...(site.pricing?.shopMinimum ? { priceSpecification: { "@type": "PriceSpecification", minPrice: site.pricing.shopMinimum, priceCurrency: "USD" } } : {}),
    },
  };
}
