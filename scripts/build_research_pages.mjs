import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const dataPath = resolve('src/data/research.json');
const data = JSON.parse(readFileSync(dataPath, 'utf8'));
const outputRoot = resolve('dist/research');

function escapeHtml(value = '') {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function write(path, value) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, value);
}

function dateLabel(value) {
    return new Intl.DateTimeFormat('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(`${value}T00:00:00Z`));
}

function pageFrame({ title, description, canonical, ogType = 'website', head = '', body }) {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="${escapeHtml(ogType)}" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${head}
  <style>
    :root{color-scheme:dark;--bg:#0b110e;--panel:#111a16;--panel2:#0f1713;--line:#27372f;--ink:#f4f1e8;--muted:#a8b4ad;--gold:#d7b66c;--teal:#73c9b5;--blue:#8bc8ef}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:radial-gradient(circle at 82% 0%,rgba(115,201,181,.11),transparent 34rem),var(--bg);color:var(--ink);font:16px/1.65 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    a{color:inherit}.wrap{width:min(1120px,calc(100% - 32px));margin:auto}.nav{display:flex;align-items:center;justify-content:space-between;padding:24px 0 46px}.brand{font-weight:760;text-decoration:none;letter-spacing:-.02em}.navlinks{display:flex;gap:18px}.navlinks a{color:var(--muted);text-decoration:none;font-size:14px;font-weight:650}.navlinks a:hover{color:var(--ink)}
    .eyebrow{color:var(--gold);font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}.hero{display:grid;grid-template-columns:1.2fr .8fr;gap:22px;align-items:stretch}.panel{border:1px solid var(--line);background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.018));border-radius:18px;padding:clamp(24px,4vw,48px)}h1{font-size:clamp(48px,8vw,92px);line-height:.94;letter-spacing:-.055em;max-width:9ch;margin:18px 0 24px}h2{font-size:clamp(28px,4vw,46px);line-height:1.05;letter-spacing:-.035em;margin:0}h3{font-size:20px;line-height:1.25;letter-spacing:-.02em;margin:0}.lead{font-size:19px;color:var(--muted);max-width:62ch}.meta{display:flex;flex-wrap:wrap;gap:8px;margin:22px 0}.pill{border:1px solid var(--line);border-radius:999px;padding:6px 10px;color:var(--muted);font-size:12px;font-weight:700}.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}.button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;border-radius:10px;padding:0 15px;text-decoration:none;font-size:14px;font-weight:800;border:1px solid var(--line);background:rgba(255,255,255,.035)}.button.primary{background:var(--gold);border-color:var(--gold);color:#171108}.button:hover{transform:translateY(-1px)}
    .statgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;height:100%}.stat{border:1px solid var(--line);border-radius:14px;padding:20px;background:var(--panel2)}.stat strong{display:block;color:var(--teal);font-size:30px;line-height:1}.stat span{display:block;color:var(--muted);font-size:13px;margin-top:10px}.section{padding:82px 0 0}.sectionhead{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:24px}.sectionhead p{color:var(--muted);max-width:58ch;margin:0}.featured{display:grid;grid-template-columns:.82fr 1.18fr;gap:22px}.featured .abstract{color:var(--muted);font-size:17px}.notice{border-left:2px solid var(--gold);padding-left:14px;color:var(--muted);font-size:13px;margin-top:24px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.card{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:16px;padding:24px;background:rgba(255,255,255,.025)}.card p{color:var(--muted);font-size:14px}.card .doi{color:var(--blue);font:600 12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere}.card .actions{margin-top:auto;padding-top:8px}.ledger{display:grid;grid-template-columns:1fr auto;gap:30px;align-items:center}.ledger p{color:var(--muted);max-width:66ch}.footer{padding:76px 0 36px;color:var(--muted);font-size:12px}.footerline{border-top:1px solid var(--line);padding-top:24px}.hash{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere;color:var(--muted);font-size:12px}
    @media(max-width:820px){.hero,.featured,.ledger{grid-template-columns:1fr}.grid{grid-template-columns:1fr}.nav{padding-bottom:32px}.navlinks a:nth-child(2){display:none}.statgrid{height:auto}.section{padding-top:58px}.sectionhead{display:block}.sectionhead p{margin-top:12px}.panel{border-radius:15px}}
    @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.button:hover{transform:none}}
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

const collectionItems = [
    {
        '@type': 'ScholarlyArticle',
        name: data.featured.title,
        headline: data.featured.subtitle,
        author: { '@type': 'Person', name: data.featured.author },
        datePublished: data.featured.publishedAt,
        abstract: data.featured.abstract,
        url: 'https://activemirror.ai/research/electric-mind/',
        keywords: data.featured.keywords.join(', '),
    },
    ...data.publications.map((paper) => ({
        '@type': 'ScholarlyArticle',
        name: paper.title,
        author: paper.authors.map((name) => (
            name === 'Desai, Paul'
                ? { '@type': 'Person', name: 'Paul Desai' }
                : { '@type': 'SoftwareApplication', name }
        )),
        datePublished: paper.publishedAt,
        abstract: paper.abstract,
        identifier: `https://doi.org/${paper.doi}`,
        url: paper.recordUrl,
    })),
];

const collectionJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Active Mirror Research',
    url: 'https://activemirror.ai/research/',
    description: 'Open theses, preprints, public evidence and scored forecasts by Paul Desai.',
    mainEntity: {
        '@type': 'ItemList',
        numberOfItems: collectionItems.length,
        itemListElement: collectionItems.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item,
        })),
    },
});

const paperCards = data.publications.map((paper) => `
<article class="card">
  <div class="eyebrow">${escapeHtml(paper.type)} · ${escapeHtml(dateLabel(paper.publishedAt))}</div>
  <h3>${escapeHtml(paper.title)}</h3>
  <div class="meta"><span class="pill">${paper.authors.map(escapeHtml).join('</span><span class="pill">')}</span></div>
  <p>${escapeHtml(paper.abstract)}</p>
  <div class="doi">doi:${escapeHtml(paper.doi)}</div>
  <div class="actions">
    <a class="button" href="${escapeHtml(paper.recordUrl)}" rel="noreferrer">Record</a>
    <a class="button" href="${escapeHtml(paper.fileUrl)}" rel="noreferrer">Download</a>
  </div>
</article>`).join('');

const collectionBody = `
<div class="wrap">
  <nav class="nav" aria-label="Primary"><a class="brand" href="/">Active Mirror</a><div class="navlinks"><a href="#papers">Papers</a><a href="#ledger">Ledger</a><a href="/app/">Try Active Mirror</a></div></nav>
  <main>
    <section class="hero">
      <div class="panel"><div class="eyebrow">Research · Paul Desai</div><h1>Ideas you can inspect.</h1><p class="lead">Open theses, preprints, public evidence and scored forecasts behind Active Mirror.</p><div class="actions"><a class="button primary" href="/research/electric-mind/">Read The Electric Mind</a><a class="button" href="https://zenodo.org/search?q=metadata.creators.person_or_org.name%3A%22Desai%2C%20Paul%22&l=list&p=1&s=10&sort=mostviewed">Browse Zenodo</a></div></div>
      <div class="statgrid" aria-label="Research summary"><div class="stat"><strong>1</strong><span>featured public thesis</span></div><div class="stat"><strong>${data.snapshot.recordCount}</strong><span>current Zenodo records</span></div><div class="stat"><strong>6</strong><span>dated forecasts in the first ledger</span></div><div class="stat"><strong>4×</strong><span>target weekly evidence rhythm</span></div></div>
    </section>
    <section class="section" id="featured"><div class="sectionhead"><div><div class="eyebrow">Featured thesis</div><h2>How we build it.</h2></div><p>One clear argument, a stable public source, and forecasts that can be scored later.</p></div><article class="featured panel"><div><div class="eyebrow">${escapeHtml(data.featured.type)} · ${escapeHtml(dateLabel(data.featured.publishedAt))}</div><h2>${escapeHtml(data.featured.title)}</h2><p>${escapeHtml(data.featured.subtitle)}</p><div class="meta"><span class="pill">${escapeHtml(data.featured.horizon)}</span><span class="pill">India</span><span class="pill">Version 1.0</span></div><div class="hash">SHA-256 ${escapeHtml(data.featured.sha256)}</div></div><div><p class="abstract">${escapeHtml(data.featured.abstract)}</p><p class="notice">${escapeHtml(data.featured.notice)}</p><div class="actions"><a class="button primary" href="/research/electric-mind/">Paper page</a><a class="button" href="${escapeHtml(data.featured.links.pdf)}">PDF</a><a class="button" href="${escapeHtml(data.featured.links.release)}">Release</a><a class="button" href="${escapeHtml(data.featured.links.citation)}">Cite</a></div></div></article></section>
    <section class="section" id="papers"><div class="sectionhead"><div><div class="eyebrow">DOI archive</div><h2>Papers and preprints.</h2></div><p>The labels below follow the live Zenodo record types. They are not presented as peer-reviewed unless a separate venue proves that status.</p></div><div class="grid">${paperCards}</div></section>
    <section class="section" id="ledger"><div class="panel ledger"><div><div class="eyebrow">Forecasts and research drops</div><h2>${escapeHtml(data.ledger.title)}</h2><p>${escapeHtml(data.ledger.description)}</p></div><div class="actions"><a class="button primary" href="${escapeHtml(data.ledger.links.repository)}">Open ledger</a><a class="button" href="${escapeHtml(data.ledger.links.drops)}">Research drops</a><a class="button" href="${escapeHtml(data.ledger.links.publisher)}">Open publisher</a></div></div></section>
    <section class="section"><div class="featured"><div class="panel"><div class="eyebrow">Field story, anonymized.</div><h3>Research becomes more useful when weak spots are visible before sharing.</h3></div><div class="panel"><div class="eyebrow">Open references.</div><h3>Every item above leads to the paper, release, DOI record, source archive or public ledger.</h3></div></div></section>
  </main>
  <footer class="footer"><div class="footerline">Independent research, preprints, technical reports and theses. Not professional advice. Zenodo snapshot checked ${escapeHtml(data.snapshot.fetchedAt)}.</div></footer>
</div>`;

write(
    resolve(outputRoot, 'index.html'),
    pageFrame({
        title: 'Research | Active Mirror',
        description: 'Open theses, preprints, public evidence and scored forecasts by Paul Desai.',
        canonical: 'https://activemirror.ai/research/',
        head: `<script type="application/ld+json">${collectionJsonLd.replaceAll('<', '\\u003c')}</script>`,
        body: collectionBody,
    }),
);

const featured = data.featured;
const featuredJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    name: featured.title,
    headline: featured.subtitle,
    author: { '@type': 'Person', name: featured.author },
    datePublished: featured.publishedAt,
    abstract: featured.abstract,
    keywords: featured.keywords.join(', '),
    url: 'https://activemirror.ai/research/electric-mind/',
    associatedMedia: { '@type': 'MediaObject', contentUrl: featured.links.pdf, encodingFormat: 'application/pdf' },
});

const featuredHead = `
  <meta name="citation_title" content="${escapeHtml(`${featured.title}: ${featured.subtitle}`)}" />
  <meta name="citation_author" content="${escapeHtml(featured.author)}" />
  <meta name="citation_date" content="${escapeHtml(featured.publishedAt)}" />
  <meta name="citation_publication_date" content="${escapeHtml(featured.publishedAt)}" />
  <meta name="citation_pdf_url" content="${escapeHtml(featured.links.pdf)}" />
  <meta name="citation_abstract" content="${escapeHtml(featured.abstract)}" />
  <meta name="citation_keywords" content="${escapeHtml(featured.keywords.join('; '))}" />
  <script type="application/ld+json">${featuredJsonLd.replaceAll('<', '\\u003c')}</script>`;

const featuredBody = `
<div class="wrap">
  <nav class="nav" aria-label="Primary"><a class="brand" href="/research/">← Active Mirror Research</a><div class="navlinks"><a href="${escapeHtml(featured.links.release)}">Release</a><a href="${escapeHtml(featured.links.linkedin)}">LinkedIn</a></div></nav>
  <main>
    <article class="panel"><div class="eyebrow">${escapeHtml(featured.type)} · ${escapeHtml(dateLabel(featured.publishedAt))}</div><h1>${escapeHtml(featured.title)}</h1><p class="lead">${escapeHtml(featured.subtitle)}</p><div class="meta"><span class="pill">Paul Desai</span><span class="pill">${escapeHtml(featured.horizon)}</span><span class="pill">Version 1.0</span></div><div class="actions"><a class="button primary" href="${escapeHtml(featured.links.pdf)}">Download PDF</a><a class="button" href="${escapeHtml(featured.links.release)}">Versioned release</a><a class="button" href="${escapeHtml(featured.links.citation)}">Citation metadata</a><a class="button" href="${escapeHtml(featured.links.page)}">Source archive</a></div></article>
    <section class="section featured"><div class="panel"><div class="eyebrow">Abstract</div><p class="lead">${escapeHtml(featured.abstract)}</p></div><div class="panel"><div class="eyebrow">Publication note</div><p>${escapeHtml(featured.notice)}</p><p class="hash">PDF SHA-256 ${escapeHtml(featured.sha256)}</p></div></section>
    <section class="section"><div class="panel"><div class="eyebrow">Recommended citation</div><h3>Desai, Paul. <em>The Electric Mind: Why India's AI Boom Will Be Built in Substations Before Server Halls.</em> Version 1.0, MirrorDNA Reflection Protocol, 11 August 2026.</h3></div></section>
  </main>
  <footer class="footer"><div class="footerline">Independent analysis for research and discussion. This is a thesis, not professional advice.</div></footer>
</div>`;

write(
    resolve(outputRoot, featured.slug, 'index.html'),
    pageFrame({
        title: `${featured.title} | Paul Desai`,
        description: featured.abstract,
        canonical: `https://activemirror.ai/research/${featured.slug}/`,
        ogType: 'article',
        head: featuredHead,
        body: featuredBody,
    }),
);

console.log(`Generated research pages from ${dataPath}: ${outputRoot}`);
