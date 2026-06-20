export const BASE_PACKAGES = {
  "starter-site": {
    name: "Starter Site",
    description: "One-page mobile-first website with positioning, proof, CTA, and basic SEO.",
    price: 1199,
    type: "one_time"
  },
  "growth-site": {
    name: "Growth Site",
    description: "Three-page website structure built for proof, services, and lead capture.",
    price: 2499,
    type: "one_time"
  },
  "brand-platform": {
    name: "Brand Platform",
    description: "Five-page premium website with stronger brand story, services, CTAs, and campaign-ready structure.",
    price: 4999,
    type: "one_time"
  },
  "enterprise-site": {
    name: "Enterprise Site",
    description: "Ten-page scalable website for multi-service, multi-location, or campaign-heavy businesses.",
    price: 9999,
    type: "one_time"
  }
};

export const ADD_ONS = {
  "conversion-funnel": {
    name: "Conversion Funnel Build",
    description: "Direct-response one-pager or landing section with clear offer, pricing path, form, booking, QR, or purchase CTA.",
    price: 500,
    type: "one_time"
  },
  "launch-content": {
    name: "Launch Content Bundle",
    description: "10–15 graphics, short-form clips, ad creatives, product photos, and reusable launch assets.",
    price: 1500,
    type: "one_time"
  },
  "campaign-content": {
    name: "Campaign Content Bundle",
    description: "20–30 reels, TikToks, product shots, motion graphics, and campaign assets.",
    price: 3000,
    type: "one_time"
  },
  "content-library": {
    name: "Full Content Library",
    description: "40–55 assets: event coverage, studio shoots, drone footage, reels, graphics, and ad creative library.",
    price: 5500,
    type: "one_time"
  },
  "brand-direction": {
    name: "Brand Direction Sprint",
    description: "Messaging, positioning, visual direction, offer framing, website voice, and launch angle.",
    price: 1500,
    type: "one_time"
  },
  "video-production": {
    name: "Video Production",
    description: "Story-driven shoot or production package for launches, testimonials, or signature brand content.",
    price: 4800,
    type: "one_time"
  },
  "3d-visuals": {
    name: "3D Visuals / Animation",
    description: "Product renders, 3D hero visuals, loops, premium creative, or launch visuals.",
    price: 2500,
    type: "one_time"
  },
  "seo-foundation": {
    name: "SEO Foundation",
    description: "Local search foundation, page optimization, keyword targeting, and monthly reporting.",
    price: 1500,
    type: "monthly"
  },
  "facebook-ad-management": {
    name: "Facebook Ad Management",
    description: "Campaign setup, audience targeting, monitoring, optimization, and monthly reporting.",
    price: 500,
    type: "monthly"
  },
  "local-lead-engine": {
    name: "Local Lead Engine",
    description: "SEO + Facebook ad management + funnel strategy for local service businesses. Ad spend separate.",
    price: 2500,
    type: "monthly"
  }
};

export function money(centsOrDollars) {
  const dollars = Number(centsOrDollars || 0);
  return dollars.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function calculateTotals(basePackageId, addOnIds = []) {
  const base = BASE_PACKAGES[basePackageId] || BASE_PACKAGES["starter-site"];
  const selectedAddOns = addOnIds.map(id => ADD_ONS[id]).filter(Boolean);

  const oneTimeAddOns = selectedAddOns.filter(a => a.type === "one_time");
  const monthlyAddOns = selectedAddOns.filter(a => a.type === "monthly");

  const projectTotal = base.price + oneTimeAddOns.reduce((sum, item) => sum + item.price, 0);
  const monthlyTotal = monthlyAddOns.reduce((sum, item) => sum + item.price, 0);

  const projectDeposit = Math.round(projectTotal * 0.25);
  const dueAtSigning = projectDeposit + monthlyTotal;
  const remainingDue = projectTotal - projectDeposit;

  return {
    base,
    selectedAddOns,
    oneTimeAddOns,
    monthlyAddOns,
    projectTotal,
    monthlyTotal,
    projectDeposit,
    dueAtSigning,
    remainingDue
  };
}
