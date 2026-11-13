// Ofsted stopped giving schools a single overall grade in September 2024, and
// from November 2025 inspections produce a "report card" grading each area
// separately. Older graded inspections stay in `school.rating` / `ratingDate`;
// anything newer lives in `school.ofsted.latest`.

const REPORT_CARD_SCALE = ['exceptional', 'strong standard', 'expected standard', 'needs attention', 'urgent improvement'];
const LEGACY_SCALE = ['outstanding', 'good', 'requires improvement', 'inadequate'];

const GRADE_COLOURS = {
    'exceptional': 'green-darken-2',
    'outstanding': 'green-darken-2',
    'strong standard': 'green',
    'good': 'green',
    'expected standard': 'blue-grey',
    'requires improvement': 'orange-darken-2',
    'needs attention': 'orange-darken-2',
    'inadequate': 'red-darken-2',
    'urgent improvement': 'red-darken-2',
};

const OUTCOMES = {
    maintained: 'standards confirmed',
    improving: 'may have improved',
};

// Five-step tone shared by both scales, for badges: top, good, mid, warn, bad.
const GRADE_TONES = {
    'exceptional': 'top', 'outstanding': 'top',
    'strong standard': 'good', 'good': 'good',
    'expected standard': 'mid',
    'needs attention': 'warn', 'requires improvement': 'warn',
    'urgent improvement': 'bad', 'inadequate': 'bad',
};

function gradeTone(grade) {
    return GRADE_TONES[(grade || '').toLowerCase()] || 'none';
}

function gradeColour(grade) {
    return GRADE_COLOURS[(grade || '').toLowerCase()] || 'grey';
}

function capitalise(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function formatMonth(isoDate) {
    if (!isoDate) return '';
    return new Date(isoDate).toLocaleDateString('en-GB', {month: 'short', year: 'numeric'});
}

// The grade most areas share, e.g. "Mostly strong standard". Returns "Mixed"
// when no grade covers more than half the areas.
function predominantGrade(areas, scale) {
    const grades = Object.values(areas);
    const counts = {};
    grades.forEach(grade => counts[grade] = (counts[grade] || 0) + 1);
    const top = scale.find(grade => counts[grade] > grades.length / 2);
    if (!top) return {grade: null, label: 'Mixed grades'};
    return {grade: top, label: counts[top] === grades.length ? `All ${top}` : `Mostly ${top}`};
}

function gradeCounts(areas, scale) {
    const counts = {};
    Object.values(areas).forEach(grade => counts[grade] = (counts[grade] || 0) + 1);
    return scale.filter(grade => counts[grade]).map(grade => ({grade, count: counts[grade]}));
}

// One summary used by the list, map table and school popup.
function summary(school) {
    const latest = school.ofsted?.latest;
    const legacy = school.rating && school.rating !== 'unknown'
        ? {grade: school.rating, date: school.ratingDate}
        : null;
    // Only an earlier inspection's grade counts as the "last overall grade".
    const previous = legacy && latest && legacy.date < latest.date ? legacy : null;

    if (latest?.type === 'reportCard') {
        const top = predominantGrade(latest.areas, REPORT_CARD_SCALE);
        return {
            kind: 'reportCard',
            grade: top.grade,
            label: capitalise(top.label),
            colour: gradeColour(top.grade),
            date: latest.date,
            caption: `Report card · ${formatMonth(latest.date)}`,
            areas: latest.areas,
            counts: gradeCounts(latest.areas, REPORT_CARD_SCALE),
            safeguarding: latest.safeguarding,
            previous,
        };
    }

    if (latest?.type === 'keyJudgements') {
        const top = predominantGrade(latest.areas, LEGACY_SCALE);
        return {
            kind: 'keyJudgements',
            grade: top.grade,
            label: capitalise(top.label),
            colour: gradeColour(top.grade),
            date: latest.date,
            caption: `Area grades · ${formatMonth(latest.date)}`,
            areas: latest.areas,
            counts: gradeCounts(latest.areas, LEGACY_SCALE),
            previous,
        };
    }

    if (!legacy) {
        return {kind: 'none', label: 'Not yet inspected', colour: 'grey', caption: ''};
    }

    const confirmed = latest?.type === 'ungraded'
        ? `${OUTCOMES[latest.outcome] || 'checked'} ${formatMonth(latest.date)}`
        : null;

    return {
        kind: 'graded',
        grade: legacy.grade,
        label: capitalise(legacy.grade),
        colour: gradeColour(legacy.grade),
        date: legacy.date,
        caption: `Graded ${formatMonth(legacy.date)}` + (confirmed ? ` · ${confirmed}` : ''),
        confirmed,
    };
}

function reportUrl(school) {
    return school.ofsted?.urn ? `https://reports.ofsted.gov.uk/provider/23/${school.ofsted.urn}` : null;
}

export default {
    summary,
    reportUrl,
    gradeColour,
    gradeTone,
    formatMonth,
    capitalise,
};
