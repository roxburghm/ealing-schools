<template>
  <div class="school-list">
    <section class="home-section">
      <div class="section-title">Your home</div>
      <div id="home-address-input"></div>
      <p class="home-hint" v-if="!home">
        See how far you are from each school's cut-off. Your address stays on this device.
      </p>
      <p class="home-summary" v-else>
        <template v-if="counts.in + counts.all > 0">
          In {{ yearLabel }}, <strong>{{ counts.in + counts.all }} of {{ schools.length }}</strong> schools offered places
          at least as far out as your home<span v-if="counts.close">, and {{ counts.close }} {{ counts.close === 1 ? 'was' : 'were' }} too close to call</span>.
        </template>
        <template v-else>
          In {{ yearLabel }}, every school's cut-off fell short of your home<span v-if="counts.close">, though {{ counts.close }} {{ counts.close === 1 ? 'was' : 'were' }} too close to call</span>.
        </template>
      </p>
    </section>

    <div class="list-header">
      <div class="section-title">Schools</div>
      <v-btn-toggle v-if="home" v-model="sort" mandatory density="compact" variant="text" color="primary" class="sort-toggle">
        <v-btn value="name" size="small">A–Z</v-btn>
        <v-btn value="nearest" size="small">Nearest</v-btn>
      </v-btn-toggle>
    </div>

    <div class="rows">
      <school-card v-for="school in sortedSchools"
                   :key="school.name"
                   :school="school"
                   :year="year"
                   :home="home"
                   :hovered="hoveredSchool?.name === school.name"
                   @open="$emit('open', $event)"
                   @toggle="school.visible = !school.visible"
                   @mouseenter="$emit('hover-school', school)"
                   @mouseleave="$emit('hover-school', null)"
      />
    </div>

    <footer class="list-footer">
      Figures are approximate and for guidance only. Check each school's admissions policy.<br>
      Problems? <a href="mailto:matt@roxburghm.com">matt@roxburghm.com</a>
      <div class="build" v-if="buildDateTime">Build {{ buildDateTime }}</div>
    </footer>
  </div>
</template>

<script>
import SchoolCard from "./SchoolCard.vue";
import admission from '@/plugins/admission';
import DistanceUtils from '@/plugins/distanceUtils';

export default {
  name: "SchoolList",
  components: {SchoolCard},
  props: {
    schools: {type: Array, required: true},
    year: {type: String, required: true},
    yearLabel: {type: String, default: ''},
    home: {type: Object, default: null},
    hoveredSchool: {type: Object, default: null},
  },
  emits: ['open', 'hover-school'],
  data() {
    return {
      sort: 'name',
    }
  },
  computed: {
    counts() {
      const counts = {in: 0, all: 0, close: 0, out: 0};
      this.schools.forEach(school => {
        const kind = admission.status(school, this.year, this.home).kind;
        if (kind in counts) counts[kind]++;
      });
      return counts;
    },
    sortedSchools() {
      if (!this.home || this.sort === 'name') return this.schools;
      return [...this.schools].sort((a, b) =>
          DistanceUtils.getDistanceInMiles(a.centre, this.home) - DistanceUtils.getDistanceInMiles(b.centre, this.home));
    },
    buildDateTime() {
      return import.meta.env.VITE_BUILD_DATE_TIME;
    }
  }
}
</script>

<style scoped>
.school-list {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: rgb(var(--v-theme-surface));
}

.home-section {
  padding: 16px 16px 14px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 8px;
}

.home-hint,
.home-summary {
  margin: 10px 2px 0;
  font-size: 13px;
  line-height: 1.45;
  color: rgba(var(--v-theme-on-surface), 0.7);
  text-wrap: pretty;
}

.home-summary strong {
  color: rgb(var(--v-theme-on-surface));
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 12px 16px 0;
}

.list-header .section-title {
  margin-bottom: 0;
}

.sort-toggle {
  height: 28px !important;
}

.sort-toggle .v-btn {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
}

.rows {
  padding: 4px 8px 8px;
}

.list-footer {
  margin-top: auto;
  padding: 16px 20px 24px;
  font-size: 12px;
  line-height: 1.5;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.list-footer a {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}

.list-footer a:hover {
  text-decoration: underline;
}

.build {
  margin-top: 6px;
  opacity: 0.7;
}
</style>
