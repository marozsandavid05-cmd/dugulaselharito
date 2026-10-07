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
};

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
  { file: 'index.html', key: 'fooldal', label: 'Főoldal' },
  { file: 'arak.html', key: 'arak', label: 'Szolgáltatások és árak' },
  { file: 'rolunk.html', key: 'rolunk', label: 'Géppark és rólunk' },
  { file: 'kapcsolat.html', key: 'kapcsolat', label: 'Kapcsolat' },
];

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

function footer() {
  const links = PAGES.map(p => `<li><a href="${p.file}">${p.label}</a></li>`).join('');
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
  <div class="wrap site-foot__base"><p>© ${SITE.year} ${SITE.name}</p></div>
</footer>
<nav class="callbar-wrap" aria-label="Gyors hívás"><a class="callbar" href="tel:${SITE.tel}">${ICON_PHONE}<span>Hívás</span><span class="callbar__num">${SITE.phone}</span></a></nav>`;
}

function jsonld(page) {
  const biz = {
    '@type': ['Plumber', 'LocalBusiness'],
    '@id': '#vallalkozas',
    name: SITE.name,
    founder: { '@type': 'Person', name: SITE.person },
    telephone: SITE.tel,
    image: 'media/gep-1100.webp',
    areaServed: [
      { '@type': 'City', name: 'Salgótarján' },
      {
        '@type': 'GeoCircle',
        geoMidpoint: { '@type': 'GeoCoordinates', latitude: 48.0986, longitude: 19.8045 },
        geoRadius: 70000,
      },
    ],
    sameAs: [SITE.fb],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00', closes: '23:59',
    },
    priceRange: '5 000-75 000 Ft',
    makesOffer: [
      ['Mosogató-duguláselhárítás', 25000, 35000],
      ['Fürdőszobai duguláselhárítás', 25000, 35000],
      ['WC-duguláselhárítás', 30000, 45000],
      ['Woma-csatornatisztítás', 50000, 75000],
      ['Szennyvízcsatorna-kamerázás', 5000, null],
    ].map(([n, min, max]) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: n },
      priceSpecification: Object.assign({ '@type': 'PriceSpecification', priceCurrency: 'HUF', minPrice: min }, max ? { maxPrice: max } : {}),
    })),
  };
  const graph = [biz, { '@type': 'WebSite', name: SITE.name, inLanguage: 'hu' }];
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>`;
}

const out = [];
for (const p of PAGES) {
  let src = readFileSync(join(ROOT, 'src', p.file), 'utf8');
  // fejrész-meta a forrás első sorából: <!--meta:title|description-->
  const m = src.match(/^<!--meta:(.*?)\|(.*?)-->\s*/);
  if (!m) throw new Error('Hiányzó meta: ' + p.file);
  src = src.slice(m[0].length);
  src = src.replace(/<!--img:(.*?)-->/g, (_, a) => img(...a.split('|')));
  src = src.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (k === 'ICON_PHONE') return ICON_PHONE;
    if (k === 'ICON_ARROW') return ICON_ARROW;
    if (k === 'ICON_FB') return ICON_FB;
    if (!(k in SITE)) throw new Error('Ismeretlen változó: ' + k);
    return SITE[k];
  });
  const html = `<!doctype html>
<html lang="hu">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${m[1]}</title>
<meta name="description" content="${m[2]}">
<meta name="theme-color" content="#13212B">
<meta property="og:type" content="website">
<meta property="og:locale" content="hu_HU">
<meta property="og:title" content="${m[1]}">
<meta property="og:description" content="${m[2]}">
<meta property="og:image" content="media/gep-1100.webp">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="icon" href="favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="preload" href="fonts/archivo-latin.woff2" as="font" type="font/woff2">
<link rel="stylesheet" href="js/vendor/lenis.css">
<link rel="stylesheet" href="css/site.css?v=2">
<script>document.documentElement.classList.add('js')</script>
${jsonld(p)}
</head>
<body class="page-${p.key}">
${header(p.key)}
<main id="tartalom">
${src.trim()}
</main>
${footer()}
<script src="js/vendor/gsap.min.js" defer></script>
<script src="js/vendor/ScrollTrigger.min.js" defer></script>
<script src="js/vendor/lenis.min.js" defer></script>
<script src="js/site.js?v=1" defer></script>
</body>
</html>
`;
  // Belső megjegyzés nem kerülhet a kiszolgált oldalra: minden megmaradt HTML-komment törölve.
  const tiszta = html.replace(/[ \t]*<!--(?!\[if)[\s\S]*?-->[ \t]*\r?\n?/g, '');
  if (/<!--/.test(tiszta)) throw new Error('HTML-komment maradt: ' + p.file);
  writeFileSync(join(ROOT, p.file), tiszta);
  out.push(p.file);
}

// egy kép egy helyen
const dup = [...used].filter(([, n]) => n > 1);
if (dup.length) throw new Error('Ugyanaz a kép több helyen: ' + dup.map(d => d[0]).join(', '));
const unused = Object.keys(IMG).filter(k => !used.has(k));
console.log('Kész:', out.join(', '));
if (unused.length) console.log('Nem használt kép-kulcs:', unused.join(', '));
