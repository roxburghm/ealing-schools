import {reactive} from 'vue';

// Walking distances are precomputed in CI (scripts/walking-bands.mjs) as nested
// isochrone bands around each school, so a visitor's address never leaves the
// browser. Each file in /data/walk holds:
//   bands:   [{metres, polygon}]  ascending; polygon = GeoJSON Polygon coordinates
//   cutoffs: {year: {metres, polygon}}  exact outline at that year's cut-off

export const METRES_PER_MILE = 1609.344;

const cache = reactive({});

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

// Walking distance from home to school as a band in miles, e.g. {low: 0.9, high: 0.96}.
// `beyond` is set when home is further than the furthest band computed.
export function estimate(school, home) {
    const walk = data(school);
    if (!walk || !home) return null;
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

export default {schoolKey, load, data, estimate, insideCutoff, cutoffOutline, inPolygon, METRES_PER_MILE};
