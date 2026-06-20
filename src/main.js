import { BASE_PACKAGES, ADD_ONS, calculateTotals, money } from "./pricing.js";
import "./styles.css";

const app = document.querySelector("#app");

function route() {
  const path = window.location.pathname;
  if (path.startsWith("/preview/")) return renderPreview(path.split("/").pop());
  if (path.startsWith("/addons/")) return renderAddons(path.split("/").pop());
  if (path.startsWith("/contract/")) return renderContract(path.split("/").pop());
  if (path.startsWith("/payment/")) return renderPayment(path.split("/").pop());
  if (path.startsWith("/success")) return renderSuccess();
  return renderHome();
}

window.addEventListener("popstate", route);

function go(path) {
  history.pushState({}, "", path);
  route();
}

async function loadClient(slug) {
  try {
    const res = await fetch(`/clients/${slug}.json`, { cache: "no-store" });
    if (!res.ok) throw new Error("Client config not found");
    return await res.json();
  } catch {
    const res = await fetch(`/clients/demo-medspa.json`, { cache: "no-store" });
    return await res.json();
  }
}

function renderHome() {
  app.innerHTML = `
    <main class="home">
      <div class="home-card">
        <div class="brand-pill">OneVibeMedia Contract Funnel</div>
        <h1>Website preview → add-ons → contract → deposit.</h1>
        <p>This starter is running. Open a demo preview below.</p>
        <div class="home-actions">
          <a href="/preview/demo-medspa" data-link class="btn primary">Open Med Spa Demo</a>
          <a href="/preview/ats-demo" data-link class="btn ghost">Open ATS Demo</a>
        </div>
      </div>
    </main>`;
  wireLinks();
}

function wireLinks() {
  document.querySelectorAll("[data-link]").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      go(a.getAttribute("href"));
    });
  });
}

async function renderPreview(slug) {
  const client = await loadClient(slug);
  const color = client.primaryColor || "#144D83";
  const accent = client.accentColor || "#16d1b0";

  app.innerHTML = `
    <main class="preview" style="--client:${color};--accent:${accent}">
      <header class="site-nav">
        <div class="demo-logo">${client.logoText || client.businessName}</div>
        <div class="demo-meta">${client.industry || ""} · ${client.location || ""}</div>
      </header>

      <section class="hero">
        <div>
          <div class="eyebrow">Custom Website Preview</div>
          <h1>${escapeHtml(client.heroTitle)}</h1>
          <p>${escapeHtml(client.heroSubtitle)}</p>
          <div class="hero-actions">
            <button class="btn primary" id="jumpWork">View Direction</button>
            <button class="btn ghost" id="jumpSwipe">Start Project</button>
          </div>
        </div>
        <div class="hero-card">
          <span>Suggested Package</span>
          <strong>${BASE_PACKAGES[client.recommendedPackage]?.name || "Brand Platform"}</strong>
          <small>Website foundation + conversion strategy + optional launch assets.</small>
        </div>
      </section>

      <section class="preview-grid" id="work">
        ${(client.sections || []).map(s => `
          <article class="preview-card">
            <span>${escapeHtml(s.eyebrow || "")}</span>
            <h2>${escapeHtml(s.title || "")}</h2>
            <p>${escapeHtml(s.body || "")}</p>
          </article>
        `).join("")}
      </section>

      <section class="mock-site-block">
        <div class="mock-browser">
          <div class="mock-dots"><i></i><i></i><i></i></div>
          <div class="mock-content">
            <h2>${escapeHtml(client.businessName)}</h2>
            <p>${escapeHtml(client.testimonial || "A cleaner online presence built to generate trust and action.")}</p>
            <div class="mock-services">
              <div>Premium Offer</div><div>Proof</div><div>CTA</div>
            </div>
          </div>
        </div>
      </section>

      <div class="swipe-wrap" id="swipeWrap">
        <div class="swipe-track" id="swipeTrack">
          <div class="swipe-knob" id="swipeKnob">→</div>
          <span>Slide to build this for my business</span>
        </div>
      </div>
    </main>
  `;

  document.querySelector("#jumpWork").onclick = () => document.querySelector("#work").scrollIntoView({ behavior: "smooth" });
  document.querySelector("#jumpSwipe").onclick = () => document.querySelector("#swipeWrap").scrollIntoView({ behavior: "smooth", block: "center" });
  setupSwipe(() => go(`/addons/${client.slug || slug}`));
}

function setupSwipe(onComplete) {
  const track = document.querySelector("#swipeTrack");
  const knob = document.querySelector("#swipeKnob");
  let dragging = false;
  let startX = 0;
  let current = 0;
  const max = () => track.clientWidth - knob.clientWidth - 8;

  function setX(x) {
    current = Math.max(0, Math.min(x, max()));
    knob.style.transform = `translateX(${current}px)`;
    track.style.setProperty("--progress", `${current / max()}`);
  }

  function done() {
    dragging = false;
    if (current > max() * 0.74) {
      setX(max());
      track.classList.add("complete");
      setTimeout(onComplete, 350);
    } else {
      setX(0);
    }
  }

  knob.addEventListener("pointerdown", e => {
    dragging = true;
    startX = e.clientX - current;
    knob.setPointerCapture(e.pointerId);
  });
  knob.addEventListener("pointermove", e => {
    if (!dragging) return;
    setX(e.clientX - startX);
  });
  knob.addEventListener("pointerup", done);
  track.addEventListener("click", e => {
    if (e.target === knob) return;
    setX(max());
    track.classList.add("complete");
    setTimeout(onComplete, 250);
  });
}

async function renderAddons(slug) {
  const client = await loadClient(slug);
  const initialBase = client.recommendedPackage || "starter-site";
  const initialAddons = new Set(client.suggestedAddOns || []);

  app.innerHTML = `
    <main class="checkout-shell">
      <section class="checkout-head">
        <div class="brand-pill">Project Setup</div>
        <h1>Choose what you want included.</h1>
        <p>We’ll generate the agreement and deposit amount from the package and add-ons selected here.</p>
      </section>

      <section class="checkout-grid">
        <form id="dealForm" class="panel form-panel">
          <h2>Client Details</h2>
          <div class="field-grid">
            <label>Client Name <input name="clientName" required placeholder="Full name" /></label>
            <label>Business Name <input name="businessName" required value="${escapeAttr(client.businessName || "")}" /></label>
            <label>Email <input name="email" required type="email" placeholder="client@email.com" /></label>
            <label>Phone <input name="phone" placeholder="(555) 555-5555" /></label>
          </div>

          <h2>Base Package</h2>
          <div class="cards">
            ${Object.entries(BASE_PACKAGES).map(([id, item]) => `
              <label class="option-card">
                <input type="radio" name="basePackage" value="${id}" ${id === initialBase ? "checked" : ""} />
                <strong>${item.name}</strong>
                <span>${item.description}</span>
                <b>${money(item.price)}</b>
              </label>
            `).join("")}
          </div>

          <h2>Add-ons</h2>
          <div class="cards">
            ${Object.entries(ADD_ONS).map(([id, item]) => `
              <label class="option-card">
                <input type="checkbox" name="addOns" value="${id}" ${initialAddons.has(id) ? "checked" : ""} />
                <strong>${item.name}</strong>
                <span>${item.description}</span>
                <b>${money(item.price)}${item.type === "monthly" ? "/mo" : ""}</b>
              </label>
            `).join("")}
          </div>

          <h2>Deposit Method</h2>
          <div class="pay-methods">
            <label><input type="radio" name="paymentMethod" value="stripe" checked /> Stripe checkout / card / ACH / eligible BNPL</label>
            <label><input type="radio" name="paymentMethod" value="bank_transfer" /> Bank transfer details on screen</label>
          </div>

          <button class="btn primary wide" type="submit">Generate Agreement</button>
          <p class="fine-print">Final totals are recalculated server-side before the agreement and deposit link are created.</p>
        </form>

        <aside class="panel summary-panel">
          <h2>Project Summary</h2>
          <div id="summary"></div>
        </aside>
      </section>
    </main>
  `;

  const form = document.querySelector("#dealForm");
  const summary = document.querySelector("#summary");
  const updateSummary = () => {
    const fd = new FormData(form);
    const base = fd.get("basePackage");
    const addOns = fd.getAll("addOns");
    const totals = calculateTotals(base, addOns);
    summary.innerHTML = `
      <div class="summary-row"><span>Project Total</span><strong>${money(totals.projectTotal)}</strong></div>
      <div class="summary-row"><span>Monthly Services</span><strong>${money(totals.monthlyTotal)}/mo</strong></div>
      <div class="summary-row total"><span>Due at Signing</span><strong>${money(totals.dueAtSigning)}</strong></div>
      <div class="summary-row"><span>Remaining Project Balance</span><strong>${money(totals.remainingDue)}</strong></div>
      <p class="fine-print">Due at signing = 25% project deposit + first month of selected monthly services. Remaining project balance is due in 30 days.</p>
    `;
  };
  form.addEventListener("change", updateSummary);
  updateSummary();

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      clientSlug: client.slug || slug,
      clientName: fd.get("clientName"),
      businessName: fd.get("businessName"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      basePackage: fd.get("basePackage"),
      addOns: fd.getAll("addOns"),
      paymentMethod: fd.get("paymentMethod")
    };

    setLoading(true, "Generating agreement...");
    try {
      const res = await fetch("/.netlify/functions/submit-deal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      sessionStorage.setItem(`deal:${data.dealId}`, JSON.stringify({ ...payload, ...data }));
      go(`/contract/${data.dealId}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  });
}

function renderContract(dealId) {
  const deal = JSON.parse(sessionStorage.getItem(`deal:${dealId}`) || "{}");
  const signUrl = deal?.signwell?.signingUrl;
  app.innerHTML = `
    <main class="contract-shell">
      <section class="panel contract-panel">
        <div class="brand-pill">Agreement</div>
        <h1>Review and sign your project agreement.</h1>
        <p>Deal ID: <strong>${escapeHtml(dealId)}</strong></p>

        ${signUrl ? `
          <iframe class="sign-frame" src="${escapeAttr(signUrl)}" title="SignWell signing"></iframe>
          <p class="fine-print">After signing, continue to the deposit screen. In production, SignWell webhooks can unlock this automatically.</p>
        ` : `
          <div class="mock-contract">
            <h2>Mock Agreement Preview</h2>
            <p>This is mock mode. Once SignWell keys are connected, this area will show the SignWell embedded signing link or send the client to the live signing experience.</p>
            <div class="summary-row"><span>Project Total</span><strong>${money(deal?.totals?.projectTotal || 0)}</strong></div>
            <div class="summary-row"><span>Due at Signing</span><strong>${money(deal?.totals?.dueAtSigning || 0)}</strong></div>
            <label class="mock-checkbox"><input type="checkbox" id="mockSigned" /> I have reviewed and signed the mock agreement.</label>
          </div>
        `}

        <button class="btn primary wide" id="continuePayment">Continue to Deposit</button>
      </section>
    </main>
  `;
  document.querySelector("#continuePayment").onclick = () => {
    const cb = document.querySelector("#mockSigned");
    if (cb && !cb.checked) return alert("Check the mock agreement box first.");
    go(`/payment/${dealId}`);
  };
}

function renderPayment(dealId) {
  const deal = JSON.parse(sessionStorage.getItem(`deal:${dealId}`) || "{}");
  app.innerHTML = `
    <main class="contract-shell">
      <section class="panel contract-panel">
        <div class="brand-pill">Deposit</div>
        <h1>Pay the deposit to start the project.</h1>
        <div class="summary-row total"><span>Due Now</span><strong>${money(deal?.totals?.dueAtSigning || 0)}</strong></div>
        <div class="summary-row"><span>Remaining Due in 30 Days</span><strong>${money(deal?.totals?.remainingDue || 0)}</strong></div>

        <div class="payment-choice">
          <button class="btn primary wide" id="payStripe">Pay with Stripe</button>
          <button class="btn ghost wide" id="showBank">Show Bank Transfer Details</button>
        </div>
        <div id="bankBox" class="bank-box hidden"></div>
      </section>
    </main>
  `;

  document.querySelector("#payStripe").onclick = async () => {
    setLoading(true, "Creating secure checkout...");
    try {
      const res = await fetch("/.netlify/functions/create-checkout-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dealId,
          clientSlug: deal.clientSlug,
          clientName: deal.clientName,
          businessName: deal.businessName,
          email: deal.email,
          basePackage: deal.basePackage,
          addOns: deal.addOns
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create checkout");
      window.location.href = data.url;
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  document.querySelector("#showBank").onclick = async () => {
    const res = await fetch("/.netlify/functions/bank-transfer-intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ dealId, ...deal })
    });
    const data = await res.json();
    document.querySelector("#bankBox").classList.remove("hidden");
    document.querySelector("#bankBox").innerHTML = `
      <h2>Bank Transfer Details</h2>
      <p><strong>Status:</strong> Pending until funds clear.</p>
      <p><strong>Account Name:</strong> ${escapeHtml(data.bank.accountName || "")}</p>
      <p><strong>Bank:</strong> ${escapeHtml(data.bank.bankName || "")}</p>
      <p><strong>Routing:</strong> ${escapeHtml(data.bank.routingNumber || "")}</p>
      <p><strong>Account:</strong> ${escapeHtml(data.bank.accountNumber || "")}</p>
      <p><strong>Memo:</strong> ${escapeHtml(data.bank.memo || "")}</p>
      <p class="fine-print">Project begins after the agreement is signed and the deposit is received/cleared.</p>
    `;
  };
}

function renderSuccess() {
  app.innerHTML = `
    <main class="contract-shell">
      <section class="panel contract-panel success">
        <div class="brand-pill">Success</div>
        <h1>Deposit step complete.</h1>
        <p>Your onboarding form will be emailed so it can be completed at your own pace.</p>
        <a href="/preview/demo-medspa" data-link class="btn ghost">Back to Demo</a>
      </section>
    </main>
  `;
  wireLinks();
}

function setLoading(isLoading, text = "Loading...") {
  let el = document.querySelector("#loadingOverlay");
  if (!el) {
    el = document.createElement("div");
    el.id = "loadingOverlay";
    el.className = "loading-overlay";
    document.body.appendChild(el);
  }
  el.innerHTML = `<div>${text}</div>`;
  el.style.display = isLoading ? "grid" : "none";
}

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[s]));
}

function escapeAttr(str = "") {
  return escapeHtml(str).replace(/`/g, "&#096;");
}

route();
