// Oláh Duguláselhárítás · statikus build
// Futtatás: node tools/build.mjs   (a weboldal mappából)
// A forrás a src/ mappában, a kész oldalak a weboldal gyökerébe kerülnek (dupla kattintással nyílnak).
// A cégnév, a telefonszám és a terület EGY helyen van: a SITE objektumban lent.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---- EGY HELYEN: cégadatok (a cégnév munkanév, Sándorral egyeztetendő) ----
const SITE = {
  name: 'Duguláselhárítás',           // a fejlécben csak ez (Sándor kérése, 2026-10-07)
  person: 'Oláh Sándor',
  phone: '06 20 292 2730',
  tel: '+36202922730',
  area: 'Salgótarján és 70 km-es körzete',
  fb: 'https://www.facebook.com/profile.php?id=61581115711203',
  year: '2026',
  // DOMAIN UTÁN: 'https://<domain>' perjel nélkül. Üresen nincs canonical, og:url, sitemap.xml, abszolút og:image és abszolút @id.
  url: 'https://dugulaselharitasnograd.hu',
  // a weboldal és a JSON-LD neve csak „Duguláselhárítás” (David döntése, 2026-10-07); a founder Oláh Sándor
  city: 'Salgótarján', region: 'Nógrád',
  lat: 48.09607, lon: 19.80056,              // Salgótarján középpontja (OpenStreetMap Nominatim)
  lastmod: new Date().toISOString().slice(0, 10),
};

// ---- a látható árlistával közös adat (árak oldal táblázat + JSON-LD) ----
const SZOLG = [
  { key: 'mosogato', name: 'Mosogató-duguláselhárítás', desc: 'Konyhai lefolyó, szifon, a fali bekötésig.', min: 25000, max: 35000 },
  { key: 'furdo', name: 'Fürdőszobai duguláselhárítás', desc: 'Kád, zuhanytálca, mosdó, padlóösszefolyó.', min: 25000, max: 35000 },
  { key: 'wc', name: 'WC-duguláselhárítás', desc: 'Feljövő víz, rossz lehúzás, beleesett tárgy.', min: 30000, max: 45000 },
  { key: 'woma', name: 'Woma-csatornatisztítás', desc: 'Nagynyomású vízzel, a lerakódást is kimossa a cső faláról.', min: 50000, max: 75000 },
  { key: 'kamera', name: 'Szennyvízcsatorna-kamerázás', desc: 'Megmutatja, hol és mi okozza a dugulást.', min: 5000, max: null },
];

// ---- GYIK: a látható blokk (árak oldal) és a FAQPage JSON-LD ugyanebből készül ----
// [kérdés, válasz (sima szöveg, ez megy a JSON-LD-be), opcionális HTML-kiegészítés csak a látható blokkba]
const FAQ = [
  ['Mennyibe kerül a duguláselhárítás?', 'Irányárak: mosogató 25 000-35 000 Ft, fürdőszoba 25 000-35 000 Ft, WC 30 000-45 000 Ft, woma-csatornatisztítás 50 000-75 000 Ft, csatornakamerázás 5 000 Ft-tól. A díj attól függ, mi és milyen mélyen dugult el.'],
  ['Mennyibe kerül a kiszállás?', 'Salgótarjánban és 20 km-es körzetében a kiszállás ingyenes, 20 km felett csak az üzemanyag árát kérem. Salgótarján 70 km-es körzetében vállalom a munkát.'],
  ['Kell bontani a duguláselhárításhoz?', 'Nem. Bontás nélkül dolgozom, gépi spirállal és magasnyomású womával.', ' <a href="rolunk.html">A gépeimről itt olvashat.</a>'],
  ['Éjjel és hétvégén is kijön?', 'Igen, 0-24 hívható vagyok, éjjel, hétvégén és ünnepnapon is: 06 20 292 2730. Akár egy órán belül a helyszínen vagyok.'],
  ['Van garancia a munkára?', 'Igen, az elvégzett munkára 6 hónap garanciát vállalok.'],
  ['Cégeknek is dolgozik?', 'Igen, cégeknek és intézményeknek is dolgozom, számlát adok.'],
];
const PATH = { fooldal: '/', arak: '/arak', rolunk: '/rolunk', kapcsolat: '/kapcsolat', aszf: '/aszf', adatvedelem: '/adatvedelem', nincs: '/404' };

const IMG = JSON.parse(readFileSync(join(ROOT, 'tools', 'kepek.json'), 'utf8'));
const used = new Map();

// <!--img:kulcs|alt|sizes|osztály|eager-->  ->  <img srcset ...>
function img(key, alt, sizes, cls, eager) {
  const v = IMG[key];
  if (!v) throw new Error('Ismeretlen kép-kulcs: ' + key);
  used.set(key, (used.get(key) || 0) + 1);
  const [fn0, w0, h0] = v[0];
  const big = v[v.length - 1];
  const srcset = v.map(([f, w]) => `media/${f} ${w}w`).join(', ');
  const load = eager === 'eager'
    ? 'fetchpriority="high" decoding="async"'
    : 'loading="lazy" decoding="async"';
  return `<img class="${cls}" src="media/${v[Math.min(1, v.length - 1)][0]}" srcset="${srcset}" sizes="${sizes}" width="${big[1]}" height="${big[2]}" alt="${alt}" ${load}>`;
}

const PAGES = [
  { file: 'index.html', key: 'fooldal', label: 'Főoldal', geo: true },
  { file: 'arak.html', key: 'arak', label: 'Szolgáltatások és árak' },
  { file: 'rolunk.html', key: 'rolunk', label: 'Géppark és rólunk', crumb: 'Géppark és rólam' },
  { file: 'kapcsolat.html', key: 'kapcsolat', label: 'Kapcsolat', geo: true },
];
// a jogi oldalak NEM menüpontok: csak a lábléc alsó sorában (Impresszum és ÁSZF · Adatvédelem).
// Az e-mail-cím és a székhely csak ezen a két oldalon szerepel (David döntése, 2026-10-07).
const LEGAL = [
  { file: 'aszf.html', key: 'aszf', label: 'Általános Szerződési Feltételek', foot: 'Impresszum és ÁSZF', href: 'aszf.html#impresszum', legal: true },
  { file: 'adatvedelem.html', key: 'adatvedelem', label: 'Adatvédelmi tájékoztató', foot: 'Adatvédelem', href: 'adatvedelem.html', legal: true },
];
// a 404 nem menüpont: külön, noindex, mély útvonalon is betölt (base csak http(s) alatt)
const PAGE404 = { file: '404.html', key: 'nincs', label: 'Az oldal nem található', noindex: true };

const ICON_PHONE = '<svg class="ico" viewBox="0 0 256 256" aria-hidden="true" focusable="false"><path fill="currentColor" d="M224,154.8l-47.09-21.11-.18-.08a19.94,19.94,0,0,0-19,1.75,13.08,13.08,0,0,0-1.12.84l-22.31,19c-13-7.05-26.43-20.37-33.49-33.21l19.06-22.66a11.76,11.76,0,0,0,.85-1.15,20,20,0,0,0,1.66-18.83,1.42,1.42,0,0,1-.08-.18L101.2,32A20.06,20.06,0,0,0,80.42,20.15,60.27,60.27,0,0,0,28,80c0,81.61,66.39,148,148,148a60.27,60.27,0,0,0,59.85-52.42A20.06,20.06,0,0,0,224,154.8ZM176,204A124.15,124.15,0,0,1,52,80,36.29,36.29,0,0,1,80.48,44.46l18.82,42L80.14,109.28a12,12,0,0,0-.86,1.16A20,20,0,0,0,78,130.08c9.42,19.28,28.83,38.56,48.31,48A20,20,0,0,0,146,176.63a11.63,11.63,0,0,0,1.11-.85l22.43-19.07,42,18.81A36.29,36.29,0,0,1,176,204Z"/></svg>';
const ICON_ARROW = '<svg class="ico" viewBox="0 0 256 256" aria-hidden="true" focusable="false"><path fill="currentColor" d="M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z"/></svg>';
const ICON_FB = '<svg class="ico" viewBox="0 0 256 256" aria-hidden="true" focusable="false"><path fill="currentColor" d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm12,191.13V156h20a12,12,0,0,0,0-24H140V112a12,12,0,0,1,12-12h16a12,12,0,0,0,0-24H152a36,36,0,0,0-36,36v20H96a12,12,0,0,0,0,24h20v55.13a84,84,0,1,1,24,0Z"/></svg>';
const ICON_MENU = '<svg class="ico" viewBox="0 0 256 256" aria-hidden="true" focusable="false"><path fill="currentColor" d="M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128ZM40,76H216a12,12,0,0,0,0-24H40a12,12,0,0,0,0,24ZM216,180H40a12,12,0,0,0,0,24H216a12,12,0,0,0,0-24Z"/></svg>';
const ICON_X = '<svg class="ico" viewBox="0 0 256 256" aria-hidden="true" focusable="false"><path fill="currentColor" d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"/></svg>';

function header(active) {
  const links = PAGES.map(p =>
    `<li><a href="${p.file}"${p.key === active ? ' aria-current="page"' : ''}>${p.label}</a></li>`).join('');
  return `<a class="skip" href="#tartalom">Ugrás a tartalomra</a>
<header class="site-head">
  <div class="wrap site-head__in">
    <a class="brand" href="index.html" aria-label="${SITE.name}, főoldal">
      <span class="brand__mark" aria-hidden="true"></span>
      <span class="brand__name">${SITE.name}</span>
    </a>
    <nav class="nav" id="fomenu" aria-label="Főmenü">
      <ul>${links}</ul>
      <a class="nav__tel" href="tel:${SITE.tel}">${ICON_PHONE}<span>${SITE.phone}</span></a>
    </nav>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="fomenu">
      <span class="menu-btn__open">${ICON_MENU}<span class="sr">Menü megnyitása</span></span>
      <span class="menu-btn__close">${ICON_X}<span class="sr">Menü bezárása</span></span>
    </button>
  </div>
</header>`;
}

function footer(active) {
  const links = PAGES.map(p => `<li><a href="${p.file}">${p.label}</a></li>`).join('');
  const legal = LEGAL.map(p => `<li><a href="${p.href}"${p.key === active ? ' aria-current="page"' : ''}>${p.foot}</a></li>`).join('');
  return `<footer class="site-foot">
  <div class="wrap site-foot__in">
    <div class="site-foot__brand">
      <p class="site-foot__name">${SITE.name}</p>
      <p>${SITE.person} · ${SITE.area}</p>
      <a class="site-foot__fb" href="${SITE.fb}" target="_blank" rel="noopener" aria-label="Facebook">${ICON_FB}</a>
    </div>
    <ul class="site-foot__nav">${links}</ul>
    <div class="site-foot__call"><span>0-24 hívható ügyelet</span><a class="site-foot__tel" href="tel:${SITE.tel}">${SITE.phone}</a></div>
  </div>
  <div class="wrap site-foot__base"><p>© ${SITE.year} ${SITE.name}</p><ul class="site-foot__legal" aria-label="Jogi tudnivalók">${legal}</ul></div>
</footer>
<nav class="callbar-wrap" aria-label="Gyors hívás"><a class="callbar" href="tel:${SITE.tel}">${ICON_PHONE}<span>Hívás</span><span class="callbar__num">${SITE.phone}</span></a></nav>`;
}

// JSON-LD @graph (Aphelios javaslata alapján, SEO-GEO-TERV.md 7. pont). Üres SITE.url mellett
// a url/image/logo/item mezők kimaradnak (a JSON.stringify eldobja az undefined-ot), az @id gyökér-relatív.
function jsonldGraph(p, title) {
  const U = SITE.url || '';
  const abs = (path) => (U ? U + path : undefined);
  const ID = (frag) => `${U}/#${frag}`;
  const pageId = (abs(PATH[p.key]) || PATH[p.key]) + '#webpage';
  const biz = {
    '@type': 'Plumber',
    '@id': ID('vallalkozas'),
    name: SITE.name,
    founder: { '@type': 'Person', name: SITE.person },
    telephone: SITE.tel,
    url: abs('/'),
    image: abs('/media/og-cover.jpg'),
    logo: abs('/apple-touch-icon.png'),
    address: { '@type': 'PostalAddress', addressLocality: SITE.city, addressRegion: SITE.region, addressCountry: 'HU' },
    geo: { '@type': 'GeoCoordinates', latitude: SITE.lat, longitude: SITE.lon },
    areaServed: [
      ...['Salgótarján', 'Bátonyterenye', 'Pásztó', 'Szécsény', 'Balassagyarmat', 'Rétság'].map((n) => ({ '@type': 'City', name: n })),
      { '@type': 'AdministrativeArea', name: 'Nógrád vármegye' },
      { '@type': 'GeoCircle', geoMidpoint: { '@type': 'GeoCoordinates', latitude: SITE.lat, longitude: SITE.lon }, geoRadius: 70000 },
    ],
    sameAs: [SITE.fb],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00', closes: '23:59',
    },
    priceRange: '5 000-75 000 Ft',
    currenciesAccepted: 'HUF',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Duguláselhárítás és csatornatisztítás',
      itemListElement: SZOLG.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', '@id': ID('szolg-' + s.key), name: s.name, description: s.desc },
        priceSpecification: Object.assign({ '@type': 'PriceSpecification', priceCurrency: 'HUF', minPrice: s.min }, s.max ? { maxPrice: s.max } : {}),
      })),
    },
  };
  const site = { '@type': 'WebSite', '@id': ID('website'), url: abs('/'), name: SITE.name, inLanguage: 'hu', publisher: { '@id': ID('vallalkozas') } };
  const page = {
    '@type': p.key === 'kapcsolat' ? 'ContactPage' : p.key === 'rolunk' ? 'AboutPage' : 'WebPage',
    '@id': pageId,
    url: abs(PATH[p.key]),
    name: title,
    inLanguage: 'hu',
    isPartOf: { '@id': ID('website') },
    about: { '@id': ID('vallalkozas') },
  };
  const graph = [biz, site, page];
  if (p.key !== 'fooldal') {
    const bc = {
      '@type': 'BreadcrumbList',
      '@id': (abs(PATH[p.key]) || PATH[p.key]) + '#breadcrumb',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Főoldal', item: abs('/') },
        { '@type': 'ListItem', position: 2, name: p.crumb || p.label, item: abs(PATH[p.key]) },
      ],
    };
    page.breadcrumb = { '@id': bc['@id'] };
    graph.push(bc);
  }
  if (p.key === 'arak') {
    graph.push({
      '@type': 'FAQPage',
      '@id': (abs(PATH.arak) || PATH.arak) + '#gyik',
      mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
function jsonld(p, title) {
  // '<' kódolva, hogy a szövegben lévő '</' ne zárhassa le a script-blokkot
  return `<script type="application/ld+json">${JSON.stringify(jsonldGraph(p, title)).replace(/</g, '\\u003c')}</script>`;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
// ezres tagolás mindig (a hu-HU locale a 4 jegyű számot nem tagolja: 5000)
const grp = (n, sp = ' ') => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sp);
const huf = (n) => grp(n, '&nbsp;');

// árlista a SZOLG tömbből (ugyanaz a jelölés, mint korábban kézzel)
function prices() {
  return SZOLG.map((s) => `          <tr data-reveal>
            <th scope="row"><span class="prices__name">${s.name}</span><span class="prices__desc">${s.desc}</span></th>
            <td class="prices__val">${s.max ? `${huf(s.min)}-${huf(s.max)}&nbsp;Ft` : `${huf(s.min)}&nbsp;Ft-tól`}</td>
          </tr>`).join('\n');
}

// látható GYIK a FAQ tömbből (details/summary: JS nélkül, billentyűzettel is nyílik)
function faq() {
  return FAQ.map(([q, a, extra]) => `      <details class="faq__item">
        <summary><h3 class="faq__q">${q}</h3><span class="faq__ico" aria-hidden="true"></span></summary>
        <p>${a.replace('06 20 292 2730', `<a href="tel:${SITE.tel}">${SITE.phone}</a>`)}${extra || ''}</p>
      </details>`).join('\n');
}

const out = [];
for (const p of [...PAGES, ...LEGAL, PAGE404]) {
  let src = readFileSync(join(ROOT, 'src', p.file), 'utf8');
  // fejrész-meta a forrás első sorából: <!--meta:title|description-->  (404-nél description üres lehet)
  const m = src.match(/^<!--meta:(.*?)\|(.*?)-->\s*/);
  if (!m) throw new Error('Hiányzó meta: ' + p.file);
  const [, title, desc] = m;
  src = src.slice(m[0].length);
  src = src.replace(/<!--img:(.*?)-->/g, (_, a) => img(...a.split('|')));
  src = src.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (k === 'ICON_PHONE') return ICON_PHONE;
    if (k === 'ICON_ARROW') return ICON_ARROW;
    if (k === 'ICON_FB') return ICON_FB;
    if (k === 'PRICES') return prices();
    if (k === 'FAQ') return faq();
    if (!(k in SITE)) throw new Error('Ismeretlen változó: ' + k);
    return SITE[k];
  });
  const U = SITE.url;
  const ogImg = U ? `${U}/media/og-cover.jpg` : 'media/og-cover.jpg';
  const head = [
    `<title>${title}</title>`,
    desc ? `<meta name="description" content="${esc(desc)}">` : '',
    p.noindex ? '<meta name="robots" content="noindex">' : p.legal ? '<meta name="robots" content="index, follow">' : '',
    U && !p.noindex ? `<link rel="canonical" href="${U}${PATH[p.key]}">` : '',
    `<meta name="theme-color" content="#13212B">`,
    p.geo ? `<meta name="geo.region" content="HU-NO">\n<meta name="geo.placename" content="${SITE.city}">\n<meta name="geo.position" content="${SITE.lat};${SITE.lon}">\n<meta name="ICBM" content="${SITE.lat}, ${SITE.lon}">` : '',
    `<meta property="og:type" content="website">`,
    `<meta property="og:locale" content="hu_HU">`,
    `<meta property="og:site_name" content="${SITE.name}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    desc ? `<meta property="og:description" content="${esc(desc)}">` : '',
    U && !p.noindex ? `<meta property="og:url" content="${U}${PATH[p.key]}">` : '',
    `<meta property="og:image" content="${ogImg}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="Oláh Sándor magasnyomású csatornatisztító gépe">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ].filter(Boolean).join('\n');
  const html = `<!doctype html>
<html lang="hu">
<head>
<meta charset="utf-8">
${p.noindex ? `<script>if(/^https?:$/.test(location.protocol))document.write('<base href="/">')</script>\n` : ''}<meta name="viewport" content="width=device-width, initial-scale=1">
${head}
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="icon" href="favicon.ico" sizes="16x16 32x32">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="preload" href="fonts/archivo-latin.woff2" as="font" type="font/woff2">
<link rel="stylesheet" href="js/vendor/lenis.css">
<link rel="stylesheet" href="css/site.css?v=4">
<script>document.documentElement.classList.add('js')</script>
${p.noindex ? '' : jsonld(p, title)}
</head>
<body class="page-${p.key}">
${header(p.key)}
<main id="tartalom">
${src.trim()}
</main>
${footer(p.key)}
<script src="js/vendor/gsap.min.js" defer></script>
<script src="js/vendor/ScrollTrigger.min.js" defer></script>
<script src="js/vendor/lenis.min.js" defer></script>
<script src="js/site.js?v=2" defer></script>
</body>
</html>
`;
  // Belső megjegyzés nem kerülhet a kiszolgált oldalra: minden megmaradt HTML-komment törölve.
  const tiszta = html.replace(/[ \t]*<!--(?!\[if)[\s\S]*?-->[ \t]*\r?\n?/g, '');
  if (/<!--/.test(tiszta)) throw new Error('HTML-komment maradt: ' + p.file);
  writeFileSync(join(ROOT, p.file), tiszta);
  out.push(p.file);
}

// ---- llms.txt (rövid, ugyanazt mondja, mint az oldal); üres SITE.url mellett gyökér-relatív linkek ----
const L = SITE.url || '';
const llms = `# ${SITE.name} · ${SITE.person}, ${SITE.city}

> ${SITE.person} egyéni duguláselhárító Salgótarjánban és 70 km-es körzetében (Nógrád vármegye). 0-24 hívható: ${SITE.phone}. Bontás nélkül dolgozik gépi spirállal, magasnyomású womával és csatornakamerával, az elvégzett munkára 6 hónap garanciát ad. Salgótarjánban és 20 km-es körzetében a kiszállás ingyenes, 20 km felett csak az üzemanyag árát kéri. Cégeknek és intézményeknek számlát ad.

## Irányárak

${SZOLG.map((s) => `- ${s.name}: ${s.max ? `${grp(s.min)}-${grp(s.max)} Ft` : `${grp(s.min)} Ft-tól`}`).join('\n')}
- A díj attól függ, mi és milyen mélyen dugult el.

## Oldalak

- [Főoldal](${L}/): mit vállal, terület, elérhetőség
- [Szolgáltatások és árak](${L}/arak): árlista, kiszállás, garancia, gyakori kérdések
- [Géppark és rólam](${L}/rolunk): a saját gépek
- [Kapcsolat](${L}/kapcsolat): telefon, nyitvatartás, terület
- [Impresszum és ÁSZF](${L}/aszf): szolgáltatói adatok, szerződési feltételek, garancia, elállás, panaszkezelés
- [Adatvédelmi tájékoztató](${L}/adatvedelem): milyen adatot kezel, meddig, kinek adja át
- [Facebook](${SITE.fb})
`;
writeFileSync(join(ROOT, 'llms.txt'), llms);
out.push('llms.txt');

// ---- sitemap.xml csak élő domainnel (relatív URL a sitemapben érvénytelen) ----
if (SITE.url) {
  const sm = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...PAGES, ...LEGAL].map((p) => `  <url><loc>${SITE.url}${PATH[p.key]}</loc><lastmod>${SITE.lastmod}</lastmod></url>`).join('\n')}
</urlset>
`;
  writeFileSync(join(ROOT, 'sitemap.xml'), sm);
  out.push('sitemap.xml');
}

// egy kép egy helyen
const dup = [...used].filter(([, n]) => n > 1);
if (dup.length) throw new Error('Ugyanaz a kép több helyen: ' + dup.map(d => d[0]).join(', '));
const unused = Object.keys(IMG).filter(k => !used.has(k));
console.log('Kész:', out.join(', '));
if (unused.length) console.log('Nem használt kép-kulcs:', unused.join(', '));
