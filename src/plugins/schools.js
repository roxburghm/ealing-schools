// Every school the app knows about, tagged with its borough. intakeDist maps
// year → furthest distance offered in miles: null = everyone who applied got a
// place, 0 = no places given on distance, missing = nothing published.

import boroughs from '@/data/boroughs';
import ealing from '@/data/ealing';
import hounslow from '@/data/hounslow';
import hammersmithFulham from '@/data/hammersmith-fulham';
import hillingdon from '@/data/hillingdon';
import brent from '@/data/brent';

const lists = {ealing, hounslow, 'hammersmith-fulham': hammersmithFulham, hillingdon, brent};

export default boroughs.flatMap(borough => lists[borough.id].map(school => ({...school, borough: borough.id})));
