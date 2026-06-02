# TANKZ — Web

Premium men's tank-top brand. Static marketing and storefront prototype.

Direction is Vuori-adjacent: an airy light canvas, generous whitespace, elevated photography, and a strict monochrome palette (black / white / grey). Display type is **Jockey One**, body type is **Roboto**.

## Pages

- `site/index.html` — Homepage
- `site/shop.html` — Shop / collection (PLP)
- `site/pdp.html` — Product detail page (sample: The Everyday Tank)
- `site/story.html` — Brand story

## Run locally

No build step. Open `site/index.html` directly in a browser, or serve the folder:

    python -m http.server -d site 5510

then visit http://localhost:5510

## Structure

    site/
      index.html  shop.html  pdp.html  story.html
      assets/
        css/   styles.css (shared) + shop.css, pdp.css, story.css
        js/    main.js
        img/   photography

## Notes

- Vanilla HTML / CSS / JS. Fonts load from Google Fonts.
- Photography is **AI-generated placeholder** art, standing in until the brand's product photoshoot. Swap real photos into `site/assets/img/` using the same filenames and aspect ratios for a drop-in replacement.
