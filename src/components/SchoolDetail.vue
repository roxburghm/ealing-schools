<template>
  <article class="card detail" :class="{'detail--flat': flat}">
    <div class="detail__head">
      <div class="detail__title">
        <h2>{{ school.name }}</h2>
        <div class="detail__meta">
          <span :class="['ofsted', `ofsted--${ofstedTone}`]">Ofsted: {{ ofsted.label }}</span>
          <span v-if="ofsted.caption">{{ ofsted.caption }}</span>
          <span aria-hidden="true">·</span>
          <span>{{ address }}</span>
        </div>
      </div>
      <div class="detail__verdict">
        <span :class="['pill', 'pill--big', `pill--${assessment.kind}`]">{{ assessment.verdict }}</span>
        <span v-if="assessment.distLabel">{{ assessment.distLabel }} from your home</span>
      </div>
    </div>

    <!-- Always present and a fixed height, so changing year doesn't move the content below -->
    <p :class="['detail__year', `detail__year--${status.kind}`]" aria-live="polite">{{ yearLine }}</p>

    <p class="detail__estimate">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
      <span><strong>Estimates only.</strong> These figures are worked out from past offers and our own distance
        measurements. Ealing Council’s admissions decisions are final.</span>
    </p>

    <p v-if="school.notes" class="detail__note"><strong>Note:</strong> {{ school.notes }}</p>

    <div class="detail__body">
      <figure class="chart">
        <figcaption>
          Furthest distance offered, by year
          <span class="chart__hint">({{ measureNote }}; hatched = everyone who applied got a place)</span>
        </figcaption>
        <intake-chart :school="school" :years="YEARS" :selected="year" :home="home"/>
      </figure>

      <div class="stats">
        <span class="stats__title">GCSE results</span>
        <div class="stat"><span>Progress 8</span><strong>{{ p8 }}</strong></div>
        <div class="stat"><span>Attainment 8</span><strong>{{ num(school.attainment8) }}</strong></div>
        <div class="stat"><span>Grade 5+ in English &amp; maths</span><strong>{{ pct(school.grade5Above) }}</strong></div>
        <span v-if="school.progress8Confidence" class="stats__foot">Progress 8 confidence: {{ school.progress8Confidence }}</span>
      </div>
    </div>

    <section v-if="ofsted.areas" class="areas">
      <h3>Ofsted {{ ofsted.kind === 'reportCard' ? 'report card' : 'area grades' }}, {{ formatMonth(ofsted.date) }}</h3>
      <ul>
        <li v-for="(grade, area) in ofsted.areas" :key="area">
          <span>{{ area }}</span>
          <span :class="['grade', `grade--${gradeTone(grade)}`]">{{ capitalise(grade) }}</span>
        </li>
        <li v-if="ofsted.safeguarding">
          <span>Safeguarding</span>
          <span :class="['grade', ofsted.safeguarding === 'met' ? 'grade--good' : 'grade--bad']">
            {{ ofsted.safeguarding === 'met' ? 'Met' : 'Not met' }}
          </span>
        </li>
      </ul>
      <p v-if="ofsted.previous" class="areas__foot">
        Last overall grade: {{ capitalise(ofsted.previous.grade) }} ({{ formatMonth(ofsted.previous.date) }}).
        Ofsted no longer gives an overall grade.
      </p>
    </section>

    <div class="detail__links">
      <a v-if="website" :href="website" target="_blank" rel="noopener" class="btn btn--primary">School website</a>
      <a v-if="school.intakeCriteria" :href="school.intakeCriteria" target="_blank" rel="noopener" class="btn">Admission rules</a>
      <a v-if="ofstedUrl" :href="ofstedUrl" target="_blank" rel="noopener" class="btn">Ofsted reports</a>
      <a v-if="perf" :href="perf" target="_blank" rel="noopener" class="btn">Full performance data</a>
      <a v-if="school.phone" :href="`tel:${school.phone.replace(/\s/g, '')}`" class="btn">{{ school.phone }}</a>
    </div>
  </article>
</template>

<script>
import {YEARS} from '@/plugins/assess';
import admission from '@/plugins/admission';
import ofsted from '@/plugins/ofsted';
import DistanceUtils from '@/plugins/distanceUtils';
import IntakeChart from '@/components/IntakeChart.vue';

export default {
  name: 'SchoolDetail',
  components: {IntakeChart},
  props: {
    school: {type: Object, required: true},
    assessment: {type: Object, required: true},
    year: {type: String, required: true},
    home: {type: Object, default: null},
    // On its own phone page: no card border.
    flat: {type: Boolean, default: false},
  },
  data() {
    return {YEARS};
  },
  computed: {
    ofsted() {
      return ofsted.summary(this.school);
    },
    ofstedTone() {
      return ofsted.gradeTone(this.ofsted.grade);
    },
    ofstedUrl() {
      return ofsted.reportUrl(this.school);
    },
    address() {
      return (this.school.address || '').split(/<br\s*\/?>/i).join(', ');
    },
    website() {
      const w = this.school.website;
      if (!w) return '';
      return /^https?:\/\//.test(w) ? w : `https://${w}`;
    },
    perf() {
      return this.school.perfDetailed || this.school.perf;
    },
    measureNote() {
      return admission.measure(this.school) === 'walk' ? 'walking distance' : 'straight line from the school';
    },
    status() {
      return admission.status(this.school, this.year, this.home);
    },
    // One sentence on the chosen year, e.g. "In 2026 your home was 390 yds inside the cut-off."
    yearLine() {
      const s = this.status;
      const m = this.miles;
      if (s.kind === 'all') return `In ${this.year} everyone who applied was offered a place.`;
      if (s.kind === 'none') return `In ${this.year} no places were offered on distance.`;
      if (!this.home || s.kind === 'cutoff' || s.kind === 'unknown') return '';
      if (s.kind === 'pending') {
        return `In ${this.year} the walking cut-off was ${m(s.cutoff)}. Your walk is at least ${m(s.straight)} (the straight-line distance); the exact route isn't calculated yet.`;
      }
      if (s.kind === 'close') return `In ${this.year} your home was too close to the ${m(s.cutoff)} cut-off to call.`;
      if (s.margin === null || s.lowerBound) {
        return `In ${this.year} your home was ${s.kind === 'in' ? 'inside' : 'outside'} the ${m(s.cutoff)} cut-off.`;
      }
      const side = `${m(Math.abs(s.margin))} ${s.margin >= 0 ? 'inside' : 'outside'}`;
      if (s.measure === 'walk') {
        return `In ${this.year} your ${m(s.homeMiles)} walk was ${side} the ${m(s.cutoff)} walking cut-off.`;
      }
      return `In ${this.year} your home was ${side} the ${m(s.cutoff)} cut-off.`;
    },
    p8() {
      const v = this.school.progress8;
      return typeof v === 'number' ? (v > 0 ? '+' : '') + v.toFixed(2) : 'Not published';
    },
  },
  methods: {
    miles(value) {
      return DistanceUtils.getHumanDistanceInMiles(value, 'en-GB', 'us');
    },
    num(v) {
      return typeof v === 'number' ? v : 'Not published';
    },
    pct(v) {
      return typeof v === 'number' ? `${v}%` : 'Not published';
    },
    formatMonth: ofsted.formatMonth,
    capitalise: ofsted.capitalise,
    gradeTone: ofsted.gradeTone,
  },
};
</script>

<style scoped>
.detail { padding: 20px 22px; display: flex; flex-direction: column; gap: 18px; }
.detail--flat { border: 0; border-radius: 0; padding: 16px 16px 32px; background: transparent; }
.detail--flat .detail__verdict { align-items: flex-start; }
.detail__head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; align-items: flex-start; }
.detail__title { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.detail__title h2 { margin: 0; font-family: var(--font-display); font-size: 22px; font-weight: 700; text-wrap: balance; }
.detail__meta { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font-size: 13px; color: var(--ink-2); }
.detail__verdict { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-size: 13px; color: var(--ink-2); font-variant-numeric: tabular-nums; }
.pill--big { height: 30px; font-size: 14px; padding: 0 14px; }

.ofsted { display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: 6px; font-size: 12px; font-weight: 700; background: #F1F2F4; color: #3A3F48; }
.ofsted--top { background: #E3F4EA; color: #14532D; }
.ofsted--good { background: #E6EEFE; color: #1E3A8A; }
.ofsted--warn { background: #FFF0E0; color: #8A3A00; }
.ofsted--bad { background: #FDE8E8; color: #8B1C1C; }

.detail__year {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  min-height: 3em; /* two lines */
  color: var(--ink-2);
}
@media (max-width: 600px) {
  .detail__year { min-height: 4.5em; } /* three lines on phones */
}
.detail__year--in, .detail__year--all { color: #14532D; }
.detail__year--out { color: #8B1C1C; }
.detail__year--close { color: #8A3A00; }

.detail__estimate {
  display: flex;
  gap: 8px;
  margin: -6px 0 0;
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--ink-3);
}
.detail__estimate svg { flex: none; margin-top: 1px; }
.detail__estimate strong { color: var(--ink-2); }
.detail__note { margin: 0; padding: 10px 12px; background: #FFF4E5; border-radius: 10px; font-size: 13px; color: #6B3A00; }

.detail__body { display: flex; flex-wrap: wrap; gap: 24px; }
.chart { margin: 0; flex: 2 1 340px; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.chart figcaption, .stats__title, .areas h3 { font-size: 13px; font-weight: 600; }
.chart__hint { font-weight: 400; color: var(--ink-3); }

.stats { flex: 1 1 200px; display: flex; flex-direction: column; gap: 10px; }
.stat { display: flex; justify-content: space-between; gap: 8px; padding-bottom: 8px; border-bottom: 1px solid #EEF0F3; font-size: 13px; color: var(--ink-2); }
.stat strong { color: var(--ink); font-size: 14px; font-variant-numeric: tabular-nums; }
.stats__foot { font-size: 12px; color: var(--ink-3); }

.areas { display: flex; flex-direction: column; gap: 8px; }
.areas h3 { margin: 0; }
.areas ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); column-gap: 24px; }
.areas li { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; border-bottom: 1px solid #EEF0F3; font-size: 13px; color: var(--ink-2); }
.grade { font-weight: 700; white-space: nowrap; }
.grade--top { color: #14532D; }
.grade--good { color: #1E3A8A; }
.grade--mid { color: var(--ink-2); }
.grade--warn { color: #8A3A00; }
.grade--bad { color: #8B1C1C; }
.areas__foot { margin: 0; font-size: 12px; color: var(--ink-3); }

.detail__links { display: flex; flex-wrap: wrap; gap: 8px; }
.btn {
  display: inline-flex; align-items: center;
  min-height: 44px; padding: 0 16px;
  border-radius: 10px; border: 1px solid var(--line-strong);
  color: var(--ink) !important; font-weight: 600; font-size: 14px; text-decoration: none;
}
.btn:hover { background: var(--ground); }
.btn--primary { background: var(--accent); border-color: var(--accent); color: #fff !important; }
.btn--primary:hover { background: var(--accent-dark); }
</style>
