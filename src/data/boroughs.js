// The boroughs the app covers. To add one: put its schools in src/data/<id>.js,
// add an entry here and register the list in src/plugins/schools.js.
//
// sources: where each year's cut-offs come from, newest first, for "How it works".

const ealingOffers = year => ({title: 'Offers report', href: `/Documents/High_school_on_time_offers_${year}.pdf`});
const ealingBooklet = year => ({title: `Starting High School ${year}`, href: `/Documents/Starting_High_School_${year}.pdf`});
const hounslow = (year, title = 'Allocations report') => ({title, href: `/Documents/Hounslow/Secondary_places_allocated_${year}.pdf`});

export default [
    {
        id: 'ealing',
        name: 'Ealing',
        council: 'Ealing Council',
        // Each "Starting High School" booklet prints the previous year's figures.
        sources: [
            {year: '2026', docs: [ealingOffers(2026), ealingBooklet(2027)]},
            {year: '2025', docs: [ealingOffers(2025), ealingBooklet(2026)]},
            {year: '2024', docs: [ealingOffers(2024), ealingBooklet(2025)]},
            {year: '2023', docs: [ealingBooklet(2024)]},
            {year: '2022', docs: [{title: 'Offers report', href: '/Documents/Other/High_School_ontime_offers_2022.pdf'}, ealingBooklet(2023)]},
            {year: '2021', docs: [ealingBooklet(2022)]},
            {year: '2020', docs: [ealingBooklet(2021)]},
            {year: '2019', docs: [ealingBooklet(2020)]},
        ],
    },
    {
        id: 'hounslow',
        name: 'Hounslow',
        council: 'Hounslow Council',
        // The 2022 table also lists 2020 and 2021. No 2019 figures have been found.
        sources: [
            {year: '2026', docs: [hounslow(2026)]},
            {year: '2025', docs: [hounslow(2025)]},
            {year: '2024', docs: [hounslow(2024)]},
            {year: '2023', docs: [hounslow(2023)]},
            {year: '2020–22', docs: [hounslow(2022, 'Last distance offered, 2020–2022')]},
        ],
    },
];
