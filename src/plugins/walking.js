import {reactive} from 'vue';

// Walking distance from home comes from Google Maps walking directions (one
// Distance Matrix request when an address is set). Walking *areas* for the map
// come from CI (scripts/walking-bands.mjs), and its bands are a fallback for the
// distance. Each file in /data/walk holds:
//   bands:   [{metres, polygon}]  ascending; polygon = GeoJSON Polygon coordinates
//   cutoffs: {year: {metres, polygon}}  exact outline at that year's cut-off

export const METRES_PER_MILE = 1609.344;

const cache = reactive({});
// Google walking distances: `${school}|${home}` → {miles}, null if Google
// couldn't route it, undefined while the request is out.
const routes = reactive({});

export function schoolKey(school) {
    return school.shortName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function load(school) {
    const key = schoolKey(school);
    if (key in cache) return;
    cache[key] = undefined;
    fetch(`/data/walk/${key}.json`)
        .then(response => response.ok ? response.json() : null)
        .then(data => cache[key] = data)
        .catch(() => cache[key] = null);
}

export function data(school) {
    return cache[schoolKey(school)] || null;
}

function inRing(point, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i];
        const [xj, yj] = ring[j];
        if ((yi > point.lat) !== (yj > point.lat)
            && point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi) {
            inside = !inside;
        }
    }
    return inside;
}

export function inPolygon(point, polygon) {
    const [outer, ...holes] = polygon;
    return inRing(point, outer) && !holes.some(hole => inRing(point, hole));
}

function routeKey(school, home) {
    return `${schoolKey(school)}|${home.lat.toFixed(5)},${home.lng.toFixed(5)}`;
}

// Ask Google for the walk from home to each school not already looked up for this home.
export function lookupWalks(schools, home) {
    const google = window.google;
    if (!home || !google?.maps?.DistanceMatrixService) return;
    const todo = schools.filter(school => !(routeKey(school, home) in routes));
    if (!todo.length) return;
    todo.forEach(school => routes[routeKey(school, home)] = undefined);
    new google.maps.DistanceMatrixService().getDistanceMatrix({
        origins: [home],
        destinations: todo.map(school => school.centre),
        travelMode: google.maps.TravelMode.WALKING,
    }, (response, status) => {
        todo.forEach((school, i) => {
            const element = status === 'OK' ? response.rows[0]?.elements[i] : null;
            routes[routeKey(school, home)] = element?.status === 'OK'
                ? {miles: element.distance.value / METRES_PER_MILE}
                : null;
        });
    });
}

// Walking distance from home to school as a band in miles. From Google it's
// exact ({low: 1.2, high: 1.2, routed: true}); from CI bands it's a range, with
// `beyond` set when home is further than the furthest band computed.
export function estimate(school, home) {
    if (!home) return null;
    const route = routes[routeKey(school, home)];
    if (route) return {low: route.miles, high: route.miles, routed: true};
    const walk = data(school);
    if (!walk) return null;
    let low = 0;
    for (const band of walk.bands) {
        if (inPolygon(home, band.polygon)) {
            return {low: low / METRES_PER_MILE, high: band.metres / METRES_PER_MILE};
        }
        low = band.metres;
    }
    return {low: low / METRES_PER_MILE, high: null, beyond: true};
}

// Inside/outside test against a year's cut-off outline: the one CI built, or
// failing that a hand-made outline in the school data (`intakePath`).
export function insideCutoff(school, year, home) {
    if (!home) return null;
    const outline = data(school)?.cutoffs?.[year]?.polygon
        || (school.intakePath?.[year] ? [school.intakePath[year]] : null);
    return outline ? inPolygon(home, outline) : null;
}

export function cutoffOutline(school, year) {
    return data(school)?.cutoffs?.[year]?.polygon?.[0] || null;
}

export default {schoolKey, load, data, lookupWalks, estimate, insideCutoff, cutoffOutline, inPolygon, METRES_PER_MILE};
