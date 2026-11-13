<template>
  <v-app class="app-root">
    <!-- Desktop: list on the left scrolls on its own; map pinned top right with the details scrolling under it -->
    <div v-if="!narrow" class="d-shell">
      <header class="app-header">
        <div class="brand">
          <span class="brand__mark" aria-hidden="true"><school-icon kind="distance"/></span>
          <div>
            <h1>Ealing secondary school places</h1>
            <p>How close did you need to live to get a place? Cut-off distances for every school, 2019–2026.</p>
          </div>
        </div>
        <nav class="header-actions" aria-label="More">
          <button type="button" class="header-btn" @click="showTable = true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>
            </svg>
            Compare schools
          </button>
          <button type="button" class="header-btn" @click="showHelp = true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
            How it works
          </button>
        </nav>
      </header>

      <div class="d-main">
        <aside class="d-list" aria-label="Schools ranked by your chances">
          <home-picker :maps-ready="mapsReady" :home-name="homeName" :has-home="!!home" :search-area="searchArea"
                       @set-home="setHome" @clear-home="clearHome"/>

          <div class="list-head">
            <h2>{{ listHeading }}</h2>
            <name-filter v-model="nameFilter"/>
          </div>

          <ranked-list :rows="rankedRows" :selected-name="focused && focused.name" :year="year"
                       @select="selectSchool"/>

          <p class="fine-print list-note">{{ finePrint }}</p>
          <p class="fine-print list-note">
            {{ sourceLine }} Questions or corrections: <a href="mailto:matt@roxburghm.com">matt@roxburghm.com</a>
            <span v-if="buildDateTime"> · Build {{ buildDateTime }}</span>
          </p>
        </aside>

        <section ref="rightPane" class="d-right" aria-label="Map and school details">
          <div class="card map-card">
            <div class="map-card__head">
              <div class="map-card__titles">
                <span class="map-card__label">Furthest distance offered for September</span>
                <span class="big-year">{{ year }}</span>
              </div>
              <!-- The picked school's years at a glance, beside the year slider (only while one is picked) -->
              <div v-if="focused" class="head-spark" :title="`${focused.shortName}: furthest distance offered each year`">
                <mini-spark :school="focused" :year="year" :dist="assessments.get(focused).dist"
                            :width="128" :height="32"/>
                <span class="head-spark__name">
                  <i :style="{background: focused.colour}"></i>{{ focused.shortName }}
                </span>
              </div>
              <year-timeline v-model="year" :years="YEARS"/>
            </div>
            <schools-map :schools="schools" :year="year" :home="home" :selected="focused" :focus="focused"
                         height="clamp(320px, 52vh, 640px)" gestures="cooperative"
                         :api-promise="apiPromise" :maps-ready="mapsReady" :maps-failed="mapsFailed"
                         @clear-focus="focused = null"
                         @select="selectSchool"/>
            <map-legend/>
          </div>

          <div class="d-detail">
            <school-detail v-if="selected" :school="selected" :assessment="assessments.get(selected)"
                           :year="year" :home="home"/>
          </div>
        </section>
      </div>
    </div>

    <!-- Phones and small tablets: one thing at a time -->
    <div v-else class="m-shell">
      <header class="m-bar">
        <div class="m-bar__top">
          <span class="brand__mark brand__mark--small" aria-hidden="true"><school-icon kind="distance"/></span>
          <h1>Ealing school places</h1>
          <button type="button" class="icon-btn" aria-label="Compare schools" @click="showTable = true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2"/>
              <path d="M3 10h18M3 15h18M9 4v16"/>
            </svg>
          </button>
          <button type="button" class="icon-btn" aria-label="How it works" @click="showHelp = true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 11v5M12 8h.01"/>
            </svg>
          </button>
        </div>

        <home-picker compact :maps-ready="mapsReady" :home-name="homeName" :has-home="!!home"
                     :search-area="searchArea" @set-home="setHome" @clear-home="clearHome"/>

        <div class="m-bar__controls">
          <div class="segmented" role="tablist" aria-label="View">
            <button type="button" role="tab" :aria-selected="view === 'list'" @click="view = 'list'">List</button>
            <button type="button" role="tab" :aria-selected="view === 'map'" @click="view = 'map'">Map</button>
          </div>
          <label class="year-select">
            <span class="visually-hidden">Offer year</span>
            <select v-model="year">
              <option v-for="y in yearsNewestFirst" :key="y" :value="y">{{ y }}</option>
            </select>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </label>
        </div>
      </header>

      <main class="m-content" :class="`m-content--${view}`">
        <div v-show="view === 'list'" class="m-list">
          <p class="m-list__lead">{{ home ? 'Best chances first, from your address.' : 'Add your address to rank schools by your chances.' }}</p>
          <name-filter v-model="nameFilter" id="name-filter-m"/>
          <ranked-list :rows="rankedRows" :selected-name="null" :year="year" @select="openSchool"/>
          <p class="fine-print list-note">{{ finePrint }}</p>
          <p class="fine-print list-note">
            {{ sourceLine }} Questions or corrections: <a href="mailto:matt@roxburghm.com">matt@roxburghm.com</a>
            <span v-if="buildDateTime"> · Build {{ buildDateTime }}</span>
          </p>
        </div>
        <div v-if="mapVisited" v-show="view === 'map'" class="m-map">
          <schools-map :schools="schools" :year="year" :home="home" :selected="focused" :focus="focused"
                       height="100%" :visible="view === 'map'"
                       :api-promise="apiPromise" :maps-ready="mapsReady" :maps-failed="mapsFailed"
                       @clear-focus="focused = null"
                       @select="openSchool"/>
          <map-legend compact class="m-map__legend"/>
        </div>
      </main>

      <transition name="page">
        <section v-if="pageOpen && selected" class="m-page" role="dialog" aria-modal="true" :aria-label="selected.name">
          <div class="m-page__bar">
            <button type="button" class="icon-btn" aria-label="Back" @click="closeSchool">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25"
                   stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <span class="m-page__title">{{ selected.shortName }}</span>
          </div>
          <div ref="pageBody" class="m-page__body">
            <schools-map :schools="schools" :year="year" :home="home" :selected="selected" :focus="selected"
                         height="220px" :interactive="false"
                         :api-promise="apiPromise" :maps-ready="mapsReady" :maps-failed="mapsFailed"
                         @select="openSchool"/>
            <school-detail flat :school="selected" :assessment="assessments.get(selected)"
                           :year="year" :home="home"/>
          </div>
        </section>
      </transition>
    </div>

    <v-dialog v-model="showHelp" max-width="780" :fullscreen="narrow" scrollable>
      <Help @close="showHelp = false"/>
    </v-dialog>
    <v-dialog v-model="showTable" max-width="1100" :fullscreen="narrow" scrollable>
      <SchoolTable :years="YEARS" :year="year" :schools="schools" :home="home"
                   @close="showTable = false" @open="openFromTable"/>
    </v-dialog>
  </v-app>
</template>

<script>
import {Loader} from '@googlemaps/js-api-loader';
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
import NameFilter from './components/NameFilter.vue';
import MapLegend from './components/MapLegend.vue';
import MiniSpark from './components/MiniSpark.vue';
import SchoolIcon from './components/SchoolIcon.vue';
import Help from './Help.vue';

// Below this width the two columns don't fit: switch to the List / Map tabs.
const NARROW = '(max-width: 1019px)';

function readStored(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    return null;
  }
}

export default {
  name: 'App',
  components: {SchoolsMap, HomePicker, RankedList, YearTimeline, SchoolDetail, SchoolTable, NameFilter, MapLegend, MiniSpark, SchoolIcon, Help},
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
      narrow: window.matchMedia(NARROW).matches,
      view: 'list',
      // The phone map is only created once its tab is first shown: a map
      // created while hidden has no size and draws without its streets.
      mapVisited: false,
      pageOpen: false,
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
    // Start on the best-ranked school for the saved home.
    if (this.rankedRows.length) this.selected = this.rankedRows[0].school;

    this.media = window.matchMedia(NARROW);
    this.onMedia = e => {
      this.narrow = e.matches;
    };
    this.media.addEventListener('change', this.onMedia);
    this.onPopState = this.syncPageWithHistory.bind(this);
    window.addEventListener('popstate', this.onPopState);
    this.onKeydown = this.stepWithKeys.bind(this);
    window.addEventListener('keydown', this.onKeydown);
  },
  beforeUnmount() {
    this.media.removeEventListener('change', this.onMedia);
    window.removeEventListener('popstate', this.onPopState);
    window.removeEventListener('keydown', this.onKeydown);
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
    fetchWalks() {
      if (!this.home) return;
      const walkSchools = this.schools.filter(s => admission.measure(s) === 'walk');
      walkSchools.forEach(walking.load);
      if (this.mapsReady) walking.lookupWalks(walkSchools, this.home);
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
      if (this.narrow) this.openSchool(school);
      else this.selectSchool(school);
    },
    // Desktop: ↓ / ↑ move to the next / previous school in the list. Left alone
    // while typing, on the year slider or a drop-down, in the map (it pans with
    // the arrows) or with a dialog open.
    stepWithKeys(event) {
      if (this.narrow || this.showHelp || this.showTable) return;
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.target.closest('input, textarea, select, [contenteditable], .pac-container, .map-wrap')) return;
      const rows = this.rankedRows;
      if (!rows.length) return;
      event.preventDefault();
      const current = this.focused || this.selected;
      const at = current ? rows.findIndex(r => r.school.name === current.name) : -1;
      let next;
      if (!this.focused) next = at < 0 ? 0 : at; // first press picks the school already shown
      else next = Math.min(rows.length - 1, Math.max(0, at + (event.key === 'ArrowDown' ? 1 : -1)));
      const school = rows[next].school;
      if (this.focused && school.name === this.focused.name) return;
      this.selectSchool(school);
      this.$nextTick(() => {
        const row = this.$el.querySelector(`.d-list [data-school="${CSS.escape(school.name)}"]`);
        row?.scrollIntoView({block: 'nearest'});
      });
    },
    // Desktop: show the school in the right-hand pane and zoom the map to it.
    // Picking the zoomed-in school again works like "Show all schools".
    selectSchool(school) {
      if (this.focused && this.focused.name === school.name) {
        this.focused = null;
        return;
      }
      this.selected = school;
      this.focused = school;
      this.$nextTick(() => {
        // Back to the top of the right-hand column so the map zoom is in view.
        // An instant jump: smooth scrolling gets cancelled while the map animates.
        if (this.$refs.rightPane) this.$refs.rightPane.scrollTop = 0;
      });
    },
    // Phones: open the school's own page. It sits in browser history so the
    // back button or gesture closes it.
    openSchool(school) {
      this.selected = school;
      this.focused = school;
      if (this.pageOpen) {
        history.replaceState({school: school.name}, '');
        this.$nextTick(() => {
          if (this.$refs.pageBody) this.$refs.pageBody.scrollTop = 0;
        });
      } else {
        history.pushState({school: school.name}, '');
        this.pageOpen = true;
      }
    },
    closeSchool() {
      if (history.state && history.state.school) {
        history.back();
      } else {
        this.pageOpen = false;
        this.focused = null;
      }
    },
    syncPageWithHistory(event) {
      const name = event.state && event.state.school;
      const school = name && this.schools.find(s => s.name === name);
      if (school) {
        this.selected = school;
        this.focused = school;
        this.pageOpen = true;
      } else {
        // Back out of a school page: the map goes back to showing every school.
        this.pageOpen = false;
        this.focused = null;
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
      const rows = this.schools
          .filter(s => this.matchesName(s))
          .map(s => ({school: s, a: this.assessments.get(s)}));
      // No address, nothing to rank by: plain A–Z.
      if (!this.home) return rows.sort((x, y) => x.school.shortName.localeCompare(y.school.shortName));
      return rows
          .sort((x, y) =>
              (KIND_ORDER.indexOf(x.a.kind) - KIND_ORDER.indexOf(y.a.kind)) ||
              (y.a.score - x.a.score) ||
              ((x.a.dist ?? 0) - (y.a.dist ?? 0)) ||
              x.school.shortName.localeCompare(y.school.shortName));
    },
    yearsNewestFirst() {
      return [...YEARS].reverse();
    },
    listHeading() {
      return this.home ? `Your chances from ${this.homeName}` : 'Schools';
    },
    finePrint() {
      return `Each mini chart shows the furthest distance offered each year, ${YEARS[0]}–${YEARS[YEARS.length - 1]}, ` +
          'with your home as the orange line. Pale full-height bars mean everyone who applied got a place. ' +
          'Distances are straight-line unless a school notes otherwise.';
    },
    sourceLine() {
      return `Figures come from Ealing Council’s offer reports and booklets, ${YEARS[0]}–${YEARS[YEARS.length - 1]}, ` +
          'and from GOV.UK. They’re estimates to help you plan; Ealing Council makes the admissions decisions.';
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
    // Walking data is only needed once there's a home to measure from: the
    // walk itself from Google (once its script has loaded), outlines from CI.
    home: {
      immediate: true,
      handler() {
        this.fetchWalks();
      }
    },
    mapsReady() {
      this.fetchWalks();
    },
    rankedRows(rows) {
      if (!this.selected && rows.length) this.selected = rows[0].school;
    },
    view(now) {
      if (now === 'map') this.mapVisited = true;
    },
    // Leaving the phone layout with a school page open: drop it.
    narrow(now) {
      if (!now && this.pageOpen) this.pageOpen = false;
    },
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
  /* Same-width digits: changing years and distances don't nudge their surroundings */
  font-variant-numeric: tabular-nums;
  color: var(--ink);
  background: var(--ground) !important;
}

.app-root a { color: var(--accent); }
.app-root a:hover { color: var(--accent-dark); }
::selection { background: rgba(29, 78, 216, 0.18); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.v-btn { text-transform: none !important; letter-spacing: 0 !important; }

.visually-hidden {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}

.card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
}

.fine-print { margin: 0; font-size: 12px; color: var(--ink-3); line-height: 1.5; }
/* Notes under the school list use the cards' inset, so they line up with the
   coloured dots: 2px border + 14px padding, both sides */
.list-note { padding: 0 16px; }

.icon-btn {
  flex: none;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--ink-2);
  cursor: pointer;
}
.icon-btn:hover { background: #F0F2F5; }

/* ---------- Desktop ---------- */
.d-shell {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
}

.app-header {
  flex: none;
  background: #fff;
  border-bottom: 1px solid var(--line);
  padding: 12px 24px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 32px;
}
.brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
.brand h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 21px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.2;
}
.brand p { margin: 2px 0 0; font-size: 14px; color: var(--ink-3); }
.brand__mark {
  flex: none;
  width: 38px;
  height: 38px;
  padding: 8px;
  box-sizing: border-box;
  border-radius: 11px;
  background: var(--accent);
  color: #fff;
}
.brand__mark--small { width: 30px; height: 30px; padding: 6px; border-radius: 9px; }
.header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.header-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid var(--line-strong);
  border-radius: 10px;
  background: #fff;
  color: var(--ink);
  font: 600 14px var(--font);
  cursor: pointer;
}
.header-btn svg { color: var(--ink-3); }
.header-btn:hover { background: var(--ground); }

.d-main {
  flex: 1;
  min-height: 0;
  width: 100%;
  max-width: 1560px;
  margin: 0 auto;
  padding: 20px 24px 0;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(340px, 400px) minmax(0, 1fr);
  gap: 20px;
}

.d-list {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 2px 6px 24px 2px;
  scrollbar-gutter: stable;
}

/* Map and school details scroll together, separately from the list */
.d-right {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 2px 6px 24px 2px;
  scrollbar-gutter: stable;
}

.d-detail { flex: none; }

.list-head { display: flex; flex-direction: column; gap: 10px; }
.list-head h2 { margin: 0; font-family: var(--font-display); font-size: 18px; font-weight: 600; }

.map-card { flex: none; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.map-card__head {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
  gap: 8px 24px; padding: 2px 6px 0;
}
.map-card__titles { flex: none; }
.head-spark { flex: none; display: flex; flex-direction: column; align-items: center; gap: 3px; }
.head-spark__name {
  display: flex; align-items: center; gap: 5px;
  max-width: 140px;
  font-size: 11px; font-weight: 600; color: var(--ink-2);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.head-spark__name i { width: 8px; height: 8px; border-radius: 50%; flex: none; }
.map-card__label { display: block; font-size: 12px; color: var(--ink-3); font-weight: 500; }
.big-year { display: block; font-family: var(--font-display); font-size: 26px; font-weight: 700; line-height: 1.1; }

/* Short laptop screens: let the page scroll as a whole instead of squeezing the panes */
@media (max-height: 700px) {
  .d-shell { height: auto; }
  .d-list, .d-right { overflow: visible; }
}

/* ---------- Phones ---------- */
.m-shell {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
}

.m-bar {
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 6px 12px 10px;
  background: #fff;
  border-bottom: 1px solid var(--line);
  z-index: 2;
}
.m-bar__top { display: flex; align-items: center; gap: 2px; }
.m-bar__top h1 {
  flex: 1;
  margin: 0 0 0 10px;
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.m-bar__controls { display: flex; gap: 8px; }

.segmented {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 3px;
  border-radius: 12px;
  background: #EDEFF2;
}
.segmented button {
  min-height: 38px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--ink-2);
  font: 600 14px var(--font);
  cursor: pointer;
  transition: background-color .15s, box-shadow .15s;
}
.segmented button[aria-selected="true"] {
  background: #fff;
  color: var(--ink);
  box-shadow: 0 1px 2px rgba(22, 24, 29, .12), 0 1px 4px rgba(22, 24, 29, .06);
}

.year-select { position: relative; flex: none; display: flex; align-items: center; }
.year-select select {
  height: 44px;
  padding: 0 34px 0 14px;
  border: 1px solid #D5D9E0;
  border-radius: 12px;
  background: #fff;
  font: 600 16px var(--font);
  font-variant-numeric: tabular-nums;
  color: var(--ink);
  appearance: none;
  -webkit-appearance: none;
}
.year-select svg { position: absolute; right: 12px; pointer-events: none; color: var(--ink-3); }

.m-content { flex: 1; min-height: 0; position: relative; }
.m-content--list { overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }
.m-content--map { overflow: hidden; }

.m-list { display: flex; flex-direction: column; gap: 12px; padding: 12px 12px 32px; }
.m-list__lead { margin: 0 2px; font-size: 14px; color: var(--ink-2); }

.m-map { position: relative; height: 100%; }
.m-map .map { border-radius: 0 !important; }
.m-map__legend { position: absolute; left: 10px; bottom: 26px; }

.m-page {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  background: #fff;
}
.m-page__bar {
  flex: none;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px 6px 4px;
  border-bottom: 1px solid var(--line);
}
.m-page__title { font-family: var(--font-display); font-size: 18px; font-weight: 700; }
.m-page__body { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
.m-page__body .map { border-radius: 0 !important; }

.page-enter-active, .page-leave-active { transition: transform .26s cubic-bezier(0.22, 1, 0.36, 1), opacity .26s; }
.page-enter-from, .page-leave-to { transform: translateX(24px); opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .page-enter-active, .page-leave-active { transition: none; }
}
</style>
