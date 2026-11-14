// Every school the app knows about, tagged with its borough. intakeDist maps
// year → furthest distance offered in miles: null = everyone who applied got a
// place, 0 = no places given on distance, missing = nothing published.

import boroughs from '@/data/boroughs';
import ealing from '@/data/ealing';
import hounslow from '@/data/hounslow';

const lists = {ealing, hounslow};

export default boroughs.flatMap(borough => lists[borough.id].map(school => ({...school, borough: borough.id})));
