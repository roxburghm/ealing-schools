import DistanceUtils from './distanceUtils';
import walking from './walking';

// Within this many miles of the cut-off we call it too close to call: the
// council measures from its own address points, not the geocoded address.
const CLOSE_MILES = 0.03;

export function measure(school) {
    return school.measure === 'walk' ? 'walk' : 'straight';
}

export function measureLabel(school) {
    return measure(school) === 'walk' ? 'walking distance' : 'straight-line distance';
}

// How a home address compares with a school's cut-off for one year.
// kind: 'all' everyone offered · 'none' no places by distance · 'in' · 'out'
//       'close' within the margin of error · 'cutoff' no home set · 'unknown'
export function status(school, year, home) {
    const cutoff = school.intakeDist[year];
    const how = measure(school);

    if (cutoff === undefined) return {kind: 'unknown', measure: how};
    if (cutoff === null) return {kind: 'all', measure: how};
    if (cutoff === 0) return {kind: 'none', measure: how};
    if (!home) return {kind: 'cutoff', cutoff, measure: how};

    const straight = DistanceUtils.getDistanceInMiles(school.centre, home);

    if (how === 'straight') {
        return classify(cutoff, {low: straight, high: straight}, how, straight);
    }

    // Walking is never shorter than the straight line, so a home beyond the
    // cut-off as the crow flies is out whatever the route.
    const walk = walking.estimate(school, home);
    const exact = walking.insideCutoff(school, year, home);

    // An exact walk from Google: compare it directly. A near miss stays "too
    // close to call" because the council's own route may differ.
    if (walk?.routed) return classify(cutoff, walk, how, straight);
    if (exact !== null && walk) {
        const result = classify(cutoff, walk, how, straight);
        if (result.kind === 'close') result.kind = exact ? 'in' : 'out';
        return {...result, exact: true};
    }
    if (walk && !walk.beyond) return classify(cutoff, walk, how, straight);
    if (straight > cutoff || walk?.beyond) {
        return {kind: 'out', cutoff, measure: how, straight, home: walk, margin: cutoff - (walk?.low ?? straight), lowerBound: true};
    }
    // An outline but no distance bands: we know which side, not by how much.
    if (exact !== null) {
        return {kind: exact ? 'in' : 'out', cutoff, measure: how, straight, margin: null, exact: true, outlineOnly: true};
    }
    return {kind: 'pending', cutoff, measure: how, straight, margin: null};
}

function classify(cutoff, range, how, straight) {
    const mid = (range.low + range.high) / 2;
    const margin = cutoff - mid;
    let kind;
    if (range.high <= cutoff - CLOSE_MILES) kind = 'in';
    else if (range.low > cutoff + CLOSE_MILES) kind = 'out';
    else kind = 'close';
    return {kind, cutoff, measure: how, straight, home: range, homeMiles: mid, margin};
}

export const STATUS_TEXT = {
    all: 'Everyone offered',
    none: 'No places by distance',
    in: 'Inside cut-off',
    out: 'Outside cut-off',
    close: 'Too close to call',
    pending: 'Walking distance not yet calculated',
    unknown: 'No data',
};

export const STATUS_COLOUR = {
    all: 'success',
    in: 'success',
    close: 'warning',
    out: 'error',
    none: 'grey',
    pending: 'grey',
    unknown: 'grey',
    cutoff: 'primary',
};

export const STATUS_ICON = {
    all: 'mdi-check-all',
    in: 'mdi-check-circle',
    close: 'mdi-help-circle',
    out: 'mdi-close-circle',
    none: 'mdi-minus-circle-outline',
    pending: 'mdi-timer-sand',
    unknown: 'mdi-minus-circle-outline',
};

export default {status, measure, measureLabel, STATUS_TEXT, STATUS_COLOUR, STATUS_ICON};
