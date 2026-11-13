<template>
  <v-card rounded="xl" class="compare">
    <header class="compare-head">
      <div>
        <h2>Compare schools</h2>
        <p>Distance of the last place offered each year, in miles<span v-if="home">. Shading shows whether your home was inside it.</span></p>
      </div>
      <v-btn icon="mdi-close" variant="text" aria-label="Close" @click="$emit('close')"/>
    </header>

    <v-card-text class="pa-0">
      <div class="table-scroll">
        <table class="compare-table">
          <thead>
          <tr>
            <th class="col-school">School</th>
            <th class="col-ofsted">Ofsted</th>
            <th class="col-trend">Trend</th>
            <th v-for="y in years" :key="y" class="col-year" :class="{ current: y === year }">{{ y }}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="school in schools" :key="school.name">
            <th scope="row" class="col-school">
              <button class="school-link" @click="$emit('open', school)">
                <span class="swatch" :style="{ background: school.colour }"></span>{{ school.name }}
              </button>
              <span v-if="isWalk(school)" class="walk-tag">walking</span>
            </th>
            <td class="col-ofsted">
              <span :class="`text-${ofsted(school).colour}`" class="font-weight-medium">{{ ofsted(school).label }}</span>
            </td>
            <td class="col-trend">
              <intake-chart :school="school" :years="years" :selected="isNaN(parseInt(year)) ? null : year" :home="home" compact/>
            </td>
            <td v-for="y in years" :key="y" class="col-year" :class="[cellClass(school, y), { current: y === year }]">
              {{ formatDist(school.intakeDist[y]) }}
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <p class="compare-foot">
        "All" means everyone who applied was offered a place. "–" means no places were offered on distance.
      </p>
    </v-card-text>
  </v-card>
</template>

<script>
import IntakeChart from "@/components/IntakeChart.vue";
import admission from "@/plugins/admission";
import ofsted from "@/plugins/ofsted";

export default {
  name: "SchoolTable",
  components: {IntakeChart},
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
}

.compare-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 12px 12px 24px;
}

.compare-head h2 {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.compare-head p {
  margin-top: 2px;
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.65);
}

.table-scroll {
  overflow-x: auto;
  padding: 0 12px;
}

.compare-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

.compare-table th,
.compare-table td {
  padding: 8px 10px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.07);
  text-align: left;
  white-space: nowrap;
}

.compare-table thead th {
  position: sticky;
  top: 0;
  background: rgb(var(--v-theme-surface));
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.65);
  z-index: 1;
}

.col-year {
  text-align: right !important;
  min-width: 56px;
}

thead .col-year.current {
  color: rgb(var(--v-theme-primary)) !important;
}

td.col-year.current {
  font-weight: 700;
}

.col-school {
  font-weight: 500;
}

.school-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font: inherit;
  color: rgb(var(--v-theme-on-surface));
  text-align: left;
  cursor: pointer;
}

.school-link:hover {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
  text-underline-offset: 3px;
}

.swatch {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex: none;
}

.walk-tag {
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.col-trend {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

.cell-in {
  background: rgba(var(--v-theme-success), 0.12);
}

.cell-out {
  background: rgba(var(--v-theme-error), 0.07);
}

.cell-close {
  background: rgba(var(--v-theme-warning), 0.16);
}

.compare-foot {
  padding: 12px 24px 20px;
  font-size: 12.5px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
</style>
