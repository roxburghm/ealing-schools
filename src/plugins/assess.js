// Works out how a home location compares with each school's past offer distances.

export const YEARS = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];

export function milesBetween(a, b) {
    const R = 3958.8;
    const r = Math.PI / 180;
    const dLat = (b.lat - a.lat) * r;
    const dLng = (b.lng - a.lng) * r;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// polygon is an array of [lng, lat] pairs, as stored in schools.js intakePath
export function insidePolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        if (((yi > point.lat) !== (yj > point.lat)) &&
            (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
}

export function formatMiles(mi) {
    if (typeof mi !== 'number' || isNaN(mi)) return '–';
    return mi.toFixed(2) + ' mi';
}

// Verdict categories, best first. Used for sorting and styling.
export const KIND_ORDER = ['likely', 'open', 'possible', 'unlikely', 'outside', 'none', 'nohome'];

/**
 * For each year: null = everyone who applied was offered a place (counts as "in"),
 * 0 = no places offered on distance (year not counted), number = furthest distance offered.
 * Schools with a walking-distance polygon for a year are judged by the polygon instead.
 */
export function assess(school, home) {
    const dist = home ? milesBetween(home, school.centre) : null;
    let counted = 0, inside = 0, open = 0;

    YEARS.forEach(year => {
        const cut = school.intakeDist[year];
        if (cut === undefined || cut === 0) return;
        counted++;
        if (cut === null) {
            open++;
            inside++;
            return;
        }
        if (!home) return;
        const poly = school.intakePath && school.intakePath[year];
        if (poly ? insidePolygon(home, poly) : dist <= cut) inside++;
    });

    let kind, verdict, sub;
    if (counted === 0) {
        kind = 'none'; verdict = 'No data'; sub = 'No distance offers recorded';
    } else if (open === counted) {
        kind = 'open'; verdict = 'Everyone offered'; sub = `Places for all applicants, ${YEARS[0]}–${YEARS[YEARS.length - 1].slice(2)}`;
    } else if (!home) {
        kind = 'nohome'; verdict = 'Set your home'; sub = 'Add your home to see your chances';
    } else {
        const ratio = inside / counted;
        if (ratio === 1) { kind = 'likely'; verdict = 'Very likely'; }
        else if (ratio >= 0.5) { kind = 'possible'; verdict = 'Possible'; }
        else if (ratio > 0) { kind = 'unlikely'; verdict = 'Unlikely'; }
        else { kind = 'outside'; verdict = 'Outside'; }
        sub = `Inside the distance in ${inside} of ${counted} years`;
        if (open > 0) sub += `, ${open} with places for all`;
    }
    if (school.intakePath) sub += ' (walking route)';
    else if (school.notes) sub += ' · see notes';

    return {kind, verdict, sub, dist, score: counted ? inside / counted : 0};
}
