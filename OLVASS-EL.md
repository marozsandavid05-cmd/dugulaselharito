# Oláh Duguláselhárítás weboldal

Megnyitás: dupla kattintás az `index.html`-re.

- Forrás: `src\*.html` (oldaltörzsek), `css\site.css`, `js\site.js`. Build: `node tools\build.mjs` a mappában, ez írja a gyökérbe a 4 kész oldalt.
- Cégnév, telefon, terület EGY helyen: `tools\build.mjs`, `SITE` objektum. A cégnév munkanév, Sándorral egyeztetendő.
- Képek: `media\`, méretek `tools\kepek.json`, források `media\FORRASOK.md`. Egy kép csak egy helyen (a build hibával leáll, ha kétszer szerepel).
- Vendor lokálisan: `js\vendor` (GSAP 3.15, ScrollTrigger, Lenis 1.3.26), betűk `fonts\` (Archivo, Atkinson Hyperlegible Next).
