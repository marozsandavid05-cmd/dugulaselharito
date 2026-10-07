# Oláh Duguláselhárítás weboldal

Megnyitás: dupla kattintás az `index.html`-re.

- Forrás: `src\*.html` (oldaltörzsek, a 404 is), `css\site.css`, `js\site.js`. Build: `node tools\build.mjs` a mappában, ez írja a gyökérbe a kész oldalakat, a `404.html`-t és az `llms.txt`-t.
- Név, telefon, terület, árlista (`SZOLG`) és GYIK (`FAQ`) EGY helyen: `tools\build.mjs`. Az árlista és a GYIK ugyanabból az adatból készül a látható oldalra és a JSON-LD-be, ezért csak ott kell módosítani.
- Domain után: `tools\build.mjs` → `SITE.url = 'https://<domain>'` (perjel nélkül), majd build. Ez bekapcsolja a canonicalt, az og:url-t, az abszolút og:image-et és JSON-LD-mezőket, és kiírja a `sitemap.xml`-t. A `robots.txt` utolsó sorából a `#` törlendő, a domain beírandó.
- Képek: `media\`, méretek `tools\kepek.json`, források `media\FORRASOK.md`. Egy kép csak egy helyen (a build hibával leáll, ha kétszer szerepel). A megosztási kép `media\og-cover.jpg` (1200×630, a saját gép-fotóból).
- A build minden HTML-kommentet töröl, és hibával leáll, ha marad. Megjegyzés ne kerüljön az oldalba.
- Vendor lokálisan: `js\vendor` (GSAP 3.15, ScrollTrigger, Lenis 1.3.26), betűk `fonts\` (Archivo, Atkinson Hyperlegible Next). Lenis csak egeres eszközön fut, érintésen natív görgetés.
