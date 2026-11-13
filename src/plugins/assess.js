// Turns a home's year-by-year standing at a school into one verdict for the
// ranked list. Each year's answer comes from admission.status, so walking-distance
// schools use the precomputed walking data and near misses count as too close to call.

import admission from './admission';
import walking from './walking';
import DistanceUtils from './distanceUtils';

export const YEARS = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];

export function formatMiles(mi) {
    if (typeof mi !== 'number' || isNaN(mi)) return '–';
    return mi.toFixed(2) + ' mi';
}

// Verdict categories, best first. Used for sorting and styling.
export const KIND_ORDER = ['likely', 'open', 'possible', 'unlikely', 'outside', 'pending', 'none', 'nohome'];

// How far home is from the school, in the way the school measures it.
function distance(school, home) {
    if (!home) return {dist: null, label: null};
    const straight = DistanceUtils.getDistanceInMiles(home, school.centre);
    if (admission.measure(school) !== 'walk') return {dist: straight, label: `${formatMiles(straight)} away`};
    const walk = walking.estimate(school, home);
    if (walk && !walk.beyond) {
        const mid = (walk.low + walk.high) / 2;
        return {dist: mid, label: `~${formatMiles(mid)} walk`};
    }
    return {dist: straight, label: `${formatMiles(straight)} away`};
}

/**
 * For each year: null = everyone who applied was offered a place (counts as "in"),
 * 0 = no places offered on distance (year not counted), number = furthest distance offered.
 */
export function assess(school, home) {
    const {dist, label} = distance(school, home);
    let counted = 0, inside = 0, open = 0, close = 0, unknown = 0;

    YEARS.forEach(year => {
        const cut = school.intakeDist[year];
        if (cut === undefined || cut === 0) return;
        if (cut === null) {
            counted++;
            open++;
            inside++;
            return;
        }
        if (!home) {
            counted++;
            return;
        }
        const kind = admission.status(school, year, home).kind;
        if (kind === 'pending') {
            unknown++;
            return;
        }
        counted++;
        if (kind === 'in') inside++;
        else if (kind === 'close') close++;
    });

    let kind, verdict, sub;
    if (counted === 0 && unknown === 0) {
        kind = 'none'; verdict = 'No data'; sub = 'No distance offers recorded';
    } else if (counted > 0 && open === counted && unknown === 0) {
        kind = 'open'; verdict = 'Everyone offered'; sub = `Places for all applicants, ${YEARS[0]}–${YEARS[YEARS.length - 1].slice(2)}`;
    } else if (!home) {
        kind = 'nohome'; verdict = 'Set your home'; sub = 'Add your home to see your chances';
    } else if (counted === 0) {
        kind = 'pending'; verdict = 'Not yet known'; sub = 'Walking distance not yet calculated';
    } else {
        // A too-close-to-call year counts as half.
        const ratio = (inside + close / 2) / counted;
        if (ratio === 1) { kind = 'likely'; verdict = 'Very likely'; }
        else if (ratio >= 0.5) { kind = 'possible'; verdict = 'Possible'; }
        else if (ratio > 0) { kind = 'unlikely'; verdict = 'Unlikely'; }
        else { kind = 'outside'; verdict = 'Outside'; }
        sub = `Inside the distance in ${inside} of ${counted} years`;
        if (close > 0) sub += `, ${close} too close to call`;
        if (open > 0) sub += `, ${open} with places for all`;
        if (unknown > 0) sub += `; ${unknown} not yet known`;
    }
    if (admission.measure(school) === 'walk') sub += ' (walking distance)';
    else if (school.notes) sub += ' · see notes';

    let score = 0;
    if (counted) score = (inside + close / 2) / counted;
    return {kind, verdict, sub, dist, distLabel: label, score};
}
