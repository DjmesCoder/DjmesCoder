# Muttmore — Shopify theme

A custom Online Store 2.0 theme for **Muttmore**, the neighborhood pet shop for mutts of every shape and size.
Warm cream, forest green and terracotta; Fraunces (soft serif) headings, Nunito Sans body, Caveat for the occasional handwritten note.

## Install

**Option A — upload a zip**
1. Zip the theme folders (from the repo root): `zip -r muttmore-theme.zip assets config layout locales sections snippets templates`
2. Shopify admin → **Online Store → Themes → Add theme → Upload zip file**.

**Option B — connect GitHub**
Shopify admin → **Online Store → Themes → Add theme → Connect from GitHub**, then pick this repo and branch.

Preview it, then **Publish** when you're happy.

## Set up in 10 minutes

| What | Where |
| --- | --- |
| **Main menu** (Dogs, Cats, Shop All, Our Story, Contact) | Content → Menus → `main-menu`. The header uses it automatically. |
| **Hero photo** (one warm lifestyle shot, portrait 4:5 is ideal) | Theme editor → Home → Hero → *Lifestyle image* |
| **For Dogs / For Cats** links | Theme editor → Home → Shop by pet → each card → *Collection* |
| **Shop by need** tiles (Dog Apparel, Feeding, Beds & Comfort, Walks & Potty, Cleaning & Grooming) | Theme editor → Home → Shop by need → each tile → *Collection* |
| **Featured products** ("God Got Me" Dog Shirt, LED Poop Bag Dispenser, Slow Feeder Dog Bowl) | Theme editor → Home → Featured products → each block → *Product*. Sticky notes are editable too. |
| **Your story + photo** | Theme editor → Home → Our story. Replace the placeholder text (including the "This is your space…" line). |
| **Contact page** | Online Store → Pages → Add page "Contact", template **page.contact** |
| **Policies** (Shipping, Refund & Return, Terms, Privacy) | Settings → Policies. The footer links to them automatically. |
| **Support email** | Theme editor → Footer (defaults to support@muttmore.com) |
| **Social links** | Theme settings → Social media |

## Product pages

- **Color swatches** appear for any option named *Color* or *Colour*. For exact brand colors, set swatches in the admin
  (Products → a product → Color option → pick a swatch color or image). Without one, the value name is used as a CSS color.
- **Size guide** shows automatically on products with a *Size* option. The default table covers dog apparel (XS–XXL).
  For a custom guide on one product, add a rich-text product metafield `custom.size_guide`, or point the block at a page.
- **Free shipping note** sits right under *Add to cart* (editable in the Buy buttons block).
- **Pairs well with** uses Shopify's product recommendations. Set hand-picked pairings in the free
  *Search & Discovery* app (Complementary products); otherwise it falls back to automatic related products.

## Design rules baked in

- No sliders, countdown timers or pop-ups. One hero image, one clear "Shop All".
- Staggered, scrapbook-style layout: taped polaroid photos, offset cards, wavy section edges, doodles used sparingly.
- Product photos sit on warm tiles (not white). Photos on plain white/light backgrounds blend in best
  (Theme settings → Product cards → *Product photo fit* to switch to full-bleed).
- All colors are editable in Theme settings → Colors; defaults pass WCAG AA contrast on cream.
- Motion is subtle (fade-and-rise on scroll, gentle hovers), uses only transform/opacity, and switches off for
  visitors who prefer reduced motion.
- Fonts are self-hosted (SIL Open Font License) and served from Shopify's CDN — no third-party requests.

## Files

```
layout/     theme.liquid, password.liquid
sections/   homepage sections, header/footer groups, product, collection, cart, pages, accounts
snippets/   product-card, price, icon set, illustrations, placeholders, fonts
assets/     base.css, theme.js (no dependencies), fonts
templates/  JSON templates (OS 2.0), gift card, password
```
