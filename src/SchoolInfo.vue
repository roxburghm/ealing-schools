<template>
  <v-card class="school-info" rounded="xl">
    <header class="info-header" :style="{ '--school': school.colour }">
      <div class="header-text">
        <h2 class="school-title">{{ school.name }}</h2>
        <div class="school-place">{{ place }}</div>
      </div>
      <v-btn icon="mdi-close" variant="text" color="white" aria-label="Close" @click="$emit('close')"/>
    </header>

    <v-card-text class="pa-0 info-scroll">
      <div class="info-grid">
        <main class="info-main">
          <section class="verdict" :class="`verdict--${verdictTone}`">
            <v-icon :color="verdictTone" size="22" class="verdict-icon">{{ verdictIcon }}</v-icon>
            <div>
              <div class="verdict-title">{{ verdict.title }}</div>
              <div class="verdict-body">{{ verdict.body }}</div>
            </div>
          </section>

          <dl class="facts">
            <div class="fact">
              <dt>Ofsted</dt>
              <dd :class="[`text-${ofsted.colour}`, { long: ofsted.label.length > 14 }]">{{ ofsted.label }}</dd>
              <div class="fact-note">{{ ofsted.caption }}</div>
            </div>
            <div class="fact" v-if="school.progress8 !== null && school.progress8 !== undefined">
              <dt>Progress 8</dt>
              <dd :class="p8Class">{{ p8 }}</dd>
              <div class="fact-note" v-if="school.progress8Confidence">{{ school.progress8Confidence }} confidence</div>
            </div>
            <div class="fact" v-if="school.attainment8">
              <dt>Attainment 8</dt>
              <dd>{{ school.attainment8 }}</dd>
              <div class="fact-note">Average GCSE score</div>
            </div>
            <div class="fact" v-if="school.grade5Above">
              <dt>Grade 5+</dt>
              <dd>{{ school.grade5Above }}%</dd>
              <div class="fact-note">In English &amp; maths</div>
            </div>
          </dl>

          <section class="block">
            <div class="block-head">
              <h3>Cut-off distance by year</h3>
              <span class="block-note">{{ measureNote }}</span>
            </div>
            <intake-chart :school="school" :years="numericYears" :selected="year" :home="home"/>
          </section>

          <section class="block">
            <h3>History</h3>
            <v-table density="comfortable" class="history">
              <thead>
              <tr>
                <th>Year</th>
                <th>Last place offered</th>
                <th v-if="home" class="text-right">Your home</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="row in history" :key="row.year" :class="{ current: row.year === year }">
                <td>{{ row.year }}</td>
                <td>{{ row.cutoff }}</td>
                <td v-if="home" class="text-right">
                  <span class="history-status" :class="`text-${row.colour}`">
                    {{ row.text }}
                    <v-icon v-if="row.icon" size="16" class="ml-1">{{ row.icon }}</v-icon>
                  </span>
                </td>
              </tr>
              </tbody>
            </v-table>
          </section>

          <section class="block" v-if="ofsted.areas">
            <div class="block-head">
              <h3>Ofsted {{ ofsted.kind === 'reportCard' ? 'report card' : 'area grades' }}</h3>
              <span class="block-note">{{ formatMonth(ofsted.date) }}</span>
            </div>
            <ul class="areas">
              <li v-for="(grade, area) in ofsted.areas" :key="area">
                <span>{{ area }}</span>
                <span class="grade" :class="`text-${gradeColour(grade)}`">{{ capitalise(grade) }}</span>
              </li>
              <li v-if="ofsted.safeguarding">
                <span>Safeguarding</span>
                <span class="grade" :class="ofsted.safeguarding === 'met' ? 'text-green-darken-2' : 'text-red-darken-2'">
                  {{ ofsted.safeguarding === 'met' ? 'Met' : 'Not met' }}
                </span>
              </li>
            </ul>
            <p class="block-foot" v-if="ofsted.previous">
              Last overall grade: {{ capitalise(ofsted.previous.grade) }} ({{ formatMonth(ofsted.previous.date) }}).
              <template v-if="ofsted.kind === 'reportCard'">Report cards no longer give an overall grade.</template>
              <template v-else>Inspections since September 2024 no longer give an overall grade.</template>
            </p>
          </section>

          <v-alert v-if="school.notes" type="info" variant="tonal" density="comfortable" class="notes">
            <div v-html="school.notes"></div>
          </v-alert>
        </main>

        <aside class="info-side">
          <div class="side-group">
            <h3>Contact</h3>
            <address class="address" v-html="school.address"></address>
            <a v-if="school.website" :href="websiteUrl" target="_blank" rel="noopener" class="side-link">
              <v-icon size="18">mdi-web</v-icon>Website
            </a>
            <a v-if="school.email" :href="'mailto:' + school.email" class="side-link">
              <v-icon size="18">mdi-email-outline</v-icon>{{ school.email }}
            </a>
            <a v-if="school.phone" :href="'tel:' + school.phone.replace(/\s/g, '')" class="side-link">
              <v-icon size="18">mdi-phone-outline</v-icon>{{ school.phone }}
            </a>
          </div>

          <div class="side-group">
            <h3>More detail</h3>
            <v-btn v-if="school.intakeCriteria" :href="school.intakeCriteria" target="_blank" rel="noopener"
                   block color="primary" variant="flat" prepend-icon="mdi-file-document-outline" class="mb-2">
              Admissions policy
            </v-btn>
            <v-btn v-if="ofstedUrl" :href="ofstedUrl" target="_blank" rel="noopener"
                   block variant="outlined" color="primary" prepend-icon="mdi-clipboard-check-outline" class="mb-2">
              Ofsted reports
            </v-btn>
            <v-btn v-if="school.perf" :href="school.perfDetailed || school.perf" target="_blank" rel="noopener"
                   block variant="outlined" color="primary" prepend-icon="mdi-chart-box-outline">
              Exam results
            </v-btn>
          </div>
        </aside>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import DistanceUtils from "@/plugins/distanceUtils";
import admission from "@/plugins/admission";
import ofsted from "@/plugins/ofsted";
import walking from "@/plugins/walking";
import IntakeChart from "@/components/IntakeChart.vue";

export default {
  name: 'SchoolInfo',
  components: {IntakeChart},
  props: {
    school: {type: Object, required: true},
    home: {type: Object, default: null},
    years: {type: Array, required: true},
    year: {type: String, required: true},
    yearLabel: {type: String, default: ''},
  },
  emits: ['close'],
  created() {
    if (admission.measure(this.school) === 'walk') walking.load(this.school);
  },
  computed: {
    numericYears() {
      return this.years.filter(year => !isNaN(parseInt(year)));
    },
    place() {
      const lines = (this.school.address || '').split('<br/>').map(l => l.trim()).filter(Boolean);
      return lines.filter(l => l !== this.school.name && l !== 'London').slice(-2).join(', ');
    },
    websiteUrl() {
      return /^https?:\/\//.test(this.school.website) ? this.school.website : `https://${this.school.website}`;
    },
    ofsted() {
      return ofsted.summary(this.school);
    },
    ofstedUrl() {
      return ofsted.reportUrl(this.school);
    },
    p8() {
      const value = Number(this.school.progress8);
      return value > 0 ? `+${value}` : `${value}`;
    },
    p8Class() {
      const value = Number(this.school.progress8);
      if (value >= 0.5) return 'text-green-darken-2';
      if (value >= 0) return 'text-green';
      if (value > -0.5) return 'text-orange-darken-2';
      return 'text-red-darken-2';
    },
    measureNote() {
      return admission.measure(this.school) === 'walk' ? 'Walking distance' : 'Straight line from the school';
    },
    status() {
      return admission.status(this.school, this.year, this.home);
    },
    verdictTone() {
      if (!this.home) return 'primary';
      const colour = admission.STATUS_COLOUR[this.status.kind];
      return colour === 'grey' ? 'primary' : colour;
    },
    verdictIcon() {
      if (!this.home) return 'mdi-home-search-outline';
      return admission.STATUS_ICON[this.status.kind] || 'mdi-information-outline';
    },
    verdict() {
      const s = this.status;
      const m = this.miles;
      const when = this.yearLabel;
      const how = admission.measureLabel(this.school);

      if (s.kind === 'all') {
        return {title: 'Everyone was offered a place', body: `In ${when}, every applicant who put this school down was offered a place.`};
      }
      if (s.kind === 'none') {
        return {title: 'No places offered on distance', body: `In ${when}, every place went to children in higher priority groups such as siblings.`};
      }
      if (s.kind === 'unknown') {
        return {title: 'No figure for this year', body: `There is no published cut-off for ${when}.`};
      }
      if (!this.home) {
        return {
          title: `Last place offered at ${m(s.cutoff)}`,
          body: `In ${when}, the furthest child offered a place on distance lived ${m(s.cutoff)} away (${how}). Add your address to compare.`,
        };
      }
      if (s.kind === 'pending') {
        return {
          title: 'Walking distance not yet calculated',
          body: `This school measures walking distance. You're ${m(s.straight)} away in a straight line, so your walk will be at least that. The cut-off in ${when} was ${m(s.cutoff)}.`,
        };
      }
      if (s.outlineOnly) {
        return {
          title: s.kind === 'in' ? 'Inside the walking cut-off' : 'Outside the walking cut-off',
          body: `Your home is ${s.kind === 'in' ? 'inside' : 'outside'} the area within ${m(s.cutoff)} walk of the school in ${when}. You're ${m(s.straight)} away in a straight line; an exact walking distance isn't available yet.`,
        };
      }
      if (s.lowerBound) {
        return {
          title: 'Outside the cut-off',
          body: `Even in a straight line you're ${m(s.straight)} away, and the walking cut-off in ${when} was ${m(s.cutoff)}.`,
        };
      }
      const banded = s.home.high - s.home.low > 0.001;
      const yours = !banded ? m(s.homeMiles)
          : m(s.home.low) === m(s.home.high) ? `about ${m(s.homeMiles)}`
              : `between ${m(s.home.low)} and ${m(s.home.high)}`;
      const intro = `Your home is ${yours} from the school (${how}). In ${when} the last place went to ${m(s.cutoff)}`;
      if (s.kind === 'close') {
        return {
          title: 'Too close to call',
          body: `${intro}. That's within the margin of error: the council measures from its own address points.`,
        };
      }
      return {
        title: s.kind === 'in' ? `${m(Math.abs(s.margin))} inside the cut-off` : `${m(Math.abs(s.margin))} outside the cut-off`,
        body: `${intro}.`,
      };
    },
    history() {
      return this.numericYears.filter(year => this.school.intakeDist[year] !== undefined).map(year => {
        const cutoff = this.school.intakeDist[year];
        const s = admission.status(this.school, year, this.home);
        let text = admission.STATUS_TEXT[s.kind] || '';
        if ((s.kind === 'in' || s.kind === 'out') && s.margin !== null && !s.lowerBound) {
          text = `${this.miles(Math.abs(s.margin))} ${s.margin >= 0 ? 'inside' : 'outside'}`;
        }
        if (s.kind === 'all') text = 'Offered';
        return {
          year,
          cutoff: cutoff === null ? 'Everyone offered' : cutoff === 0 ? 'No places by distance' : this.miles(cutoff),
          text,
          icon: admission.STATUS_ICON[s.kind],
          colour: admission.STATUS_COLOUR[s.kind],
        };
      }).reverse();
    },
  },
  methods: {
    miles(value) {
      return DistanceUtils.getHumanDistanceInMiles(value, 'en-GB', 'us');
    },
    formatMonth: ofsted.formatMonth,
    gradeColour: ofsted.gradeColour,
    capitalise: ofsted.capitalise,
  }
}
</script>

<style scoped>
.school-info {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: hidden;
}

.info-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 24px 16px 20px 28px;
  background: var(--school);
  color: white;
}

.header-text {
  flex: 1;
  min-width: 0;
}

.school-title {
  font-size: clamp(1.4rem, 1.1rem + 1.2vw, 1.9rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.015em;
  text-wrap: balance;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

.school-place {
  margin-top: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.88);
}

.info-scroll {
  overflow-y: auto;
}

.info-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
}

.info-main {
  padding: 24px 28px 28px;
}

.info-side {
  padding: 24px;
  background: rgb(var(--v-theme-background));
  border-left: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.verdict {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.07);
}

.verdict--success { background: rgba(var(--v-theme-success), 0.1); }
.verdict--error { background: rgba(var(--v-theme-error), 0.08); }
.verdict--warning { background: rgba(var(--v-theme-warning), 0.12); }

.verdict-icon {
  margin-top: 1px;
}

.verdict-title {
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.verdict-body {
  margin-top: 2px;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), 0.78);
  text-wrap: pretty;
}

.facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 1px;
  margin: 20px 0 0;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(var(--v-theme-on-surface), 0.08);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.fact {
  padding: 12px 14px;
  background: rgb(var(--v-theme-surface));
}

.fact dt {
  font-size: 12px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.fact dd {
  margin-top: 2px;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.25;
  font-variant-numeric: tabular-nums;
}

.fact dd.long {
  font-size: 16px;
}

.fact-note {
  margin-top: 2px;
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.block {
  margin-top: 32px;
}

.block h3,
.side-group h3 {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 10px;
}

.block-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.block-head h3 {
  margin-bottom: 0;
}

.block-note {
  font-size: 12.5px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.block-foot {
  margin-top: 10px;
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.65);
}

.history {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 10px;
  font-variant-numeric: tabular-nums;
}

.history th {
  font-weight: 600 !important;
  font-size: 12.5px;
  color: rgba(var(--v-theme-on-surface), 0.65) !important;
}

.history tr.current td {
  font-weight: 700;
  background: rgba(var(--v-theme-primary), 0.05);
}

.history-status {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.areas {
  list-style: none;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 10px;
}

.areas li {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 9px 14px;
  font-size: 14px;
}

.areas li + li {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.grade {
  font-weight: 600;
  white-space: nowrap;
}

.notes {
  margin-top: 24px;
}

.side-group + .side-group {
  margin-top: 28px;
}

.address {
  font-style: normal;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 10px;
}

.side-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 14px;
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  word-break: break-all;
}

.side-link:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 760px) {
  .info-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .info-main {
    padding: 20px 16px 24px;
  }

  .info-header {
    padding: 20px 8px 16px 16px;
  }

  .info-side {
    border-left: 0;
    border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
    padding: 20px 16px 28px;
  }
}
</style>
