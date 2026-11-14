<template>
  <v-app class="app-root">
    <!-- First visit, or back via the logo: pick a borough -->
    <borough-picker v-if="picking" :boroughs="boroughs" :schools="allSchools" @pick="pickBoroughs"/>

    <!-- Desktop: list on the left scrolls on its own; map pinned top right with the details scrolling under it -->
    <div v-else-if="!narrow" class="d-shell">
      <header class="app-header">
        <div class="brand">
          <button type="button" class="brand__home" title="Choose a borough" aria-label="Choose a borough"
                  @click="goToPicker">
            <span class="brand__mark" aria-hidden="true"><school-icon kind="cap"/></span>
          </button>
          <div>
            <h1>Secondary school places</h1>
            <p>How close did you need to live to get a place? Cut-off distances for {{ shownBoroughNames }} schools.</p>
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
            <div v-if="boroughs.length > 1" class="borough-bar">
              <span>{{ shownBoroughLabel }}</span>
              <button type="button" class="borough-bar__change" @click="goToPicker">Change borough</button>
            </div>
            <name-filter v-model="nameFilter"/>
          </div>

          <ranked-list :rows="rankedRows" :selected-name="focused && focused.name" :year="year"
                       :borough-names="rowBoroughNames" @select="selectSchool"/>

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
          <button type="button" class="brand__home" title="Choose a borough" aria-label="Choose a borough"
                  @click="goToPicker">
            <span class="brand__mark brand__mark--small" aria-hidden="true"><school-icon kind="cap"/></span>
          </button>
          <h1>School places</h1>
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
        </div>
        <!-- Map tab only: the list's verdicts already cover every year -->
        <year-timeline v-if="view === 'map'" v-model="year" :years="YEARS" class="m-bar__years"/>
      </header>

      <main class="m-content" :class="`m-content--${view}`">
        <div v-show="view === 'list'" class="m-list">
          <p class="m-list__lead">{{ home ? 'Best chances first, from your address.' : 'Add your address to rank schools by your chances.' }}</p>
          <div v-if="boroughs.length > 1" class="borough-bar">
            <span>{{ shownBoroughLabel }}</span>
            <button type="button" class="borough-bar__change" @click="goToPicker">Change borough</button>
          </div>
          <name-filter v-model="nameFilter" id="name-filter-m"/>
          <ranked-list :rows="rankedRows" :selected-name="null" :year="year" :borough-names="rowBoroughNames"
                       @select="openSchool"/>
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
          <div class="m-page__years">
            <year-timeline v-model="year" :years="YEARS"/>
          </div>
          <div ref="pageBody" class="m-page__body">
            <schools-map :schools="schools" :year="year" :home="home" :selected="selected" :focus="selected"
                         height="220px" :interactive="false" expandable
                         :api-promise="apiPromise" :maps-ready="mapsReady" :maps-failed="mapsFailed"
                         @select="openSchool" @expand="openFullMap"/>
            <school-detail flat :school="selected" :assessment="assessments.get(selected)"
                           :year="year" :home="home"/>
          </div>
        </section>
      </transition>

      <!-- The school page's map made bigger: same header, the map fills the rest,
           starting at the intake view -->
      <transition name="grow">
        <section v-if="fullMap && pageOpen && selected" class="m-page m-full" role="dialog" aria-modal="true"
                 :aria-label="`${selected.name} map`">
          <div class="m-page__bar">
            <button type="button" class="icon-btn" aria-label="Back" @click="closeFullMap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25"
                   stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <span class="m-page__title">{{ selected.shortName }}</span>
          </div>
          <div class="m-page__years">
            <year-timeline v-model="year" :years="YEARS"/>
          </div>
          <div class="m-full__map">
            <schools-map :schools="schools" :year="year" :home="home" :selected="selected" :focus="selected"
                         height="100%" intake-first collapsible @collapse="closeFullMap"
                         :api-promise="apiPromise" :maps-ready="mapsReady" :maps-failed="mapsFailed"/>
            <map-legend compact class="m-map__legend"/>
          </div>
        </section>
      </transition>
    </div>

    <!-- Desktop dialogs stop short of the window edges rather than filling its height -->
    <v-dialog v-model="showHelp" max-width="780" :max-height="dialogMaxHeight" :fullscreen="narrow" scrollable>
      <Help @close="showHelp = false"/>
    </v-dialog>
    <v-dialog v-model="showTable" max-width="1100" :max-height="dialogMaxHeight" :fullscreen="narrow" scrollable>
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
import boroughs from '@/data/boroughs';
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
import BoroughPicker from './components/BoroughPicker.vue';
import Help from './Help.vue';

// Below this width the two columns don't fit: switch to the List / Map tabs.
const NARROW = '(max-width: 1019px)';

// Boroughs named in the link (?borough=ealing, ?borough=all), else the ones picked last
// visit. null when neither: the visitor starts on the borough picker.
function initialBoroughs() {
  const ids = boroughs.map(b => b.id);
  const known = list => (Array.isArray(list) ? ids.filter(id => list.includes(id)) : []);
  const param = new URLSearchParams(location.search).get('borough') || '';
  if (param === 'all') return ids;
  const fromLink = known(param.split(','));
  if (fromLink.length) return fromLink;
  const stored = known(readStored('boroughs'));
  return stored.length ? stored : null;
}

// Keep ?borough= in the address bar in step with what's shown, so the link can be shared.
function writeBoroughsToLink(ids) {
  const url = new URL(location.href);
  if (ids) url.searchParams.set('borough', ids.length === boroughs.length ? 'all' : ids.join(','));
  else url.searchParams.delete('borough');
  history.replaceState(history.state, '', url);
}

function joinNames(names) {
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
}

function readStored(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    return null;
  }
}

export default {
  name: 'App',
  components: {SchoolsMap, HomePicker, RankedList, YearTimeline, SchoolDetail, SchoolTable, NameFilter, MapLegend, MiniSpark, SchoolIcon, BoroughPicker, Help},
  data() {
    return {
      YEARS,
      allSchools: schools,
      boroughs,
      // Boroughs whose schools are shown: from the link, else remembered from last time.
      boroughIds: initialBoroughs() || boroughs.map(b => b.id),
      // No borough chosen yet: show the borough picker first.
      picking: !initialBoroughs(),
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
      fullMap: false, // the school page's map, full screen
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

    if (!this.picking) {
      writeBoroughsToLink(this.boroughIds);
      try {
        localStorage.setItem('boroughs', JSON.stringify(this.boroughIds)); // a shared link's choice sticks too
      } catch (e) {
        // storage unavailable
      }
    }

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
      const walkSchools = this.allSchools.filter(s => admission.measure(s) === 'walk');
      // Outlines are drawn on the map with or without a home (load skips ones it has).
      walkSchools.forEach(walking.load);
      if (this.home && this.mapsReady) walking.lookupWalks(walkSchools, this.home);
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
    pickBoroughs(ids) {
      this.boroughIds = ids;
      this.picking = false;
      this.focused = null;
      this.selected = this.rankedRows.length ? this.rankedRows[0].school : null;
      this.view = 'list';
      writeBoroughsToLink(ids);
      window.scrollTo(0, 0);
    },
    goToPicker() {
      this.picking = true;
      this.focused = null;
      writeBoroughsToLink(null);
      window.scrollTo(0, 0);
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
    openFullMap() {
      history.pushState({school: this.selected.name, map: true}, '');
      this.fullMap = true;
    },
    closeFullMap() {
      if (history.state && history.state.map) history.back();
      else this.fullMap = false;
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
      const school = name && this.allSchools.find(s => s.name === name);
      this.fullMap = !!(school && event.state.map);
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
    // The schools in the boroughs picked.
    schools() {
      return this.allSchools.filter(s => this.boroughIds.includes(s.borough));
    },
    // "Ealing and Hounslow", or "Ealing, Hounslow and Brent".
    boroughNames() {
      return joinNames(this.boroughs.map(b => b.name));
    },
    // "Ealing schools", or "All 46 schools" when every borough is shown.
    shownBoroughLabel() {
      if (this.boroughIds.length === this.boroughs.length) return `All ${this.allSchools.length} schools`;
      return `${this.shownBoroughNames} schools`;
    },
    shownBoroughNames() {
      return joinNames(this.boroughs.filter(b => this.boroughIds.includes(b.id)).map(b => b.name));
    },
    // Label each list row with its borough only while more than one is shown.
    rowBoroughNames() {
      if (this.boroughIds.length < 2) return null;
      return Object.fromEntries(this.boroughs.map(b => [b.id, b.shortName || b.name]));
    },
    assessments() {
      const map = new Map();
      this.allSchools.forEach(s => map.set(s, assess(s, this.home)));
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
    dialogMaxHeight() {
      return this.narrow ? undefined : 'min(760px, calc(100vh - 128px))';
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
      return `Figures come from ${this.boroughNames} councils’ offer reports and booklets, ` +
          `${YEARS[0]}–${YEARS[YEARS.length - 1]}, and from GOV.UK. They’re estimates to help you plan; ` +
          'the councils and schools make the admissions decisions.';
    },
    // Every school plus about 2 km either side, to steer address suggestions towards the area.
    searchArea() {
      const lats = this.allSchools.map(s => s.centre.lat);
      const lngs = this.allSchools.map(s => s.centre.lng);
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
    // Remember the boroughs picked, and let go of a school that's no longer shown.
    boroughIds(ids) {
      try {
        localStorage.setItem('boroughs', JSON.stringify(ids));
      } catch (e) {
        // storage unavailable – the choice lasts this visit
      }
      if (!this.picking) writeBoroughsToLink(ids);
      if (this.focused && !ids.includes(this.focused.borough)) this.focused = null;
      if (this.selected && !ids.includes(this.selected.borough)) {
        this.selected = this.rankedRows.length ? this.rankedRows[0].school : null;
      }
    },
    // Walking outlines (from CI) load straight away for the map; the walk from
    // home comes from Google once there's a home and its script has loaded.
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
      if (!now) this.fullMap = false;
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
.brand__home {
  flex: none;
  padding: 0;
  border: 0;
  border-radius: 12px;
  background: none;
  cursor: pointer;
  display: block;
  transition: transform .15s;
}
.brand__home:hover { transform: scale(1.05); }
.brand__home .brand__mark { display: block; }
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
.borough-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-2);
}
.borough-bar .borough-bar__change {
  padding: 6px 0;
  border: 0;
  background: none;
  font: 600 14px var(--font);
  color: var(--accent);
  cursor: pointer;
}
.borough-bar .borough-bar__change:hover { text-decoration: underline; text-underline-offset: 3px; }
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
.m-bar__years { margin: -2px 2px -6px; }

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
.m-page__bar + .m-page__years { margin-top: -1px; }
.m-page__years { flex: none; padding: 0 14px 2px; border-bottom: 1px solid var(--line); background: #fff; }
.m-page__body { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
.m-full { z-index: 1001; }
.m-full__map { position: relative; flex: 1; min-height: 0; }
.m-full__map .map { border-radius: 0 !important; }
.m-page__body .map { border-radius: 0 !important; }

.page-enter-active, .page-leave-active { transition: transform .26s cubic-bezier(0.22, 1, 0.36, 1), opacity .26s; }
.page-enter-from, .page-leave-to { transform: translateX(24px); opacity: 0; }
.grow-enter-active, .grow-leave-active { transition: opacity .18s; }
.grow-enter-from, .grow-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .page-enter-active, .page-leave-active, .grow-enter-active, .grow-leave-active { transition: none; }
}
</style>
