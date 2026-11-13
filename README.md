# ealing-schools

A quick hack to allow me to view Ealing high schools and their intake radius with data from 2019-2021

Preview https://schools.roxb.in

## Your own data? 

Modify `src/plugins/schools.js`

```
const schoolsList = [ 
    {
        name: 'Ada Lovelace CofE High School',
        shortName: 'Ada Lovelace',
        intakeDist: { "2019": 0.749,  "2020": 0.885, "2021": 0.726 },
        visible: true, rating: 'good',
        centre: {lat: 51.5194566, lng: -0.2976813},
        description: '', 
        website: 'https://adalovelace.org.uk/', 
        colour: '#008f91'
    },
    ...
]
```

```
 name: name shown on slide out menu
 shortName: name shown on map
 intakeDist: object "keyed" by year with intake disant in miles - null = all students admitted - 0 = no students admitted
 visible: whether to show on map by default
 rating: ofsted rating
 centre: school location
 description: shown on dialog
 website: shown on dialog
 color: indicator colour used for school
```

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

Schools with `"measure": "walk"` in `src/plugins/schools.js` are judged on walking distance rather than a straight line.
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
