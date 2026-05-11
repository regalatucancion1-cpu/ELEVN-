// One-time generator: extracts inline articles a4..a10 from blog.html and
// produces standalone HTML files so each blog post has its own URL/canonical
// for proper Google indexing.

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BLOG = resolve(ROOT, "blog.html");
const SITE = "https://www.elevndjs.com";
const DATE = "2026-04-17";

const ARTICLES = [
  {
    id: "a4",
    slug: "wedding-venues-barcelona",
    title: "Wedding Venues Around Barcelona: Matching Music to the Setting",
    metaTitle: "Wedding Venues Around Barcelona | Matching Music to the Setting | ELEVN DJS",
    description:
      "Masia, vineyard, beach club, rooftop. Every Barcelona venue demands a different musical approach. Here is how to match the DJ to the setting before you book.",
    keywords:
      "wedding venues Barcelona, Barcelona wedding DJ, masia wedding music, beach club wedding Sitges, Catalan wedding venues, DJ for Barcelona venue",
    breadcrumbName: "Wedding Venues Around Barcelona",
    relatedSlugs: ["wedding-djs-barcelona", "wedding-dj-spain"],
  },
  {
    id: "a5",
    slug: "dj-agency-all-spain",
    title: "Covering All of Spain: Why a Barcelona-Based DJ Agency Works for Events Anywhere",
    metaTitle: "DJ Agency All of Spain | Barcelona-Based, Nationwide Coverage | ELEVN DJS",
    description:
      "We are based in Barcelona but most of our events happen somewhere else. Why a centralised DJ agency delivers consistently across Madrid, Valencia, Costa Brava, Sevilla and beyond.",
    keywords:
      "DJ agency Spain, DJ agency Barcelona Madrid, destination DJ Spain, DJ Spain national coverage, DJ Marbella, DJ Sevilla, DJ Valencia, DJ Costa Brava",
    breadcrumbName: "DJ Agency Covering All of Spain",
    relatedSlugs: ["destination-wedding-spain", "wedding-dj-spain"],
  },
  {
    id: "a6",
    slug: "music-international-wedding-crowd",
    title: "Music for an International Wedding Crowd: A DJ Perspective",
    metaTitle: "Music for an International Wedding Crowd | DJ Perspective | ELEVN DJS",
    description:
      "Your guests are flying in from different countries. How a great DJ builds energy across cultural divides, reads the room, and keeps a multinational dance floor moving all night.",
    keywords:
      "international wedding music, multinational wedding DJ, destination wedding music, multi-language wedding DJ, international wedding crowd, music for foreign guests Spain",
    breadcrumbName: "Music for an International Crowd",
    relatedSlugs: ["destination-wedding-spain", "great-wedding-dj-set"],
  },
  {
    id: "a7",
    slug: "dj-corporate-event-spain-guide",
    title: "DJ for a Corporate Event in Spain: What Your Brand Needs to Know",
    metaTitle: "DJ for Corporate Event in Spain | Brand Event Guide | ELEVN DJS",
    description:
      "Music at a corporate event isn't background noise. It signals tone, sets energy and affects how guests feel about your brand. The complete guide to hiring a corporate DJ in Spain.",
    keywords:
      "corporate event DJ Spain, brand event DJ Barcelona, corporate DJ Madrid, gala dinner DJ Spain, product launch DJ, corporate DJ Marbella, incentive event DJ",
    breadcrumbName: "DJ for Corporate Events in Spain",
    relatedSlugs: ["dj-agency-all-spain", "wedding-dj-spain"],
  },
  {
    id: "a8",
    slug: "questions-to-ask-wedding-dj",
    title: "10 Questions to Ask Your Wedding DJ Before Booking",
    metaTitle: "10 Questions to Ask Your Wedding DJ Before Booking | ELEVN DJS",
    description:
      "Most couples book a wedding DJ without asking the right questions. The ten things you should always ask, and what each answer tells you about whether they are the right fit.",
    keywords:
      "questions to ask wedding DJ, hire wedding DJ checklist, wedding DJ questions before booking, vetting a wedding DJ, wedding DJ interview, DJ red flags",
    breadcrumbName: "Questions to Ask Your Wedding DJ",
    relatedSlugs: ["wedding-dj-spain", "great-wedding-dj-set"],
  },
  {
    id: "a9",
    slug: "great-wedding-dj-set",
    title: "What Makes a Great Wedding DJ Set: From First Dance to Last Song",
    metaTitle: "What Makes a Great Wedding DJ Set | Anatomy of the Night | ELEVN DJS",
    description:
      "A great wedding set is not a playlist. It is a journey with structure: cocktail hour, dinner, first dance, build, peak, final stretch. How the best DJs deliver every phase.",
    keywords:
      "wedding DJ set structure, wedding music timeline, wedding DJ playlist, first dance to last song, great wedding set, wedding DJ pacing",
    breadcrumbName: "What Makes a Great Wedding Set",
    relatedSlugs: ["questions-to-ask-wedding-dj", "music-international-wedding-crowd"],
  },
  {
    id: "a10",
    slug: "spain-best-destination-international-events",
    title: "Why Spain Is Europe's Best Destination for International Events",
    metaTitle: "Why Spain Is Europe's Best Destination for International Events | ELEVN DJS",
    description:
      "Barcelona, Madrid, Costa Brava, Valencia, Marbella. Why Spain has become the default choice for international destination weddings and corporate events, and what it means for the music.",
    keywords:
      "destination events Spain, international wedding Spain, why Spain destination wedding, Spain corporate event destination, Barcelona destination weddings, Marbella corporate events",
    breadcrumbName: "Why Spain for International Events",
    relatedSlugs: ["destination-wedding-spain", "dj-agency-all-spain"],
  },
];

const RELATED_TITLES = {
  "wedding-dj-spain": {
    tag: "Weddings",
    title: "How to Choose a Wedding DJ in Spain: The Complete Guide",
  },
  "wedding-djs-barcelona": {
    tag: "Barcelona",
    title: "The Best Wedding DJs in Barcelona: What to Look For",
  },
  "destination-wedding-spain": {
    tag: "Destination",
    title: "Destination Wedding in Spain: A Music Guide for International Couples",
  },
  ...Object.fromEntries(
    ARTICLES.map((a) => [a.slug, { tag: a.breadcrumbName.split(" ")[0], title: a.title }])
  ),
};

const extractArticleBody = (blogHtml, id) => {
  const re = new RegExp(
    `<div class="blog-article" id="${id}">[\\s\\S]*?<div class="article-body">([\\s\\S]*?)<div class="article-cta">[\\s\\S]*?</div>\\s*</div>\\s*</div>\\s*</div>`,
    "i"
  );
  const m = blogHtml.match(re);
  if (!m) throw new Error(`Could not extract ${id} body`);
  return m[1].trim();
};

const extractArticleHeader = (blogHtml, id) => {
  const re = new RegExp(
    `<div class="blog-article" id="${id}">[\\s\\S]*?<div class="article-meta">([\\s\\S]*?)</div>\\s*<h1 class="article-h1">([\\s\\S]*?)</h1>\\s*<p class="article-lead">([\\s\\S]*?)</p>`,
    "i"
  );
  const m = blogHtml.match(re);
  if (!m) throw new Error(`Could not extract ${id} header`);
  return { meta: m[1].trim(), h1: m[2].trim(), lead: m[3].trim() };
};

const extractArticleFigure = (blogHtml, id) => {
  const re = new RegExp(
    `<div class="blog-article" id="${id}">[\\s\\S]*?<figure[^>]*>([\\s\\S]*?)</figure>`,
    "i"
  );
  const m = blogHtml.match(re);
  return m ? m[1].trim() : null;
};

const buildHtml = (a, blogHtml) => {
  const header = extractArticleHeader(blogHtml, a.id);
  const body = extractArticleBody(blogHtml, a.id);
  const figureInner = extractArticleFigure(blogHtml, a.id);

  const figure = figureInner
    ? `\n    <figure class="article-img">${figureInner}</figure>\n`
    : "";

  const related = a.relatedSlugs
    .map((slug) => {
      const r = RELATED_TITLES[slug];
      return `        <a href="/${slug}" class="related-card">\n          <span>${r.tag}</span>\n          <h4>${r.title}</h4>\n        </a>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${a.metaTitle}</title>
  <meta name="description" content="${a.description}">
  <meta name="keywords" content="${a.keywords}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:title" content="${a.title}">
  <meta property="og:description" content="${a.description}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="en_US">
  <meta property="og:site_name" content="ELEVN DJS">
  <meta property="og:url" content="${SITE}/${a.slug}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${a.title} | ELEVN DJS">
  <meta name="twitter:description" content="${a.description}">
  <meta name="geo.region" content="ES-CT">
  <meta name="geo.placename" content="Barcelona">
  <link rel="canonical" href="${SITE}/${a.slug}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": ${JSON.stringify(a.title)},
    "description": ${JSON.stringify(a.description)},
    "author": { "@type": "Organization", "name": "ELEVN DJS", "url": "${SITE}" },
    "publisher": { "@type": "Organization", "name": "ELEVN DJS", "url": "${SITE}" },
    "datePublished": "${DATE}",
    "dateModified": "${DATE}",
    "mainEntityOfPage": "${SITE}/${a.slug}",
    "inLanguage": "en"
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "${SITE}/" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "${SITE}/blog" },
      { "@type": "ListItem", "position": 3, "name": ${JSON.stringify(a.breadcrumbName)} }
    ]
  }
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=League+Spartan:wght@700;800;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    :root { --dark:#1a1a1a; --darker:#0e0e0e; --line:rgba(240,237,232,0.12); --line-strong:rgba(240,237,232,0.28); --cream:#f0ede8; --cream-dim:rgba(240,237,232,0.6); --accent:#C46A35; }
    body { font-family: 'Inter', system-ui, sans-serif; background: var(--dark); color: var(--cream); line-height: 1.6; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
    .sq { display: inline-block; width: 0.55em; height: 0.55em; background: var(--accent); vertical-align: middle; margin: 0 0.4em 0.15em; }
    nav { position: fixed; top: 0; left: 0; width: 100%; z-index: 100; background: rgba(14,14,14,0.82); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); }
    .nav-inner { max-width: 1100px; margin: 0 auto; padding: 1.25rem 2.5rem; display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
    .elevn-logo { font-family: 'League Spartan', sans-serif; font-weight: 900; font-size: 1.7rem; line-height: 0.8; letter-spacing: -0.05em; text-transform: lowercase; color: var(--cream); text-decoration: none; display: inline-flex; align-items: flex-end; gap: 0.06em; white-space: nowrap; }
    .elevn-text { display: inline-block; }
    .elevn-dot { display: inline-block; width: 0.28em; height: 0.28em; border-radius: 50%; background: var(--accent); margin-bottom: 0.15em; }
    .back-link { font-family: 'Space Mono', monospace; font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--cream-dim); text-decoration: none; transition: color 0.2s; }
    .back-link:hover { color: var(--cream); }
    .article-page { max-width: 780px; margin: 0 auto; padding: 9rem 2.5rem 6rem; }
    .breadcrumb { font-family: 'Space Mono', monospace; font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--cream-dim); margin-bottom: 3rem; }
    .breadcrumb a { color: var(--cream-dim); text-decoration: none; transition: color 0.2s; }
    .breadcrumb a:hover { color: var(--cream); }
    .breadcrumb .sep { margin: 0 0.5em; opacity: 0.4; }
    .article-meta { font-family: 'Space Mono', monospace; font-size: 0.68rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); margin-bottom: 2rem; }
    .article-h1 { font-family: 'Inter', sans-serif; font-weight: 800; font-size: clamp(2.2rem, 5vw, 3.8rem); line-height: 0.95; letter-spacing: -0.03em; text-transform: uppercase; color: var(--cream); margin-bottom: 2rem; }
    .article-h1 .lower { text-transform: lowercase; font-style: italic; font-weight: 300; }
    .article-h1 .accent { color: var(--accent); }
    .article-lead { font-size: 1.1rem; line-height: 1.65; color: var(--cream-dim); margin-bottom: 3rem; max-width: 60ch; }
    .article-body h2 { font-family: 'Inter', sans-serif; font-weight: 700; font-size: 1.35rem; letter-spacing: -0.01em; color: var(--cream); margin: 3rem 0 1.2rem; text-transform: uppercase; }
    .article-body p { font-size: 1rem; line-height: 1.75; color: var(--cream-dim); margin-bottom: 1.4rem; }
    .article-body p strong { color: var(--cream); font-weight: 600; }
    .article-body ul { margin: 1rem 0 1.6rem 1.5rem; }
    .article-body li { font-size: 0.98rem; line-height: 1.7; color: var(--cream-dim); margin-bottom: 0.6rem; }
    .article-body li strong { color: var(--cream); font-weight: 600; }
    .article-img { margin: 2.5rem 0; }
    .article-img img { width: 100%; height: auto; display: block; border: 1px solid var(--line); }
    .article-img figcaption { font-family: 'Space Mono', monospace; font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--cream-dim); margin-top: 0.8rem; }
    .article-cta { margin: 4rem 0 2rem; padding: 3rem; background: var(--darker); border: 1px solid var(--line); text-align: center; }
    .article-cta p { font-size: 1.05rem; color: var(--cream); margin-bottom: 1.5rem; }
    .btn-accent { display: inline-block; font-family: 'Space Mono', monospace; font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--cream); text-decoration: none; padding: 1.2rem 2.4rem; background: var(--accent); border: 1px solid var(--accent); transition: all 0.25s; }
    .btn-accent:hover { background: transparent; border-color: var(--cream); }
    .related { margin-top: 5rem; padding-top: 3rem; border-top: 1px solid var(--line); }
    .related h3 { font-family: 'Space Mono', monospace; font-size: 0.72rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--cream-dim); margin-bottom: 2rem; }
    .related-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .related-card { padding: 1.5rem; border: 1px solid var(--line); text-decoration: none; transition: border-color 0.2s; }
    .related-card:hover { border-color: var(--accent); }
    .related-card span { font-family: 'Space Mono', monospace; font-size: 0.65rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); display: block; margin-bottom: 0.8rem; }
    .related-card h4 { font-size: 1rem; font-weight: 600; color: var(--cream); line-height: 1.3; }
    footer { padding: 3rem 2.5rem; background: var(--darker); border-top: 1px solid var(--line); text-align: center; }
    footer p { font-family: 'Space Mono', monospace; font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--cream-dim); margin: 0; }
    footer a { color: var(--cream-dim); text-decoration: none; }
    @media (max-width: 720px) {
      .nav-inner { padding: 1rem 1.25rem; }
      .article-page { padding: 7rem 1.25rem 4rem; }
      .related-grid { grid-template-columns: 1fr; }
      .article-cta { padding: 2rem 1.5rem; }
    }
  </style>
</head>
<body>

  <nav>
    <div class="nav-inner">
      <a href="/" class="elevn-logo" aria-label="elevn. home"><span class="elevn-text">elevn</span><i class="elevn-dot"></i></a>
      <a href="/blog" class="back-link">&larr; Back to Blog</a>
    </div>
  </nav>

  <div class="article-page">
    <div class="breadcrumb">
      <a href="/">Home</a><span class="sep">/</span>
      <a href="/blog">Blog</a><span class="sep">/</span>
      <span>${a.breadcrumbName}</span>
    </div>

    <div class="article-meta">${header.meta}</div>
    <h1 class="article-h1">${header.h1}</h1>
    <p class="article-lead">${header.lead}</p>
${figure}
    <div class="article-body">
${body}
      <div class="article-cta">
        <p>Ready to find the right DJ for your event in Spain?</p>
        <a href="/match" class="btn-accent">Start the matching &rarr;</a>
      </div>
    </div>

    <div class="related">
      <h3>( Related articles )</h3>
      <div class="related-grid">
${related}
      </div>
    </div>
  </div>

  <footer>
    <p>&copy; 2026 elevn. DJ Agency &middot; Barcelona &middot; <a href="mailto:hello@elevndjs.com">hello@elevndjs.com</a></p>
  </footer>

</body>
</html>
`;
};

async function main() {
  const blogHtml = await readFile(BLOG, "utf8");
  for (const a of ARTICLES) {
    const html = buildHtml(a, blogHtml);
    const out = resolve(ROOT, `${a.slug}.html`);
    await writeFile(out, html, "utf8");
    console.log("✓ wrote", `${a.slug}.html`);
  }
  console.log(`\nGenerated ${ARTICLES.length} standalone article pages.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
