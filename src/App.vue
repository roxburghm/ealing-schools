<template>
  <v-app class="app-root">
    <header class="app-header">
      <div class="app-header__titles">
        <h1>Ealing secondary schools</h1>
        <p>How far away did each school stop offering places on distance? See where your home lands.</p>
      </div>
      <nav class="app-header__links" aria-label="More">
        <button type="button" class="text-btn" @click="showTable = true">All distances table</button>
        <button type="button" class="text-btn" @click="showHelp = true">How this works</button>
      </nav>
    </header>

    <main class="app-main">
      <section class="col-list" aria-label="Schools ranked by your chances">
        <home-picker class="o-picker" :maps-ready="mapsReady" :home-name="homeName" :has-home="!!home"
                     :search-area="searchArea"
                     @set-home="setHome" @clear-home="clearHome"/>

        <div class="list-head o-listhead">
          <h2>{{ home ? `Your chances from ${homeName}` : 'Schools' }}</h2>
          <div class="name-filter">
            <label for="name-filter" class="visually-hidden">Filter schools by name</label>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7"/>
              <path d="M20 20l-3.5-3.5"/>
            </svg>
            <input id="name-filter" ref="nameFilter" type="search" v-model="nameFilter" placeholder="Filter by name"
                   autocomplete="off" @keydown.esc="clearNameFilter">
            <button v-if="nameFilter" type="button" class="name-filter__clear" aria-label="Clear filter"
                    @click="clearNameFilter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25"
                   stroke-linecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18"/>
              </svg>
            </button>
          </div>
        </div>

        <ranked-list class="o-list" :rows="rankedRows" :selected-name="selected && selected.name" :year="year"
                     @select="selectSchool"/>

        <p class="fine-print o-fine">
          Mini charts: each bar is the furthest distance offered in a year, {{ YEARS[0] }}–{{ YEARS[YEARS.length - 1] }}.
          The orange line is your home. Pale full-height bars mean everyone who applied got a place.
          Distances are straight-line unless noted. Check each school’s admission rules before you apply.
        </p>
      </section>

      <section class="col-map" aria-label="Map and school details">
        <div ref="mapCard" class="card map-card o-map">
          <div class="map-card__head">
            <div>
              <span class="eyebrow">Furthest distance offered for September</span>
              <span class="big-year">{{ year }}</span>
            </div>
            <year-timeline v-model="year" :years="YEARS"/>
          </div>
          <schools-map :schools="schools" :year="year" :home="home" :selected="selected" :focus="focused"
                       @clear-focus="focused = null"
                       :api-promise="apiPromise" :maps-ready="mapsReady" :maps-failed="mapsFailed"
                       @select="s => selectSchool(s, true)" @set-home="p => setHome(p, 'your pin')"/>
          <div class="legend">
            <span><i class="lg-ring"></i>Furthest distance offered in {{ year }}</span>
            <span><i class="lg-walk"></i>Walking-distance area (Drayton Manor)</span>
            <span><i class="lg-open"></i>Everyone who applied got a place</span>
            <span><i class="lg-home"></i>Your home (click the map to move it)</span>
          </div>
        </div>

        <school-detail v-if="selected" ref="detail" class="o-detail" :school="selected" :assessment="assessments.get(selected)"
                       :year="year" :home="home"/>
      </section>
    </main>

    <footer class="app-footer">
      Source: Ealing Council “Starting High School” booklets and on-time offer reports, {{ YEARS[0] }}–{{ YEARS[YEARS.length - 1] }}.
      Ofsted and GCSE figures from GOV.UK. Past distances don’t guarantee future offers. Use at your own risk.
      Issues: <a href="mailto:matt@roxburghm.com">matt@roxburghm.com</a>
      <span v-if="buildDateTime"> · Build {{ buildDateTime }}</span>
    </footer>

    <v-dialog v-model="showHelp" max-width="780" :fullscreen="mobile" scrollable>
      <Help @close="showHelp = false"/>
    </v-dialog>
    <v-dialog v-model="showTable" max-width="1100" :fullscreen="mobile" scrollable>
      <SchoolTable :years="YEARS" :year="year" :schools="schools" :home="home"
                   @close="showTable = false" @open="openFromTable"/>
    </v-dialog>
  </v-app>
</template>

<script>
import {Loader} from '@googlemaps/js-api-loader';
import {useDisplay} from 'vuetify';
import walking from '@/plugins/walking';
import admission from '@/plugins/admission';
import schools from '@/plugins/schools';
import {YEARS, KIND_ORDER, assess} from '@/plugins/assess';
import SchoolsMap from './components/SchoolsMap.vue';
import HomePicker from './components/HomePicker.vue';
import RankedList from './components/RankedList.vue';
import YearTimeline from './components/YearTimeline.vue';
import SchoolDetail from './components/SchoolDetail.vue';
import SchoolTable from './components/SchoolTable.vue';
import Help from './Help.vue';

function readStored(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    return null;
  }
}

export default {
  name: 'App',
  components: {SchoolsMap, HomePicker, RankedList, YearTimeline, SchoolDetail, SchoolTable, Help},
  setup() {
    const {mobile} = useDisplay();
    return {mobile};
  },
  data() {
    return {
      YEARS,
      schools,
      year: YEARS[YEARS.length - 1],
      selected: null,
      // The school the map is zoomed to; only set when someone picks a school.
      focused: null,
      nameFilter: '',
      homeName: readStored('homeName') || readStored('home')?.label || 'your home',
      showHelp: false,
      showTable: false,
      apiPromise: null,
      mapsReady: false,
      mapsFailed: false,
    };
  },
  created() {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      libraries: ['places'],
    });
    this.apiPromise = loader.load();
    this.apiPromise.then(() => {
      this.mapsReady = true;
    }).catch(() => {
      this.mapsFailed = true;
    });

    const storedHome = readStored('home');
    if (storedHome && typeof storedHome.lat === 'number') this.home = storedHome;
  },
  methods: {
    setHome(point, name) {
      this.home = point;
      this.homeName = name || 'your home';
      try {
        localStorage.setItem('home', JSON.stringify(point));
        localStorage.setItem('homeName', JSON.stringify(this.homeName));
      } catch (e) {
        // storage unavailable – keep the in-memory value
      }
    },
    clearNameFilter() {
      this.nameFilter = '';
      this.$refs.nameFilter?.focus();
    },
    matchesName(school) {
      const query = this.nameFilter.trim().toLowerCase();
      return !query || school.name.toLowerCase().includes(query) || school.shortName.toLowerCase().includes(query);
    },
    clearHome() {
      this.home = null;
      this.homeName = 'your home';
      try {
        localStorage.removeItem('home');
        localStorage.removeItem('homeName');
      } catch (e) {
        // nothing stored
      }
    },
    openFromTable(school) {
      this.showTable = false;
      this.selectSchool(school);
    },
    selectSchool(school, fromMap) {
      this.selected = school;
      this.focused = school;
      // On narrow screens the map sits above the list: bring it into view so the
      // zoom is visible, with the school's details just below it.
      if (!fromMap && window.matchMedia('(max-width: 1019px)').matches) {
        // An instant jump: smooth scrolling gets cancelled while the map animates its zoom.
        this.$nextTick(() => {
          const card = this.$refs.mapCard;
          if (card) window.scrollTo({top: card.getBoundingClientRect().top + window.scrollY - 12});
        });
      }
    },
  },
  computed: {
    home: {
      get() {
        return this.$store.state.homeLocation;
      },
      set(value) {
        this.$store.commit('homeLocation', value);
      }
    },
    assessments() {
      const map = new Map();
      this.schools.forEach(s => map.set(s, assess(s, this.home)));
      return map;
    },
    rankedRows() {
      return this.schools
          .filter(s => this.matchesName(s))
          .map(s => ({school: s, a: this.assessments.get(s)}))
          .sort((x, y) =>
              (KIND_ORDER.indexOf(x.a.kind) - KIND_ORDER.indexOf(y.a.kind)) ||
              (y.a.score - x.a.score) ||
              ((x.a.dist ?? 0) - (y.a.dist ?? 0)) ||
              x.school.shortName.localeCompare(y.school.shortName));
    },
    // The schools plus about 2 km either side, to steer address suggestions towards Ealing.
    searchArea() {
      const lats = this.schools.map(s => s.centre.lat);
      const lngs = this.schools.map(s => s.centre.lng);
      return {
        north: Math.max(...lats) + 0.02,
        south: Math.min(...lats) - 0.02,
        east: Math.max(...lngs) + 0.03,
        west: Math.min(...lngs) - 0.03,
      };
    },
    buildDateTime() {
      return import.meta.env.VITE_BUILD_DATE_TIME;
    },
  },
  watch: {
    // Walking bands are only needed once there's a home to measure from.
    home: {
      immediate: true,
      handler(home) {
        if (home) this.schools.filter(s => admission.measure(s) === 'walk').forEach(walking.load);
      }
    },
    rankedRows: {
      immediate: true,
      handler(rows) {
        if (!this.selected && rows.length) this.selected = rows[0].school;
      }
    }
  }
};
</script>

<style>
:root {
  --ink: #16181D;
  --ink-2: #3A3F48;
  --ink-3: #555B66;
  --line: #E2E5EA;
  --line-strong: #C9CED6;
  --ground: #F4F5F7;
  --accent: #1D4ED8;
  --accent-dark: #1E3A8A;
  --home: #E8590C;
  --home-dark: #B54708;
  --font: 'Inter', system-ui, sans-serif;
  --font-display: 'Space Grotesk', 'Inter', sans-serif;
}

.v-application, .app-root {
  font-family: var(--font) !important;
  color: var(--ink);
  background: var(--ground) !important;
}

.app-root a { color: var(--accent); }
::selection { background: rgba(29, 78, 216, 0.18); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.v-btn { text-transform: none !important; letter-spacing: 0 !important; }
.app-root a:hover { color: var(--accent-dark); }

.app-header {
  background: #fff;
  border-bottom: 1px solid var(--line);
  padding: 16px 28px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 32px;
}
.app-header h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.app-header p { margin: 2px 0 0; font-size: 14px; color: var(--ink-3); }
.app-header__links { display: flex; gap: 4px; flex-wrap: wrap; }

.text-btn {
  min-height: 40px;
  padding: 0 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--ink-2);
  font: 600 13px var(--font);
  cursor: pointer;
}
.text-btn:hover { background: #F0F2F5; }

.app-main {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding: 24px 28px;
  max-width: 1480px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}
.col-list { flex: 1 1 380px; min-width: 0; display: flex; flex-direction: column; gap: 16px; }
.col-map { flex: 999 1 560px; min-width: 0; display: flex; flex-direction: column; gap: 16px; }

.card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
}

.list-head { display: flex; flex-direction: column; gap: 10px; }
.list-head h2 { margin: 0; font-family: var(--font-display); font-size: 18px; font-weight: 600; }
.name-filter {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  color: var(--ink-3);
}
.name-filter > svg { position: absolute; left: 14px; pointer-events: none; }
.name-filter input {
  width: 100%;
  height: 44px;
  padding: 0 48px 0 40px;
  border: 1px solid #D5D9E0;
  border-radius: 12px;
  background: #fff;
  font: 15px var(--font);
  color: var(--ink);
}
.name-filter input::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; }
.name-filter input:focus { outline: 2px solid var(--accent); outline-offset: -1px; border-color: transparent; }
.name-filter__clear {
  position: absolute;
  right: 2px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--ink-2);
  cursor: pointer;
}
.name-filter__clear:hover { background: #F0F2F5; color: var(--ink); }
.visually-hidden {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}

.fine-print { margin: 0; font-size: 12px; color: var(--ink-3); line-height: 1.5; }

.map-card { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.map-card__head {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
  gap: 8px 24px; padding: 4px 6px 2px;
}
.eyebrow { display: block; font-size: 12px; color: var(--ink-3); font-weight: 500; }
.big-year { display: block; font-family: var(--font-display); font-size: 26px; font-weight: 700; line-height: 1.1; }

.legend { display: flex; flex-wrap: wrap; gap: 8px 20px; font-size: 12px; color: var(--ink-2); padding: 0 6px 4px; }
.legend span { display: flex; align-items: center; gap: 6px; }
.legend i { display: inline-block; flex: none; }
.lg-ring { width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--ink-2); background: rgba(58, 63, 72, .08); }
.lg-walk { width: 16px; height: 12px; border: 2px dashed var(--ink-2); border-radius: 3px; }
.lg-open { width: 10px; height: 10px; border-radius: 50%; background: #9AA1AC; box-shadow: 0 0 0 2px #fff, 0 0 0 3px #9AA1AC; }
.lg-home { width: 10px; height: 10px; border-radius: 50%; background: var(--home); }

.app-footer {
  padding: 8px 28px 32px;
  max-width: 1480px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  font-size: 12px;
  color: var(--ink-3);
  line-height: 1.5;
}

/* Stacked layout: picker, map, detail, then the list */
@media (max-width: 1019px) {
  .app-main { flex-direction: column; gap: 16px; }
  .col-list, .col-map { display: contents; }
  .o-picker, .o-map, .o-detail, .o-listhead, .o-list, .o-fine { min-width: 0; max-width: 100%; }
  .o-picker { order: 1; }
  .o-map { order: 2; }
  .o-detail { order: 3; scroll-margin-top: 12px; }
  .o-listhead { order: 4; margin-top: 8px; }
  .o-list { order: 5; }
  .o-fine { order: 6; }
  .map { height: clamp(300px, 50vh, 480px) !important; }
}

@media (max-width: 600px) {
  .app-header, .app-main, .app-footer { padding-left: 16px; padding-right: 16px; }
  .map-card { padding: 8px; }
  .map-card__head { padding: 4px 4px 0; }
}
</style>
