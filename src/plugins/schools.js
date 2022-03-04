const schoolsList = [
    {
        name: 'Ada Lovelace CofE High School',
        shortName: 'Ada Lovelace',
        intakeDist: {2019: 0.749, "2020": 0.885, "2021": 0.726, "2022": 0.626},
        visible: true,
        radius: true,
        notes: null,
        rating: 'good',
        centre: {lat: 51.519450765628406, lng: -0.2952921864810334},
        description: '',
        website: 'https://adalovelace.org.uk/',
        colour: '#008f91'
    },
    {
        name: 'Alec Reed Academy',
        shortName: 'Alec Reed',
        intakeDist: {2019: null, "2020": null, "2021": null, "2022": null},
        visible: false,
        radius: true,
        notes: null,
        rating: 'good',
        centre: {lat: 51.54386015110942, lng: -0.38412044724735395},
        description: '',
        website: 'https://www.alecreedacademy.co.uk/',
        colour: '#004a85'
    },
    {
        name: 'Ark Acton Academy',
        shortName: 'Ark Acton',
        intakeDist: {2019: null, "2020": null, "2021": null, "2022": null},
        visible: false,
        radius: true,
        notes: null,
        rating: 'inadequate',
        centre: {lat: 51.50574634559589, lng: -0.2807213727970449},
        description: '', website: 'https://arkacton.org/', colour: '#be0c33'
    },
    {
        name: 'Ark Soane Academy',
        shortName: 'Ark Soane',
        intakeDist: {2019: 0, "2020": 0, "2021": null, "2022": null},
        visible: false,
        radius: true,
        notes: null,
        rating: 'unknown',
        centre: {lat: 51.507630690954336, lng: -0.2766491574556743},
        description: '',
        website: 'https://arksoane.org/',
        colour: '#64a0c8'
    },
    {
        name: 'Brentside High School',
        shortName: 'Brentside',
        intakeDist: {2019: 2.062, "2020": null, "2021": null, "2022": null},
        visible: false,
        radius: true,
        notes: null,
        rating: 'good',
        centre: {lat: 51.52666580490838, lng: -0.34072854396115104},
        description: '', website: 'http://www.brentsidehigh.ealing.sch.uk/', colour: '#ce172e'
    },
    {
        name: 'Dormers Wells High School',
        shortName: 'Dormers Wells',
        intakeDist: {2019: 1.058, "2020": 1.123, "2021": 1.183, "2022": 3.391},
        visible: false,
        radius: true,
        notes: null,
        rating: 'good',
        centre: {lat: 51.51941102761661, lng: -0.3663272304673315},
        description: '', website: 'https://www.dwhs.co.uk/', colour: '#467cb4'
    },
    {
        name: 'Drayton Manor High School',
        shortName: 'Drayton Manor',
        intakeDist: {2019: 0.780, "2020": 1.434, "2021": 0.897, "2022": 1.555},
        visible: true,
        radius: false,
        notes: 'Distance measured in walking distance via pavements',
        rating: 'outstanding',
        centre: {lat: 51.515774712487364, lng: -0.3360007801860185},
        description: '', website: 'http://www.draytonmanorhighschool.co.uk/',
        colour: '#651968'
    },
    {
        name: 'Ealing Fields',
        shortName: 'Ealing Fields',
        intakeDist: {2019: 0.557, "2020": 0.637, "2021": 0.545, "2022": 0.425},
        visible: true,
        radius: true,
        notes: null,

        rating: 'good',
        centre: {lat: 51.49674021027868, lng: -0.3120331259658251},
        description: '',
        website: 'https://ealingfields.org.uk/',
        colour: '#f2a900'
    },

    {
        name: 'Elthorne Park High School',
        shortName: 'Elthorne Park',
        intakeDist: {2019: 0.705, "2020": 0.920, "2021": 0.701, "2022": 0.943},
        visible: true,
        radius: true,
        notes: null,
        rating: 'outstanding',
        centre: {lat: 51.50009170525974, lng: -0.3304224095820846},
        description: '',
        website: 'http://www.ephs.ealing.sch.uk/',
        colour: '#8d2424'
    },
    {
        name: 'Featherstone High School',
        shortName: 'Featherstone',
        intakeDist: {2019: 0.501, "2020": 0.522, "2021": 0.439, "2022": 0.814},
        visible: false,
        radius: true,
        notes: null,
        rating: 'outstanding',
        centre: {lat: 51.4997112429414, lng: -0.3860992016325312},
        description: '',
        website: 'https://www.featherstonehigh.ealing.sch.uk/',
        colour: '#1e1344'
    },
    {
        name: 'Greenford High School',
        shortName: 'Greenford',
        intakeDist: {2019: 0.699, "2020": 0.621, "2021": 0.626, "2022": 0.845},
        visible: false,
        radius: true,
        notes: null,

        rating: 'outstanding',
        centre: {lat: 51.53085000530637, lng: -0.3703295439610566},
        description: '',
        website: 'http://www.greenford.ealing.sch.uk/',
        colour: '#2fa866'
    },
    {
        name: 'Northolt High School',
        shortName: 'Northolt',
        intakeDist: {2019: null, "2020": null, "2021": null, "2022": null},
        visible: false,
        radius: true,
        notes: null,

        rating: 'good',
        centre: {lat: 51.551886423402614, lng: -0.3759798439604784},
        description: '',
        website: 'http://www.northolthigh.org.uk/',
        colour: '#3b87a4'
    },
    {
        name: 'The Cardinal Wiseman Catholic School',
        shortName: 'Cardinal Wiseman',
        intakeDist: {2019: 2.103, "2020": 2.158, "2021": 3.609, "2022": 2.806},
        visible: false,
        radius: true,
        notes: null,

        rating: 'outstanding',
        centre: {lat: 51.525202578994644, lng: -0.35282063046716927},
        description: '',
        website: 'http://www.wiseman.ealing.sch.uk/',
        colour: '#3c26b7'
    },
    {
        name: 'The Ellen Wilkinson School for Girls',
        shortName: 'Ellen Wilkinson',
        intakeDist: {2019: 3.540, "2020": 3.210, "2021": 2.531, "2022": null},
        visible: false,
        radius: true,
        notes: null,

        rating: 'outstanding',
        centre: {lat: 51.516265720816065, lng: -0.28713327279676154},
        description: '',
        website: 'http://www.ellenwilkinson.ealing.sch.uk/',
        colour: '#f0b600'
    },
    {
        name: 'Twyford CofE High School',
        shortName: 'Twyford',
        intakeDist: {2019: 0.323, "2020": 0.357, "2021": 0.585, "2022": 0.492},
        visible: true,
        radius: true,
        notes: null,

        rating: 'outstanding',
        centre: {lat: 51.50894124700113, lng: -0.2799019881382822},
        description: '',
        website: 'https://www.twyford.ealing.sch.uk/',
        colour: '#da1935'
    },
    {
        name: 'Villiers High School',
        shortName: 'Villiers',
        intakeDist: {2019: null, "2020": null, "2021": null, "2022": null},
        visible: false,
        radius: true,
        notes: null,

        rating: 'outstanding',
        centre: {lat: 51.509815602642554, lng: -0.37322519793766873},
        description: '', website: 'http://www.villiers.ealing.sch.uk/', colour: '#337ab7'
    },
    {
        name: 'William Perkin CofE High School',
        shortName: 'William Perkin',
        intakeDist: {2019: 0.375, "2020": 0.315, "2021": 0.346, "2022": 0.709},
        visible: false,
        radius: true,
        notes: null,

        rating: 'outstanding',
        centre: {lat: 51.53735113287974, lng: -0.3493021862901906},
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
