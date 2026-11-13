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

De site draait op <https://joy-m.nl>. Het domein en de e-mail staan bij **Hostnet**.

1. GitHub: **Settings → Pages → Custom domain**: `joy-m.nl` → *Save*. Zet daarna **Enforce HTTPS** aan.
2. Hostnet (DNS-beheer van joy-m.nl): vervang de A- en AAAA-records van `joy-m.nl` door:
   - A: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - AAAA: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - `www`: CNAME naar `joy-m-basketball.github.io.`
3. **Laat de MX-records (e-mail) staan**, anders werkt `vertrouwenspersoon@joy-m.nl` niet meer.

Oude WordPress-adressen (bijv. `/over-joy-m-basketbal/`) verwijzen door naar de nieuwe pagina's; zie de map `oude-adressen/`.

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
