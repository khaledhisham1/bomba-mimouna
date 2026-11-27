# Bomba & Mimouna — Kids Fashion Store (Demo)

A presentation demo of an online children's clothing store for **Bomba & Mimouna**, Zagazig, Egypt.

> This is a **demo**, not a production store. Prices and products are sample data, and checkout is simulated.

## Concept: The Magic Wardrobe
The site opens with a 3D wardrobe. Tapping "افتح الدولاب" swings the doors open and zooms into the store. The intro can be skipped, plays once per session, and respects `prefers-reduced-motion`.

## Features
- Age-first shopping: pick the child's age and the whole catalog filters to it
- Boys / Girls / Baby / School collections and weekly offers
- Search, sort, and category tabs
- Product details with color and age-based size selection
- Size guide (age, height, weight)
- Cart with quantities, saved in `localStorage`
- 3-step checkout with validation (home delivery or branch pickup)
- WhatsApp order simulation (animated chat) plus a real `wa.me` link with the formatted order
- Weekly offer countdown and Zagazig branch section with map
- Responsive, RTL, mobile-first

## Tech
Plain HTML, CSS and JavaScript. No build step, no backend, no API keys.

```
index.html
assets/css/style.css
assets/js/data.js   # sample products and size guide
assets/js/app.js    # UI logic
assets/img/         # images
```

Run locally: open `index.html`, or serve the folder (for example `python -m http.server`).

## Image credits
All photos are from [Unsplash](https://unsplash.com) under the Unsplash License, used for illustration only. They are not the store's own products.
