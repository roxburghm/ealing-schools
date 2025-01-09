function getHumanDistanceInMiles(dist, locale, unitSystem, forceSign) {
    const result = unitSystem === 'metric'
        ? {distance: dist * 1.609, unit: 'km', smallUnit: 'm', factor: 1000, smallBorder: 0.9}
        : {distance: dist, unit: 'mi', smallUnit: 'yds', factor: 1760, smallBorder: 1000 / 1760}

    const formatter = new Intl.NumberFormat(locale, { maximumSignificantDigits: 2 })
    if (result.distance < result.smallBorder) {
        let distance = result.distance * result.factor
        // if (distance < 40) return `< 50 ${result.smallUnit}`

        distance = Math.round(distance / 10) * 10;
        const sign = forceSign && dist > 0 ? '+' : '';
        return `${sign}${formatter.format(distance)} ${result.smallUnit}`
    }
    return `${formatter.format(result.distance)} ${result.unit}`
}

function getDistanceInMiles(loc1, loc2) {
    const R = 3958.8; // Radius of the earth in miles
    const dLat = deg2rad(loc2.lat - loc1.lat);  // deg2rad below
    const dLon = deg2rad(loc2.lng - loc1.lng);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(loc1.lat)) * Math.cos(deg2rad(loc2.lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

export default {
    getHumanDistanceInMiles,
    getDistanceInMiles
}
