<template>
  <v-card rounded="xl" class="compare">
    <header class="compare-head">
      <div>
        <h2>Compare schools</h2>
        <p>
          The furthest distance a place was offered each year, in miles.
          <span v-if="home">Green: your home was inside it. Red: outside. Amber: too close to call.</span>
        </p>
      </div>
      <button type="button" class="icon-btn" aria-label="Close" @click="$emit('close')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25"
             stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </header>

    <!-- Scrolls in both directions if the dialog is ever too small for the table -->
    <div class="compare-body">
      <table class="compare-table">
        <thead>
        <tr>
          <th class="col-school">School</th>
          <th class="col-ofsted">Ofsted</th>
          <th class="col-trend"><span class="visually-hidden">Trend</span></th>
          <th v-for="y in years" :key="y" class="col-year" :class="{ current: y === year }">{{ y }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="school in schools" :key="school.name">
          <th scope="row" class="col-school">
            <button type="button" class="school-link" :title="school.name" @click="$emit('open', school)">
              <span class="swatch" :style="{ background: school.colour }"></span>{{ school.shortName }}
            </button>
            <span v-if="isWalk(school)" class="walk-tag">walk</span>
          </th>
          <td class="col-ofsted" :class="`tone--${ofstedTone(school)}`">{{ ofsted(school).label }}</td>
          <td class="col-trend">
            <mini-spark :school="school" :year="year" :dist="dist(school)" :width="72" :height="22"/>
          </td>
          <td v-for="y in years" :key="y" class="col-year" :class="[cellClass(school, y), { current: y === year }]">
            {{ formatDist(school.intakeDist[y]) }}
          </td>
        </tr>
        </tbody>
      </table>
      <p class="compare-foot">
        “All” means everyone who applied was offered a place. “–” means no places were offered on distance.
        Figures are estimates; Ealing Council makes all admissions decisions.
      </p>
    </div>
  </v-card>
</template>

<script>
import MiniSpark from "@/components/MiniSpark.vue";
import admission from "@/plugins/admission";
import ofsted from "@/plugins/ofsted";
import {assess} from "@/plugins/assess";

export default {
  name: "SchoolTable",
  components: {MiniSpark},
  props: {
    schools: {type: Array, required: true},
    years: {type: Array, required: true},
    year: {type: String, required: true},
    home: {type: Object, default: null},
  },
  emits: ['close', 'open'],
  methods: {
    formatDist(dist) {
      if (dist === undefined) return '';
      if (dist === 0) return '–';
      if (dist === null) return 'All';
      return dist.toFixed(2);
    },
    ofsted(school) {
      return ofsted.summary(school);
    },
    ofstedTone(school) {
      return ofsted.gradeTone(ofsted.summary(school).grade);
    },
    dist(school) {
      return this.home ? assess(school, this.home).dist : null;
    },
    isWalk(school) {
      return admission.measure(school) === 'walk';
    },
    cellClass(school, year) {
      if (!this.home) return '';
      const kind = admission.status(school, year, this.home).kind;
      return {in: 'cell-in', all: 'cell-in', out: 'cell-out', close: 'cell-close'}[kind] || '';
    },
  },
}
</script>

<style scoped>
.compare {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  font-family: var(--font);
  color: var(--ink);
}

.compare-head {
  flex: none;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 12px 12px 24px;
  border-bottom: 1px solid var(--line);
}
.compare-head h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.compare-head p { margin: 4px 0 0; font-size: 14px; color: var(--ink-3); }

.compare-body {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 0 16px 8px;
}

.compare-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
}
.compare-table th,
.compare-table td {
  padding: 8px 8px;
  border-bottom: 1px solid var(--line);
  text-align: left;
  white-space: nowrap;
}
.compare-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #fff;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink-3);
}

.col-school { font-weight: 600; }
.school-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: var(--ink);
  cursor: pointer;
}
.school-link:hover { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
.swatch { width: 10px; height: 10px; border-radius: 50%; flex: none; }
.walk-tag {
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
  background: #E6EEFE;
}

.col-ofsted { white-space: normal !important; min-width: 110px; max-width: 150px; font-size: 13px; font-weight: 600; line-height: 1.3; }
.tone--top { color: #14532D; }
.tone--good { color: #1E3A8A; }
.tone--mid, .tone--none { color: var(--ink-2); }
.tone--warn { color: #8A3A00; }
.tone--bad { color: #8B1C1C; }

.col-trend { padding-top: 4px !important; padding-bottom: 4px !important; }

.col-year { text-align: right !important; min-width: 46px; }
thead .col-year.current { color: var(--accent); }
td.col-year.current { font-weight: 700; }

.cell-in { background: #E3F4EA; }
.cell-out { background: #FDECEC; }
.cell-close { background: #FFF0E0; }

.compare-foot { margin: 12px 0 8px; font-size: 12.5px; color: var(--ink-3); }
</style>
