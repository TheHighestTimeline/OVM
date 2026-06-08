# OVM-website

Marketing site for **OneVibeMedia** &mdash; premium media & marketing systems.

Single-page static site. No build step. Deploys to Netlify in one click.

---

## Deploy in 3 steps

### 1. Create the GitHub repo

Open a terminal in this folder (`OVM-website/`) and run:

```bash
# initialize the local repo
git init
git add .
git commit -m "Initial commit"
git branch -M main

# create the remote repo and push (GitHub CLI)
gh repo create OVM-website --public --source=. --remote=origin --push
```

If you don't have GitHub CLI installed, create the repo manually at https://github.com/new (name it `OVM-website`, leave it empty &mdash; no README, no .gitignore), then:

```bash
git remote add origin https://github.com/<YOUR-USERNAME>/OVM-website.git
git push -u origin main
```

### 2. Connect to Netlify

1. Go to https://app.netlify.com/start
2. Click **"Import from Git"** &rarr; **GitHub** &rarr; select **OVM-website**
3. Leave the build settings empty (no build command, publish directory: `/`)
4. Click **"Deploy site"**

That's it. Netlify will give you a `*.netlify.app` URL. Connect your custom domain (`onevibemedia.shop`) under **Site settings &rarr; Domain management**.

### 3. (Optional) Local preview

```bash
# python 3
python -m http.server 8000

# or node
npx serve .
```

Open http://localhost:8000

---

## Editing the 3 portfolio cards

The portfolio section currently shows DockBridge, InItPic, and Lily CRM. To swap one out, open `index.html` and find the `<!-- SITE 1 -->`, `<!-- SITE 2 -->`, or `<!-- SITE 3 -->` block, then update the `href`, `url` text, `src`, `h4`, and `p`:

```html
<a class="site-card reveal" href="https://YOUR-URL.com" target="_blank" rel="noopener">
  <div class="site-frame">
    <div class="site-chrome"><span></span><span></span><span></span><div class="url">YOUR-URL.com</div></div>
    <img class="site-img" src="assets/your-site.jpg" alt="Project Name">
  </div>
  <div class="site-info">
    <div class="site-info-tag">Web Platform</div>
    <h4>Project Name</h4>
    <p>One-line description of what we built.</p>
    <span class="site-link">Visit Site <span>&rarr;</span></span>
  </div>
</a>
```

Drop the screenshot `.jpg` into `assets/` first, then reference it in the `<img>` tag.

---

## Structure

```
OVM-website/
├── index.html              # the whole site (single file)
├── assets/
│   ├── logo.png            # OneVibeMedia mark (white-on-dark)
│   ├── onevibe-screen.jpg  # OneVibeMedia portfolio card image
│   ├── gallery-product-*.jpg
│   ├── product-video-*.mp4 # 3D visual gallery videos
│   └── OVMG-Creative-Portfolio.pdf
├── _headers                # Netlify cache headers
├── netlify.toml            # Netlify build/deploy config
├── .gitignore
└── README.md
```

---

## What's in this build (vs. the current onevibemedia.shop site)

- Same copy &mdash; verbatim
- Hero: animated mesh-gradient orbs + grid overlay + noise texture
- Trust strip with 4 stats below the hero CTAs
- Polished tile spotlight (cursor-following accent glow on tile hover)
- Browser-frame portfolio cards (replaces the old 6 generic cards with 3 live-site previews)
- "Portfolio" nav link scrolls directly to the site cards
- Removed Solar ESS / data center enterprise section &mdash; this site is the media production arm only
- Marquee with gradient fade edges
- Reveal-on-scroll animations everywhere
- Tighter mobile menu, smoother transitions, accessible focus styles

Copy, services, pricing, contact form fields, mission/vision/portfolio flip cards, video modal &mdash; all preserved.
