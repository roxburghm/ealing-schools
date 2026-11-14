#!/usr/bin/env node
// Builds walking-distance data for schools that measure walking distance, from
// OpenStreetMap walking isochrones. Output goes to public/data/walk/<school>.json
// and is read by src/plugins/walking.js, so the visitor's address is never sent anywhere.
//
//   node scripts/walking-bands.mjs [--force] [--all] [--school "Drayton Manor"] [--step 100] [--dry-run]
//
// Isochrones come from the public Valhalla server run by FOSSGIS (no key needed).
// With GRAPHHOPPER_API_KEY set and --provider graphhopper they come from GraphHopper
// instead, which needs a plan that includes its Isochrone API (the free plan doesn't).
//
// For each school it writes:
//   bands   nested polygons every --step metres out to a little past the largest cut-off,
//           used to estimate how far a home is from the school on foot
//   cutoffs one polygon per year at exactly that year's cut-off, used for inside/outside
//
// Files are skipped when their inputs haven't changed, so re-running is cheap.
// GraphHopper's free plan allows 500 credits a day; isochrones cost roughly
// 2 credits per minute of walking explored (minimum 10).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public/data/walk');
const GRAPHHOPPER_API = 'https://graphhopper.com/api/1/isochrone';
const VALHALLA_API = 'https://valhalla1.openstreetmap.de/isochrone';
const VALHALLA_MAX_CONTOURS = 4;
const METRES_PER_MILE = 1609.344;
const PAUSE_MS = 1500;

const args = process.argv.slice(2);
const flag = name => args.includes(`--${name}`);
const option = (name, fallback) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const key = process.env.GRAPHHOPPER_API_KEY;
const provider = option('provider', 'valhalla');
const step = Number(option('step', 100));
const only = option('school', null);
const dryRun = flag('dry-run');

if (!['valhalla', 'graphhopper'].includes(provider)) {
    console.error(`Unknown provider "${provider}": use valhalla or graphhopper.`);
    process.exit(1);
}
if (provider === 'graphhopper' && !key && !dryRun) {
    console.error('Set GRAPHHOPPER_API_KEY (or pass --dry-run to see what would be fetched).');
    process.exit(1);
}
const SOURCE = provider === 'graphhopper'
    ? 'GraphHopper Isochrone API, foot profile, © OpenStreetMap contributors'
    : 'Valhalla (FOSSGIS), pedestrian costing, © OpenStreetMap contributors';

async function loadSchools() {
    // Each borough's list is an ES module inside a CommonJS package, so import a copy as .mjs.
    const dir = path.join(ROOT, 'src/data');
    const files = fs.readdirSync(dir).filter(name => name.endsWith('.js'));
    const schools = [];
    for (const name of files) {
        const copy = path.join(os.tmpdir(), `schools-${process.pid}-${name.replace(/\.js$/, '.mjs')}`);
        fs.copyFileSync(path.join(dir, name), copy);
        try {
            const list = (await import(pathToFileURL(copy).href)).default;
            if (Array.isArray(list)) schools.push(...list); // skip boroughs.js, outlines.js and the like
        } finally {
            fs.rmSync(copy, {force: true});
        }
    }
    return schools;
}

function schoolKey(school) {
    return school.shortName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function cutoffs(school) {
    return Object.fromEntries(Object.entries(school.intakeDist)
        .filter(([year, miles]) => /^\d{4}$/.test(year) && miles > 0)
        .map(([year, miles]) => [year, Math.round(miles * METRES_PER_MILE)]));
}

// Far enough past the largest cut-off to tell a near miss from a clear miss.
function bandLimit(school, metres) {
    const largest = Math.max(0, ...Object.values(metres));
    const walkFactor = school.measure === 'walk' ? 1 : 1.4;
    return Math.min(5000, Math.ceil((largest * walkFactor + 800) / step) * step);
}

function round(coordinates) {
    return coordinates.map(ring => ring.map(([lng, lat]) => [+lng.toFixed(5), +lat.toFixed(5)]));
}

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function graphhopper(school, distanceLimit, buckets) {
    const params = new URLSearchParams({
        point: `${school.centre.lat},${school.centre.lng}`,
        profile: 'foot',
        distance_limit: String(distanceLimit),
        buckets: String(buckets),
        reverse_flow: 'true',
        key,
    });
    const response = await fetch(`${GRAPHHOPPER_API}?${params}`);
    const credits = response.headers.get('x-ratelimit-credits');
    const remaining = response.headers.get('x-ratelimit-remaining');
    if (!response.ok) {
        const body = await response.text();
        throw new Error(`GraphHopper ${response.status} for ${school.shortName} (${distanceLimit} m, ${buckets} buckets): ${body.slice(0, 300)}`);
    }
    const json = await response.json();
    console.log(`  ${distanceLimit} m × ${buckets}: ${credits ?? '?'} credits, ${remaining ?? '?'} left today`);
    await pause(PAUSE_MS);
    return json.polygons
        .sort((a, b) => a.properties.bucket - b.properties.bucket)
        .map(feature => {
            if (feature.geometry.type !== 'Polygon') {
                throw new Error(`Unexpected ${feature.geometry.type} for ${school.shortName}`);
            }
            return round(feature.geometry.coordinates);
        });
}

// Valhalla gives at most four contours a request, so ask in groups. A contour can
// come back as several pieces; keep the one around the school.
async function valhalla(school, distances) {
    const polygons = [];
    for (let i = 0; i < distances.length; i += VALHALLA_MAX_CONTOURS) {
        const group = distances.slice(i, i + VALHALLA_MAX_CONTOURS);
        const response = await fetch(VALHALLA_API, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'User-Agent': 'ealing-schools walking-bands'},
            body: JSON.stringify({
                locations: [{lat: school.centre.lat, lon: school.centre.lng}],
                costing: 'pedestrian',
                contours: group.map(metres => ({distance: metres / 1000})),
                polygons: true,
                reverse: true,
            }),
        });
        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Valhalla ${response.status} for ${school.shortName} (${group.join(', ')} m): ${body.slice(0, 300)}`);
        }
        const json = await response.json();
        if (json.features?.length !== group.length) {
            throw new Error(`Valhalla gave ${json.features?.length ?? 0} contours for ${group.length} asked (${school.shortName})`);
        }
        // Contours come back rounded (0.7 km as 0.69), so match each to the nearest.
        group.forEach(metres => {
            const {geometry} = json.features.reduce((best, f) =>
                Math.abs(f.properties.contour * 1000 - metres) < Math.abs(best.properties.contour * 1000 - metres) ? f : best);
            polygons.push(round(mainPolygon(geometry, school.centre)));
        });
        console.log(`  ${group.join(', ')} m`);
        await pause(PAUSE_MS);
    }
    return polygons;
}

function ringContains([lng, lat], ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i];
        const [xj, yj] = ring[j];
        if ((yi > lat) !== (yj > lat) && lng < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
}

function mainPolygon(geometry, centre) {
    if (geometry.type === 'Polygon') return geometry.coordinates;
    if (geometry.type !== 'MultiPolygon') throw new Error(`Unexpected ${geometry.type}`);
    const point = [centre.lng, centre.lat];
    return geometry.coordinates.find(polygon => ringContains(point, polygon[0]))
        || geometry.coordinates.reduce((a, b) => (b[0].length > a[0].length ? b : a));
}

// Polygons for each distance in metres, smallest first.
async function isochrones(school, distances) {
    if (provider === 'valhalla') return valhalla(school, distances);
    // GraphHopper: evenly spaced buckets in one call, or one call per odd distance.
    const evenly = distances.every((metres, i) => metres === (i + 1) * distances[0]);
    if (evenly) return graphhopper(school, distances[distances.length - 1], distances.length);
    const polygons = [];
    for (const metres of distances) polygons.push((await graphhopper(school, metres, 1))[0]);
    return polygons;
}

async function build(school) {
    const metres = cutoffs(school);
    const limit = bandLimit(school, metres);
    const inputs = {centre: school.centre, step, limit, cutoffs: metres};
    const file = path.join(OUT_DIR, `${schoolKey(school)}.json`);

    if (!flag('force') && fs.existsSync(file)) {
        const existing = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (JSON.stringify(existing.inputs) === JSON.stringify(inputs)) {
            console.log(`${school.shortName}: up to date`);
            return;
        }
    }

    const buckets = Math.round(limit / step);
    console.log(`${school.shortName}: bands to ${limit} m in ${buckets} steps, ${Object.keys(metres).length} cut-off outlines`);
    if (dryRun) return;

    const bandMetres = Array.from({length: buckets}, (_, i) => (i + 1) * step);
    const bandPolygons = await isochrones(school, bandMetres);
    const bands = bandPolygons.map((polygon, i) => ({metres: bandMetres[i], polygon}));

    const years = Object.keys(metres);
    const outlinePolygons = await isochrones(school, years.map(year => metres[year]));
    const outlines = Object.fromEntries(years.map((year, i) => [year, {metres: metres[year], polygon: outlinePolygons[i]}]));

    fs.mkdirSync(OUT_DIR, {recursive: true});
    fs.writeFileSync(file, JSON.stringify({
        school: school.name,
        generated: new Date().toISOString().slice(0, 10),
        source: SOURCE,
        inputs,
        bands,
        cutoffs: outlines,
    }) + '\n');
    console.log(`  wrote ${path.relative(ROOT, file)}`);
}

const schools = (await loadSchools())
    .filter(school => flag('all') || school.measure === 'walk')
    .filter(school => !only || school.shortName.toLowerCase() === only.toLowerCase());

if (!schools.length) {
    console.error(only ? `No school matches "${only}".` : 'No schools measure walking distance.');
    process.exit(1);
}

for (const school of schools) {
    await build(school);
}
