const schoolsList = [
    {
        name: 'Ada Lovelace CofE High School',
        shortName: 'Ada Lovelace',
        intakeDist: { 2019: 0.749,  "2020": 0.885, "2021": 0.726 },
        visible: true, rating: 'good',
        centre: {lat: 51.5194566, lng: -0.2976813},
        description: '', website: 'https://adalovelace.org.uk/', colour: '#008f91'
    },
    {
        name: 'Alec Reed Academy',
        shortName: 'Alec Reed',
        intakeDist: { 2019: null,  "2020": null, "2021": null },
        visible: false, rating: 'good',
        centre: {lat: 51.5434164, lng: -0.3865475},
        description: '',
        website: 'https://www.alecreedacademy.co.uk/',
        colour: '#004a85'
    },
    {
        name: 'Ark Acton Academy',
        shortName: 'Ark Acton',
        intakeDist: { 2019: null,  "2020": null, "2021": null },
        visible: false, rating: 'inadequate',
        centre: {lat: 51.5057664, lng: -0.2829261},
        description: '', website: 'https://arkacton.org/', colour: '#be0c33'
    },
    {
        name: 'Ark Soane Academy',
        shortName: 'Ark Soane',
        intakeDist: { 2019: 0,  "2020": 0, "2021": null },
        visible: false, rating: 'unknown',
        centre: {lat: 51.5076062, lng: -0.2788907},
        description: '',
        website: 'https://arksoane.org/',
        colour: '#64a0c8'
    },
    {
        name: 'Brentside High School',
        shortName: 'Brentside',
        intakeDist: { 2019: 2.062,  "2020": null, "2021": null },
        visible: false, rating: 'good',
        centre: {lat: 51.5266992, lng: -0.342944},
        description: '', website: 'http://www.brentsidehigh.ealing.sch.uk/', colour: '#ce172e'
    },
    {
        name: 'Dormers Wells High School',
        shortName: 'Dormers Wells',
        intakeDist: { 2019: 1.058,  "2020": 1.123, "2021": 1.183 },
        visible: false, rating: 'good',
        centre: {lat: 51.5194244, lng: -0.3685105},
        description: '', website: 'https://www.dwhs.co.uk/', colour: '#467cb4'
    },
    {
        name: 'Drayton Manor High School',
        shortName: 'Drayton Manor',
        intakeDist: { 2019: 0.780,  "2020": 1.434, "2021": 0.897 },
        visible: true, rating: 'outstanding',
        centre: {lat: 51.5155277, lng: -0.3379051},
        description: '', website: 'http://www.draytonmanorhighschool.co.uk/',
        colour: '#651968'
    },
    {
        name: 'Ealing Fields',
        shortName: 'Ealing Fields',
        intakeDist: { 2019: 0.557,  "2020": 0.637, "2021": 0.545 },
        visible: true, rating: 'good',
        centre: {lat: 51.4959126, lng: -0.314284},
        description: '',
        website: 'https://ealingfields.org.uk/',
        colour: '#f2a900'
    },

    {
        name: 'Elthorne Park High School',
        shortName: 'Elthorne Park',
        intakeDist: { 2019: 0.705,  "2020": 0.920, "2021": 0.701 },
        visible: true,
        rating: 'outstanding',
        centre: {lat: 51.500134, lng: -0.332443},
        description: '',
        website: 'http://www.ephs.ealing.sch.uk/',
        colour: '#8d2424'
    },
    {
        name: 'Featherstone High School',
        shortName: 'Featherstone',
        intakeDist: { 2019: 0.501,  "2020": 0.522, "2021": 0.439 },
        visible: false,
        rating: 'outstanding',
        centre: {lat: 51.4991769, lng: -0.389611},
        description: '',
        website: 'https://www.featherstonehigh.ealing.sch.uk/',
        colour: '#1e1344'
    },
    {
        name: 'Greenford High School',
        shortName: 'Greenford',
        intakeDist: { 2019: 0.699,  "2020": 0.621, "2021": 0.626 },
        visible: false,
        rating: 'outstanding',
        centre: {lat: 51.5308567, lng: -0.3725397},
        description: '',
        website: 'http://www.greenford.ealing.sch.uk/',
        colour: '#2fa866'
    },
    {
        name: 'Northolt High School',
        shortName: 'Northolt',
        intakeDist: { 2019: null,  "2020": null, "2021": null },
        visible: false,
        rating: 'good',
        centre: {lat: 51.5522822, lng: -0.378429},
        description: '',
        website: 'http://www.northolthigh.org.uk/',
        colour: '#3b87a4'
    },
    {
        name: 'The Cardinal Wiseman Catholic School',
        shortName: 'Cardinal Wiseman',
        intakeDist: { 2019: 2.103,  "2020": 2.158, "2021": 3.609 },
        visible: false,
        rating: 'outstanding',
        centre: {lat: 51.5252293, lng: -0.3550039},
        description: '',
        website: 'http://www.wiseman.ealing.sch.uk/',
        colour: '#3c26b7'
    },
    {
        name: 'The Ellen Wilkinson School for Girls',
        shortName: 'Ellen Wilkinson',
        intakeDist: { 2019: 3.540,  "2020": 3.210, "2021": 2.531 },
        visible: false,
        rating: 'outstanding',
        centre: {lat: 51.5163058, lng: -0.289338},
        description: '',
        website: 'http://www.ellenwilkinson.ealing.sch.uk/',
        colour: '#f0b600'
    },
    {
        name: 'Twyford CofE High School',
        shortName: 'Twyford',
        intakeDist: { 2019: 0.323,  "2020": 0.357, "2021": 0.585 },
        visible: true,
        rating: 'outstanding',
        centre: {lat: 51.5089613, lng: -0.2820638},
        description: '',
        website: 'https://www.twyford.ealing.sch.uk/',
        colour: '#da1935'
    },
    {
        name: 'Villiers High School',
        shortName: 'Villiers',
        intakeDist: { 2019: null,  "2020": null, "2021": null },
        visible: false, rating: 'outstanding',
        centre: {lat: 51.5096153, lng: -0.3755694},
        description: '', website: 'http://www.villiers.ealing.sch.uk/', colour: '#337ab7'
    },
    {
        name: 'William Perkin CofE High School',
        shortName: 'William Perkin',
        intakeDist: { 2019: 0.375,  "2020": 0.315, "2021": 0.346 },
        visible: false, rating: 'outstanding',
        centre: {lat: 51.5373645, lng: -0.3515391},
        description: '',
        website: 'https://www.williamperkin.org.uk/',
        colour: '#623580'
    },
];

schoolsList.forEach(school => {
    let average = 0;
    let values = 0;
    for (let i in school.intakeDist) {
        let val = school.intakeDist[i];
        if (val !== null && val > 0) {
            average += val;
            values++;
        }
    }

    if (values === 0) {
        average = school.intakeDist['2020'];
    } else {
        average = average / values;
    }

    school.intakeDist['average'] = average;
});


export default schoolsList;
