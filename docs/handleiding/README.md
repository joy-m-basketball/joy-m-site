# Handleiding website beheren

De PDF `docs/handleiding-website-beheren.pdf` is gemaakt van `handleiding.html` in deze map.

Aanpassen en opnieuw maken (vanuit de hoofdmap van de repository; Playwright met Chromium is nodig):

```bash
node docs/handleiding/maak-pdf.js
```

- Screenshots staan in `img/`. De schermen van het CMS zijn schematische weergaven (HTML in `handleiding.html`), omdat het CMS alleen na inloggen bereikbaar is.
- De map `docs/` wordt niet op de website gepubliceerd (zie `exclude` in `_config.yml`).
