export const BASE_PACKAGES = {
  "starter-site": { name: "Starter Site", price: 1199, type: "one_time" },
  "growth-site": { name: "Growth Site", price: 2499, type: "one_time" },
  "brand-platform": { name: "Brand Platform", price: 4999, type: "one_time" },
  "enterprise-site": { name: "Enterprise Site", price: 9999, type: "one_time" }
};

export const ADD_ONS = {
  "conversion-funnel": { name: "Conversion Funnel Build", price: 500, type: "one_time" },
  "launch-content": { name: "Launch Content Bundle", price: 1500, type: "one_time" },
  "campaign-content": { name: "Campaign Content Bundle", price: 3000, type: "one_time" },
  "content-library": { name: "Full Content Library", price: 5500, type: "one_time" },
  "brand-direction": { name: "Brand Direction Sprint", price: 1500, type: "one_time" },
  "video-production": { name: "Video Production", price: 4800, type: "one_time" },
  "3d-visuals": { name: "3D Visuals / Animation", price: 2500, type: "one_time" },
  "seo-foundation": { name: "SEO Foundation", price: 1500, type: "monthly" },
  "facebook-ad-management": { name: "Facebook Ad Management", price: 500, type: "monthly" },
  "local-lead-engine": { name: "Local Lead Engine", price: 2500, type: "monthly" }
};

export function calculateTotals(basePackageId, addOnIds = []) {
  const base = BASE_PACKAGES[basePackageId] || BASE_PACKAGES["starter-site"];
  const selectedAddOns = [...new Set(addOnIds)].map(id => ADD_ONS[id]).filter(Boolean);

  const oneTimeAddOns = selectedAddOns.filter(a => a.type === "one_time");
  const monthlyAddOns = selectedAddOns.filter(a => a.type === "monthly");

  const projectTotal = base.price + oneTimeAddOns.reduce((sum, item) => sum + item.price, 0);
  const monthlyTotal = monthlyAddOns.reduce((sum, item) => sum + item.price, 0);

  const projectDeposit = Math.round(projectTotal * 0.25);
  const dueAtSigning = projectDeposit + monthlyTotal;
  const remainingDue = projectTotal - projectDeposit;

  return {
    basePackageId,
    basePackageName: base.name,
    addOnIds: [...new Set(addOnIds)].filter(id => ADD_ONS[id]),
    addOnNames: selectedAddOns.map(a => a.name),
    oneTimeAddOnNames: oneTimeAddOns.map(a => a.name),
    monthlyAddOnNames: monthlyAddOns.map(a => a.name),
    projectTotal,
    monthlyTotal,
    projectDeposit,
    dueAtSigning,
    remainingDue
  };
}

export function dollarsToCents(amount) {
  return Math.round(Number(amount || 0) * 100);
}

export function formatMoney(amount) {
  return Number(amount || 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function dueDate(days = 30) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function makeDealId() {
  const date = new Date().toISOString().slice(0,10).replaceAll("-", "");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `OVM-${date}-${rand}`;
}
