(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&o(r)}).observe(document,{childList:!0,subtree:!0});function s(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(n){if(n.ep)return;n.ep=!0;const i=s(n);fetch(n.href,i)}})();const v={"starter-site":{name:"Starter Site",description:"One-page mobile-first website with positioning, proof, CTA, and basic SEO.",price:1199,type:"one_time"},"growth-site":{name:"Growth Site",description:"Three-page website structure built for proof, services, and lead capture.",price:2499,type:"one_time"},"brand-platform":{name:"Brand Platform",description:"Five-page premium website with stronger brand story, services, CTAs, and campaign-ready structure.",price:4999,type:"one_time"},"enterprise-site":{name:"Enterprise Site",description:"Ten-page scalable website for multi-service, multi-location, or campaign-heavy businesses.",price:9999,type:"one_time"}},S={"conversion-funnel":{name:"Conversion Funnel Build",description:"Direct-response one-pager or landing section with clear offer, pricing path, form, booking, QR, or purchase CTA.",price:500,type:"one_time"},"launch-content":{name:"Launch Content Bundle",description:"10–15 graphics, short-form clips, ad creatives, product photos, and reusable launch assets.",price:1500,type:"one_time"},"campaign-content":{name:"Campaign Content Bundle",description:"20–30 reels, TikToks, product shots, motion graphics, and campaign assets.",price:3e3,type:"one_time"},"content-library":{name:"Full Content Library",description:"40–55 assets: event coverage, studio shoots, drone footage, reels, graphics, and ad creative library.",price:5500,type:"one_time"},"brand-direction":{name:"Brand Direction Sprint",description:"Messaging, positioning, visual direction, offer framing, website voice, and launch angle.",price:1500,type:"one_time"},"video-production":{name:"Video Production",description:"Story-driven shoot or production package for launches, testimonials, or signature brand content.",price:4800,type:"one_time"},"3d-visuals":{name:"3D Visuals / Animation",description:"Product renders, 3D hero visuals, loops, premium creative, or launch visuals.",price:2500,type:"one_time"},"seo-foundation":{name:"SEO Foundation",description:"Local search foundation, page optimization, keyword targeting, and monthly reporting.",price:1500,type:"monthly"},"facebook-ad-management":{name:"Facebook Ad Management",description:"Campaign setup, audience targeting, monitoring, optimization, and monthly reporting.",price:500,type:"monthly"},"local-lead-engine":{name:"Local Lead Engine",description:"SEO + Facebook ad management + funnel strategy for local service businesses. Ad spend separate.",price:2500,type:"monthly"}};function u(t){return Number(t||0).toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0})}function T(t,e=[]){const s=v[t]||v["starter-site"],o=e.map(p=>S[p]).filter(Boolean),n=o.filter(p=>p.type==="one_time"),i=o.filter(p=>p.type==="monthly"),r=s.price+n.reduce((p,y)=>p+y.price,0),l=i.reduce((p,y)=>p+y.price,0),a=Math.round(r*.25),d=a+l,m=r-a;return{base:s,selectedAddOns:o,oneTimeAddOns:n,monthlyAddOns:i,projectTotal:r,monthlyTotal:l,projectDeposit:a,dueAtSigning:d,remainingDue:m}}const g=document.querySelector("#app"),L=[{name:"Dockbridge",url:"https://dockbridge.io",domain:"dockbridge.io",descriptor:"Clean, premium SaaS / infrastructure-style website direction.",accent:"#144D83"},{name:"InitPic",url:"https://initpic.com",domain:"initpic.com",descriptor:"Modern product-forward site with simple conversion flow.",accent:"#111827"},{name:"LilyCRM",url:"https://lilycrm.com",domain:"lilycrm.com",descriptor:"Software brand experience with a polished CRM-style interface.",accent:"#7447ff"}];function k(){const t=window.location.pathname;return t.startsWith("/preview/")?j(t.split("/").pop()):t==="/order"?w("demo-medspa"):t.startsWith("/order/")||t.startsWith("/addons/")?w(t.split("/").pop()):t.startsWith("/contract/")?A(t.split("/").pop()):t.startsWith("/payment/")?W(t.split("/").pop()):t.startsWith("/success")?C():O()}window.addEventListener("popstate",k);function b(t){history.pushState({},"",t),k()}async function $(t){try{const e=await fetch(`/clients/${t}.json`,{cache:"no-store"});if(!e.ok)throw new Error("Client config not found");return await e.json()}catch{return await(await fetch("/clients/demo-medspa.json",{cache:"no-store"})).json()}}function O(){g.innerHTML=`
    <main class="portfolio-home">
      <section class="portfolio-stage">
        <div class="portfolio-copy">
          <div class="brand-pill">OneVibeMedia Website Funnel</div>
          <h1>Can I see examples?</h1>
          <p>Swipe through actual website examples from our design portfolio. Then continue into the order details and agreement flow.</p>
        </div>

        <div class="portfolio-carousel" aria-label="Website example carousel">
          ${L.map((t,e)=>`
            <article class="portfolio-slide" style="--example-accent:${t.accent}">
              <div class="browser-frame">
                <div class="browser-top">
                  <div class="browser-dots"><i></i><i></i><i></i></div>
                  <div class="browser-url">${c(t.domain)}</div>
                </div>
                <div class="browser-preview">
                  <iframe src="${h(t.url)}" title="${h(t.name)} website preview" loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
                  <div class="iframe-fallback">
                    <strong>${c(t.name)}</strong>
                    <span>Live site preview</span>
                  </div>
                </div>
              </div>
              <div class="portfolio-meta">
                <span>Example ${e+1}</span>
                <h2>${c(t.name)}</h2>
                <p>${c(t.descriptor)}</p>
                <a href="${h(t.url)}" target="_blank" rel="noreferrer" class="btn ghost">Open Live Site</a>
              </div>
            </article>
          `).join("")}
        </div>

        <div class="portfolio-hint">
          <span>iPad-friendly swipe preview</span>
          <span>Next step: order details</span>
        </div>

        <div class="swipe-wrap home-swipe" id="swipeWrap">
          <div class="swipe-track" id="swipeTrack">
            <div class="swipe-knob" id="swipeKnob">→</div>
            <span>Slide to continue to order details</span>
          </div>
        </div>
      </section>
    </main>`,P(()=>b("/order"))}function D(){document.querySelectorAll("[data-link]").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault(),b(t.getAttribute("href"))})})}async function j(t){var n;const e=await $(t),s=e.primaryColor||"#144D83",o=e.accentColor||"#16d1b0";g.innerHTML=`
    <main class="preview" style="--client:${s};--accent:${o}">
      <header class="site-nav">
        <div class="demo-logo">${e.logoText||e.businessName}</div>
        <div class="demo-meta">${e.industry||""} · ${e.location||""}</div>
      </header>

      <section class="hero">
        <div>
          <div class="eyebrow">Custom Website Preview</div>
          <h1>${c(e.heroTitle)}</h1>
          <p>${c(e.heroSubtitle)}</p>
          <div class="hero-actions">
            <button class="btn primary" id="jumpWork">View Direction</button>
            <button class="btn ghost" id="jumpSwipe">Start Project</button>
          </div>
        </div>
        <div class="hero-card">
          <span>Suggested Package</span>
          <strong>${((n=v[e.recommendedPackage])==null?void 0:n.name)||"Brand Platform"}</strong>
          <small>Website foundation + conversion strategy + optional launch assets.</small>
        </div>
      </section>

      <section class="preview-grid" id="work">
        ${(e.sections||[]).map(i=>`
          <article class="preview-card">
            <span>${c(i.eyebrow||"")}</span>
            <h2>${c(i.title||"")}</h2>
            <p>${c(i.body||"")}</p>
          </article>
        `).join("")}
      </section>

      <section class="mock-site-block">
        <div class="mock-browser">
          <div class="mock-dots"><i></i><i></i><i></i></div>
          <div class="mock-content">
            <h2>${c(e.businessName)}</h2>
            <p>${c(e.testimonial||"A cleaner online presence built to generate trust and action.")}</p>
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
  `,document.querySelector("#jumpWork").onclick=()=>document.querySelector("#work").scrollIntoView({behavior:"smooth"}),document.querySelector("#jumpSwipe").onclick=()=>document.querySelector("#swipeWrap").scrollIntoView({behavior:"smooth",block:"center"}),P(()=>b(`/order/${e.slug||t}`))}function P(t){const e=document.querySelector("#swipeTrack"),s=document.querySelector("#swipeKnob");if(!e||!s)return;let o=!1,n=0,i=0;const r=()=>e.clientWidth-s.clientWidth-8;function l(d){i=Math.max(0,Math.min(d,r())),s.style.transform=`translateX(${i}px)`,e.style.setProperty("--progress",`${i/Math.max(r(),1)}`)}function a(){o=!1,i>r()*.74?(l(r()),e.classList.add("complete"),setTimeout(t,350)):l(0)}s.addEventListener("pointerdown",d=>{o=!0,n=d.clientX-i,s.setPointerCapture(d.pointerId)}),s.addEventListener("pointermove",d=>{o&&l(d.clientX-n)}),s.addEventListener("pointerup",a),e.addEventListener("click",d=>{d.target!==s&&(l(r()),e.classList.add("complete"),setTimeout(t,250))})}async function w(t){const e=await $(t),s=e.recommendedPackage||"starter-site",o=new Set(e.suggestedAddOns||[]);g.innerHTML=`
    <main class="checkout-shell order-shell">
      <section class="checkout-head">
        <div class="brand-pill">Order Details</div>
        <h1>Tell us what you want built.</h1>
        <p>Pick the package, add-ons, timeline, and notes. Then we’ll generate the SignWell agreement from the details below.</p>
      </section>

      <section class="checkout-grid">
        <form id="dealForm" class="panel form-panel">
          <h2>Client Details</h2>
          <div class="field-grid">
            <label>Full Name <input name="clientName" required placeholder="Full name" /></label>
            <label>Email <input name="email" required type="email" placeholder="client@email.com" /></label>
            <label>Business / Artist / Brand Name <input name="businessName" required value="${h(e.businessName||"")}" /></label>
            <label>Phone <input name="phone" placeholder="(555) 555-5555" /></label>
          </div>

          <h2>Project Details</h2>
          <div class="field-grid">
            <label>Project Type
              <select name="projectType" required>
                <option value="Custom Website">Custom Website</option>
                <option value="Website + Custom Visuals">Website + Custom Visuals</option>
                <option value="Website + PDF / EPK">Website + PDF / EPK</option>
                <option value="Website + Funnel / CRM">Website + Funnel / CRM</option>
                <option value="Full Launch Package">Full Launch Package</option>
              </select>
            </label>
            <label>Desired Timeline
              <select name="timeline" required>
                <option value="ASAP">ASAP</option>
                <option value="1-2 Weeks">1-2 Weeks</option>
                <option value="2-4 Weeks">2-4 Weeks</option>
                <option value="30+ Days">30+ Days</option>
              </select>
            </label>
            <label>Budget Range
              <select name="budgetRange" required>
                <option value="$1,000 - $2,500">$1,000 - $2,500</option>
                <option value="$2,500 - $5,000">$2,500 - $5,000</option>
                <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                <option value="$10,000+">$10,000+</option>
              </select>
            </label>
            <label>Inspiration / Existing Links <input name="inspirationLinks" placeholder="Website, Instagram, Linktree, examples, etc." /></label>
          </div>

          <label class="full-field">Notes / Special Requests
            <textarea name="notes" rows="4" placeholder="Tell us what pages, visuals, offers, forms, integrations, or anything else you want included."></textarea>
          </label>

          <h2>Base Package</h2>
          <div class="cards">
            ${Object.entries(v).map(([l,a])=>`
              <label class="option-card">
                <input type="radio" name="basePackage" value="${l}" ${l===s?"checked":""} />
                <strong>${a.name}</strong>
                <span>${a.description}</span>
                <b>${u(a.price)}</b>
              </label>
            `).join("")}
          </div>

          <h2>Add-ons</h2>
          <div class="cards">
            ${Object.entries(S).map(([l,a])=>`
              <label class="option-card">
                <input type="checkbox" name="addOns" value="${l}" ${o.has(l)?"checked":""} />
                <strong>${a.name}</strong>
                <span>${a.description}</span>
                <b>${u(a.price)}${a.type==="monthly"?"/mo":""}</b>
              </label>
            `).join("")}
          </div>

          <h2>Deposit Method</h2>
          <div class="pay-methods">
            <label><input type="radio" name="paymentMethod" value="stripe" checked /> Stripe checkout / card / ACH / eligible BNPL</label>
            <label><input type="radio" name="paymentMethod" value="bank_transfer" /> Bank transfer details on screen</label>
          </div>

          <button class="btn primary wide" type="submit">Continue to Agreement</button>
          <p class="fine-print">Final totals are recalculated server-side before the SignWell agreement and deposit link are created.</p>
        </form>

        <aside class="panel summary-panel">
          <h2>Project Summary</h2>
          <div id="summary"></div>
          <div class="mini-flow">
            <strong>Next Steps</strong>
            <span>1. Submit order details</span>
            <span>2. Sign agreement in SignWell</span>
            <span>3. Pay 25% deposit</span>
            <span>4. Complete onboarding form by email</span>
          </div>
        </aside>
      </section>
    </main>
  `;const n=document.querySelector("#dealForm"),i=document.querySelector("#summary"),r=()=>{const l=new FormData(n),a=l.get("basePackage"),d=l.getAll("addOns"),m=T(a,d);i.innerHTML=`
      <div class="summary-row"><span>Project Total</span><strong>${u(m.projectTotal)}</strong></div>
      <div class="summary-row"><span>Monthly Services</span><strong>${u(m.monthlyTotal)}/mo</strong></div>
      <div class="summary-row total"><span>Due at Signing</span><strong>${u(m.dueAtSigning)}</strong></div>
      <div class="summary-row"><span>Remaining Project Balance</span><strong>${u(m.remainingDue)}</strong></div>
      <p class="fine-print">Due at signing = 25% project deposit + first month of selected monthly services. Remaining project balance is due in 30 days.</p>
    `};n.addEventListener("change",r),r(),n.addEventListener("submit",async l=>{l.preventDefault();const a=new FormData(n),d={clientSlug:e.slug||t,clientName:a.get("clientName"),businessName:a.get("businessName"),email:a.get("email"),phone:a.get("phone"),projectType:a.get("projectType"),timeline:a.get("timeline"),budgetRange:a.get("budgetRange"),inspirationLinks:a.get("inspirationLinks"),notes:a.get("notes"),basePackage:a.get("basePackage"),addOns:a.getAll("addOns"),paymentMethod:a.get("paymentMethod")};f(!0,"Creating SignWell agreement...");try{const m=await fetch("/.netlify/functions/submit-deal",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(d)}),p=await m.json();if(!m.ok)throw new Error(p.error||"Something went wrong");sessionStorage.setItem(`deal:${p.dealId}`,JSON.stringify({...d,...p})),b(`/contract/${p.dealId}`)}catch(m){alert(m.message)}finally{f(!1)}})}function A(t){var o,n,i;const e=JSON.parse(sessionStorage.getItem(`deal:${t}`)||"{}"),s=(o=e==null?void 0:e.signwell)==null?void 0:o.signingUrl;g.innerHTML=`
    <main class="contract-shell">
      <section class="panel contract-panel">
        <div class="brand-pill">SignWell Agreement</div>
        <h1>Review and sign your project agreement.</h1>
        <p>Deal ID: <strong>${c(t)}</strong></p>

        ${s?`
          <iframe class="sign-frame" src="${h(s)}" title="SignWell signing"></iframe>
          <p class="fine-print">After signing, continue to the deposit screen. In production, SignWell webhooks can unlock this automatically.</p>
        `:`
          <div class="mock-contract">
            <h2>Mock Agreement Preview</h2>
            <p>This is mock mode. Once SignWell keys are connected, this area will show the SignWell embedded signing link or send the client to the live signing experience.</p>
            <div class="summary-row"><span>Project Type</span><strong>${c((e==null?void 0:e.projectType)||"Custom Website")}</strong></div>
            <div class="summary-row"><span>Project Total</span><strong>${u(((n=e==null?void 0:e.totals)==null?void 0:n.projectTotal)||0)}</strong></div>
            <div class="summary-row"><span>Due at Signing</span><strong>${u(((i=e==null?void 0:e.totals)==null?void 0:i.dueAtSigning)||0)}</strong></div>
            <label class="mock-checkbox"><input type="checkbox" id="mockSigned" /> I have reviewed and signed the mock agreement.</label>
          </div>
        `}

        <button class="btn primary wide" id="continuePayment">Continue to Deposit</button>
      </section>
    </main>
  `,document.querySelector("#continuePayment").onclick=()=>{const r=document.querySelector("#mockSigned");if(r&&!r.checked)return alert("Check the mock agreement box first.");b(`/payment/${t}`)}}function W(t){var s,o;const e=JSON.parse(sessionStorage.getItem(`deal:${t}`)||"{}");g.innerHTML=`
    <main class="contract-shell">
      <section class="panel contract-panel">
        <div class="brand-pill">Deposit</div>
        <h1>Pay the deposit to start the project.</h1>
        <div class="summary-row total"><span>Due Now</span><strong>${u(((s=e==null?void 0:e.totals)==null?void 0:s.dueAtSigning)||0)}</strong></div>
        <div class="summary-row"><span>Remaining Due in 30 Days</span><strong>${u(((o=e==null?void 0:e.totals)==null?void 0:o.remainingDue)||0)}</strong></div>

        <div class="payment-choice">
          <button class="btn primary wide" id="payStripe">Pay with Stripe</button>
          <button class="btn ghost wide" id="showBank">Show Bank Transfer Details</button>
        </div>
        <div id="bankBox" class="bank-box hidden"></div>
      </section>
    </main>
  `,document.querySelector("#payStripe").onclick=async()=>{f(!0,"Creating secure checkout...");try{const n=await fetch("/.netlify/functions/create-checkout-session",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({dealId:t,clientSlug:e.clientSlug,clientName:e.clientName,businessName:e.businessName,email:e.email,basePackage:e.basePackage,addOns:e.addOns})}),i=await n.json();if(!n.ok)throw new Error(i.error||"Could not create checkout");window.location.href=i.url}catch(n){alert(n.message)}finally{f(!1)}},document.querySelector("#showBank").onclick=async()=>{const i=await(await fetch("/.netlify/functions/bank-transfer-intent",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({dealId:t,...e})})).json();document.querySelector("#bankBox").classList.remove("hidden"),document.querySelector("#bankBox").innerHTML=`
      <h2>Bank Transfer Details</h2>
      <p><strong>Status:</strong> Pending until funds clear.</p>
      <p><strong>Account Name:</strong> ${c(i.bank.accountName||"")}</p>
      <p><strong>Bank:</strong> ${c(i.bank.bankName||"")}</p>
      <p><strong>Routing:</strong> ${c(i.bank.routingNumber||"")}</p>
      <p><strong>Account:</strong> ${c(i.bank.accountNumber||"")}</p>
      <p><strong>Memo:</strong> ${c(i.bank.memo||"")}</p>
      <p class="fine-print">Project begins after the agreement is signed and the deposit is received/cleared.</p>
    `}}function C(){g.innerHTML=`
    <main class="contract-shell">
      <section class="panel contract-panel success">
        <div class="brand-pill">Success</div>
        <h1>Deposit step complete.</h1>
        <p>Your onboarding form will be emailed so it can be completed at your own pace.</p>
        <a href="/" data-link class="btn ghost">Back to Examples</a>
      </section>
    </main>
  `,D()}function f(t,e="Loading..."){let s=document.querySelector("#loadingOverlay");s||(s=document.createElement("div"),s.id="loadingOverlay",s.className="loading-overlay",document.body.appendChild(s)),s.innerHTML=`<div>${e}</div>`,s.style.display=t?"grid":"none"}function c(t=""){return String(t).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[e])}function h(t=""){return c(t).replace(/`/g,"&#096;")}k();
