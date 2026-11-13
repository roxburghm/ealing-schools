#!/usr/bin/env node
// Builds walking-distance data for schools that measure walking distance,
// using GraphHopper's Isochrone API. Output goes to public/data/walk/<school>.json
// and is read by src/plugins/walking.js, so the visitor's address is never sent anywhere.
//
//   GRAPHHOPPER_API_KEY=... node scripts/walking-bands.mjs [--force] [--all] [--school "Drayton Manor"] [--step 100] [--dry-run]
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
const API = 'https://graphhopper.com/api/1/isochrone';
const METRES_PER_MILE = 1609.344;
const PAUSE_MS = 1500;

const args = process.argv.slice(2);
const flag = name => args.includes(`--${name}`);
const option = (name, fallback) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const key = process.env.GRAPHHOPPER_API_KEY;
const step = Number(option('step', 100));
const only = option('school', null);
const dryRun = flag('dry-run');

if (!key && !dryRun) {
    console.error('Set GRAPHHOPPER_API_KEY (or pass --dry-run to see what would be fetched).');
    process.exit(1);
}

async function loadSchools() {
    // schools.js is an ES module inside a CommonJS package, so import a copy as .mjs.
    const copy = path.join(os.tmpdir(), `schools-${process.pid}.mjs`);
    fs.copyFileSync(path.join(ROOT, 'src/plugins/schools.js'), copy);
    try {
        return (await import(pathToFileURL(copy).href)).default;
    } finally {
        fs.rmSync(copy, {force: true});
    }
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

async function isochrone(school, distanceLimit, buckets) {
    const params = new URLSearchParams({
        point: `${school.centre.lat},${school.centre.lng}`,
        profile: 'foot',
        distance_limit: String(distanceLimit),
        buckets: String(buckets),
        reverse_flow: 'true',
        key,
    });
    const response = await fetch(`${API}?${params}`);
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

    const bandPolygons = await isochrone(school, limit, buckets);
    const bands = bandPolygons.map((polygon, i) => ({metres: (i + 1) * step, polygon}));

    const outlines = {};
    for (const [year, distance] of Object.entries(metres)) {
        const [polygon] = await isochrone(school, distance, 1);
        outlines[year] = {metres: distance, polygon};
    }

    fs.mkdirSync(OUT_DIR, {recursive: true});
    fs.writeFileSync(file, JSON.stringify({
        school: school.name,
        generated: new Date().toISOString().slice(0, 10),
        source: 'GraphHopper Isochrone API, foot profile, © OpenStreetMap contributors',
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
