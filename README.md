# ealing-schools

How close did you need to live to get a secondary school place? Cut-off distances, Ofsted and GCSE results for
schools in Ealing, Hounslow, Hammersmith & Fulham, Hillingdon and Brent, 2019–2026.

Live at https://schools.roxb.in

## Data

Each borough's schools live in `src/data/<borough>.js`, and `src/data/boroughs.js` lists the boroughs with their
council and source documents. `src/plugins/schools.js` joins them and tags each school with its borough. Where every
figure comes from is in [SOURCES.md](SOURCES.md).

### Adding a borough

1. Put its schools in `src/data/<id>.js` (same shape as below) and its source PDFs in `public/Documents/<Borough>/`.
2. Add it to `src/data/boroughs.js` and to `lists` in `src/plugins/schools.js`.
3. Add its sources to SOURCES.md. The landing page (add its outline to `src/data/outlines.js`), list labels, "How it works" sources and search area pick it
   up from there.

### A school

```
{
    "name": "Ada Lovelace Church of England High School",
    "shortName": "Ada Lovelace",                 // shown on the map and in the list
    "intakeDist": {"2019": 0.749, "2020": null, "2021": 0},
    "notes": null,                                // anything that changes who the cut-off applies to
    "rating": "outstanding", "ratingDate": "2023-01-11",
    "ofsted": {"urn": 145724, "latest": null},    // see SOURCES.md for `latest`
    "measure": "walk",                            // only for schools that use walking distance
    "centre": {"lat": 51.518949, "lng": -0.293081},
    "colour": "#008f91",
    "address": "Park View Road<br/>Ealing<br/>London<br/>W5 2JX",
    "website": "...", "intakeCriteria": "...", "phone": "...",
    "perf": "...", "perfDetailed": "...",
    "progress8": 1.4, "progress8Confidence": "Low", "attainment8": 67, "grade5Above": 84
}
```

`intakeDist` maps each offer year to the furthest distance offered, in miles: `null` means everyone who applied got
a place, `0` means no places were given on distance, and a missing year means no figure was published.

## Adverts

There are two advert spaces, both drawn by `src/components/AdSlot.vue`:

| Space | Where | Shown at | Picture |
|---|---|---|---|
| `desktop` | Pinned under the school list on wide screens; stays put while the list scrolls | about 380 x 120 | 760 x 240 |
| `mobile` | In the school list on phones and small tablets, after the third school | about 360 x 180 | 720 x 360 |

`src/data/adverts.js` gives each space a list of adverts (link, picture, description for screen readers). A space
starts on one picked at random and moves to the next every 12 seconds, in a shuffled order, holding still while the
pointer is on it. An advert can have a short film (`film`, an .mp4) that builds up to its picture and stops there: it
plays once each time the advert comes up, starting when the space is on screen. Visitors who ask for reduced motion,
and phones that refuse to play video unasked, get the picture instead. Pictures go in `public/adverts/` at twice the size they are shown, and every picture in a space must
be the same shape. Empty a space's list and it disappears, taking no room.

The SquadCars adverts (five wordings, a picture and a film each per space) are built in the squadcars repo
(`marketing/brand/schools-advert/`), which also writes `src/data/squadcars-adverts.json`: rebuild them there and copy
both over. Each link carries `utm_content=<wording>`, so clicks can be told apart.

## Project setup
```
yarn install
```

Note this prject is now `Vue3` and `Vuetify3` running via `Vite`

### Compiles and hot-reloads for development
```
yarn dev
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Walking distances

Schools with `"measure": "walk"` in `src/data/` are judged on walking distance rather than a straight line.
The walk from a visitor's home is looked up with Google Maps walking directions (Distance Matrix, using the same Maps
key) when they set an address. The walking *areas* drawn on the map are OpenStreetMap walking isochrones from the
public Valhalla server run by FOSSGIS (no key needed), saved to `public/data/walk/`.

```
node scripts/walking-bands.mjs                    # only files whose inputs changed
node scripts/walking-bands.mjs --force            # rebuild everything
node scripts/walking-bands.mjs --dry-run          # show what would be fetched
GRAPHHOPPER_API_KEY=... node scripts/walking-bands.mjs --provider graphhopper
```

GraphHopper works too, but only on a plan that includes its Isochrone API; the free plan doesn't.

The `Walking distance data` GitHub workflow runs this when the school data changes and opens a pull request with the
result. It needs "Allow GitHub Actions to create pull requests" enabled.

### Ofsted

`rating` / `ratingDate` hold the last overall grade. Newer inspections go in `ofsted.latest`:
`{type: "reportCard", date, safeguarding, areas: {...}}`, `{type: "keyJudgements", date, areas: {...}}` or
`{type: "ungraded", date, outcome: "maintained" | "improving"}`.
