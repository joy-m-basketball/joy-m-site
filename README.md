# Joy-M Basketbal – website

De website van basketbalvereniging **Joy-M** uit Malden. Gebouwd met [Jekyll](https://jekyllrb.com), gehost op **GitHub Pages** en te beheren via **[Pages CMS](https://pagescms.org)**.

## Inhoud beheren (Pages CMS)

1. Ga naar <https://app.pagescms.org> en log in met je GitHub-account.
2. Kies de repository `joy-m-site` (en de branch `main`).
3. In het menu links vind je:
   - **Nieuws** – berichten toevoegen en bewerken
   - **Pagina's** – Over ons, Lid worden, Veilig sporten, Vertrouwenspersoon, Contact
   - **Homepage** – teksten en foto's van de voorpagina
   - **Trainingstijden**, **Teams**, **Veelgestelde vragen**
   - **Menu** – de links in het hoofdmenu
   - **Instellingen & contactgegevens** – e-mailadres, adres, vertrouwenspersoon, links naar NBB, aanmeldformulier en social media
4. Klik op **Save**. Pages CMS maakt een commit in GitHub; de website wordt daarna automatisch binnen 1–2 minuten bijgewerkt.

Foto's upload je via het media-veld; ze komen in `assets/uploads/`. Tip: gebruik foto's van maximaal ±1600 px breed.

## Publiceren op GitHub Pages

Eenmalig instellen:

1. In GitHub: **Settings → Pages → Build and deployment → Source: _GitHub Actions_**.
2. Elke push naar `main` (ook vanuit Pages CMS) start de workflow `.github/workflows/pages.yml`, die de site bouwt en publiceert.

### Eigen domein (joy-m.nl)

Pas dit pas aan op het moment dat je wilt overstappen van de huidige WordPress-site:

1. **Settings → Pages → Custom domain**: vul `joy-m.nl` (of `www.joy-m.nl`) in.
2. Zet bij je domeinbeheerder de DNS-records zoals beschreven in de [GitHub-documentatie](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site).
3. Vul in `_config.yml` bij `url:` `https://joy-m.nl` in.

Interne links werken automatisch zowel op `…github.io/joy-m-site/` als op een eigen domein.

## Lokaal draaien (voor ontwikkelaars)

```bash
bundle install
bundle exec jekyll serve
```

Open daarna <http://localhost:4000>.

## Structuur

| Map / bestand | Inhoud |
| --- | --- |
| `_paginas/` | Pagina's (Markdown) – het bestandsnaam bepaalt het adres |
| `_posts/` | Nieuwsberichten |
| `_data/` | Homepage, trainingstijden, teams, FAQ, menu en instellingen |
| `_layouts/`, `_includes/` | HTML-templates |
| `assets/css/main.css` | Vormgeving (kleuren uit het logo) |
| `assets/uploads/` | Foto's |
| `.pages.yml` | Configuratie van Pages CMS |

## Lettertypen

- **Saira Extra Bold Italic** (koppen) – SIL Open Font License, zie `assets/fonts/SAIRA-OFL.txt`.
- **Barlow** (tekst) – SIL Open Font License, zie `assets/fonts/BARLOW-OFL.txt`.
