function getRatingColor(rating) {

    switch (rating.toLowerCase()) {
        case 'outstanding':
            return 'green';
        case 'good':
            return 'orange';
        case 'inadequate':
            return 'red';
        default:
            return 'grey';
    }
}

function getConfidenceColor(confidence) {
    if (confidence === null || confidence === undefined) {
        return 'grey';
    }

    switch (confidence.toLowerCase()) {
        case 'low':
            return 'red lighten-2';
        case 'medium':
            return 'orange';
        case 'high':
            return 'green';
        default:
            return 'grey';
    }
}

export default  {
    getRatingColor,
    getConfidenceColor
}
