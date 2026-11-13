<template>
  <v-app class="bg-background">
    <v-navigation-drawer v-model="drawer" :width="372" :temporary="mobile" elevation="0" class="side-panel">
      <school-list :year="year" :year-label="yearPhrase" :schools="schools" :home="home"
                   :hovered-school="hoveredSchool"
                   @open="showSchool"
                   @hover-school="hoveredSchool = $event"/>
    </v-navigation-drawer>

    <v-app-bar color="surface" elevation="0" density="comfortable" class="top-bar">
      <v-app-bar-nav-icon @click="drawer = !drawer" aria-label="Toggle school list"/>
      <div class="brand">
        <span class="brand-name"><span class="d-none d-sm-inline">Ealing school intake</span><span class="d-sm-none">Ealing intake</span></span>
        <span class="brand-sub d-none d-xl-inline">Secondary transfer distances</span>
      </div>
      <v-spacer/>

      <div class="d-none d-lg-flex align-center year-picker" role="group" aria-label="Year">
        <v-btn-toggle v-model="year" mandatory density="compact" variant="outlined" divided color="primary" class="mr-2">
          <v-btn v-for="y in numericYears" :key="y" :value="y" size="small">{{ y }}</v-btn>
        </v-btn-toggle>
        <v-btn-toggle v-model="year" mandatory density="compact" variant="outlined" divided color="primary">
          <v-btn v-for="y in summaryYears" :key="y.value" :value="y.value" size="small"
                 v-tooltip:bottom="y.hint">{{ y.title }}</v-btn>
        </v-btn-toggle>
      </div>

      <v-select class="d-lg-none year-select" v-model="year" :items="yearItems" item-title="title" item-value="value"
                density="compact" variant="outlined" hide-details label="Year" color="primary"/>

      <v-btn icon variant="text" aria-label="Compare all schools" v-tooltip:bottom="'Compare all schools'" @click="showTable = true">
        <v-icon>mdi-table</v-icon>
      </v-btn>
      <v-btn icon variant="text" aria-label="About this data" v-tooltip:bottom="'About this data'" @click="showHelp = true">
        <v-icon>mdi-information-outline</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <SchoolsMap :schools="schools" :year="year" :year-label="yearPhrase"
                  :hovered-school="hoveredSchool"
                  @show-school-info="showSchool"
                  @hover-school="hoveredSchool = $event"/>
    </v-main>

    <v-dialog v-model="showHelp" max-width="780" :fullscreen="mobile" scrollable>
      <Help @close="showHelp = false"/>
    </v-dialog>

    <v-dialog v-model="showTable" max-width="1100" :fullscreen="mobile" scrollable>
      <SchoolTable :years="numericYears" :year="year" :schools="schools" :home="home"
                   @close="showTable = false" @open="showSchool"/>
    </v-dialog>

    <v-dialog v-model="showSchoolInfo" max-width="960" :fullscreen="mobile" scrollable>
      <SchoolInfo v-if="currentSchool" :school="currentSchool" :home="home" :years="numericYears"
                  :year="year" :year-label="yearPhrase" @close="showSchoolInfo = false"/>
    </v-dialog>
  </v-app>
</template>

<script>
import {useDisplay} from 'vuetify';
import SchoolsMap from './components/SchoolsMap.vue'
import SchoolList from "./components/SchoolList.vue";
import schools from '@/plugins/schools';
import walking from '@/plugins/walking';
import admission from '@/plugins/admission';
import Help from "@/Help.vue";
import SchoolInfo from "@/SchoolInfo.vue";
import SchoolTable from "@/components/SchoolTable.vue";

function hasSavedHome() {
  try {
    return !!localStorage.getItem('home');
  } catch (e) {
    return false;
  }
}

const SUMMARY_YEARS = [
  {value: 'min', title: 'Tightest', phrase: 'the tightest year', hint: 'Smallest cut-off across all years'},
  {value: 'max', title: 'Widest', phrase: 'the widest year', hint: 'Largest cut-off across all years'},
  {value: 'average', title: 'Average', phrase: 'an average year', hint: 'Average cut-off across all years'},
];

export default {
  name: 'App',
  components: {SchoolTable, SchoolInfo, Help, SchoolList, SchoolsMap},
  setup() {
    const {mobile} = useDisplay();
    return {mobile};
  },
  data() {
    return {
      schools,
      // On phones the list covers the map, so only open it when there's no saved address yet.
      drawer: !this.mobile || !hasSavedHome(),
      currentSchool: null,
      showSchoolInfo: false,
      showHelp: false,
      showTable: false,
      year: '2026',
      numericYears: ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'],
      summaryYears: SUMMARY_YEARS,
      hoveredSchool: null,
    }
  },
  methods: {
    showSchool(school) {
      if (this.mobile) this.drawer = false;
      this.currentSchool = school;
      this.showSchoolInfo = true;
    },
  },
  watch: {
    // Walking bands are only needed once there's a home to measure from.
    home: {
      immediate: true,
      handler(home) {
        if (!home) return;
        this.schools.filter(s => admission.measure(s) === 'walk').forEach(walking.load);
      },
    },
  },
  computed: {
    yearItems() {
      return [...[...this.numericYears].reverse().map(y => ({value: y, title: y})), ...SUMMARY_YEARS];
    },
    yearPhrase() {
      return SUMMARY_YEARS.find(y => y.value === this.year)?.phrase || this.year;
    },
    home() {
      return this.$store.state.homeLocation;
    },
  }
}
</script>

<style>
html {
  overflow-y: auto;
}

body,
.v-application {
  font-family: 'Inter', system-ui, sans-serif !important;
  -webkit-font-smoothing: antialiased;
}

::selection {
  background: rgba(63, 81, 181, 0.22);
}

:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.v-btn {
  text-transform: none !important;
  letter-spacing: 0 !important;
}

.top-bar {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08) !important;
}

.side-panel {
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.08) !important;
}

.brand {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-left: 4px;
  min-width: 0;
}

.brand-name {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: rgb(var(--v-theme-primary));
  white-space: nowrap;
}

.brand-sub {
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  white-space: nowrap;
}

.year-picker .v-btn {
  font-variant-numeric: tabular-nums;
  min-width: 0 !important;
  padding: 0 10px !important;
}

.year-select {
  flex: 0 0 128px;
  margin-right: 4px;
}
</style>
