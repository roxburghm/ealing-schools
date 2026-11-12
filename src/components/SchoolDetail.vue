<template>
  <article class="card detail">
    <div class="detail__head">
      <div class="detail__title">
        <h2>{{ school.name }}</h2>
        <div class="detail__meta">
          <span :class="['ofsted', `ofsted--${ratingKey}`]">Ofsted: {{ ratingLabel }}</span>
          <span v-if="latestDate">last inspected {{ latestDate }}</span>
          <span aria-hidden="true">·</span>
          <span>{{ address }}</span>
        </div>
        <p v-if="ofstedSummary" class="detail__ofsted">{{ ofstedSummary }}</p>
      </div>
      <div class="detail__verdict">
        <span :class="['pill', 'pill--big', `pill--${assessment.kind}`]">{{ assessment.verdict }}</span>
        <span v-if="assessment.dist !== null">{{ formatMiles(assessment.dist) }} from your home</span>
      </div>
    </div>

    <p v-if="school.notes" class="detail__note"><strong>Note:</strong> {{ school.notes }}</p>

    <div class="detail__body">
      <figure class="chart">
        <figcaption>Furthest distance offered, by year <span class="chart__hint">(“All” = everyone who applied got a place)</span></figcaption>
        <div class="chart__plot" role="img" :aria-label="chartAlt" :style="{'--n': YEARS.length}">
          <div v-for="b in bars" :key="b.year" class="chart__col">
            <span class="chart__val">{{ b.label }}</span>
            <span class="chart__bar" :class="b.cls" :style="b.style"></span>
          </div>
          <span v-if="youBottom !== null" class="chart__you" :style="{bottom: youBottom + 'px'}">
            <span>You {{ formatMiles(assessment.dist) }}</span>
          </span>
        </div>
        <div class="chart__years" :style="{'--n': YEARS.length}">
          <span v-for="b in bars" :key="b.year" :class="{'is-on': b.year === year}">{{ b.year }}</span>
        </div>
      </figure>

      <div class="stats">
        <span class="stats__title">GCSE results</span>
        <div class="stat"><span>Progress 8</span><strong>{{ p8 }}</strong></div>
        <div class="stat"><span>Attainment 8</span><strong>{{ num(school.attainment8) }}</strong></div>
        <div class="stat"><span>Grade 5+ in English &amp; maths</span><strong>{{ pct(school.grade5Above) }}</strong></div>
        <span v-if="school.progress8Confidence" class="stats__foot">Progress 8 confidence: {{ school.progress8Confidence }}</span>
      </div>
    </div>

    <div class="detail__links">
      <a v-if="website" :href="website" target="_blank" rel="noopener" class="btn btn--primary">School website</a>
      <a v-if="school.intakeCriteria" :href="school.intakeCriteria" target="_blank" rel="noopener" class="btn">Admission rules</a>
      <a v-if="perf" :href="perf" target="_blank" rel="noopener" class="btn">Full performance data</a>
      <a v-if="school.phone" :href="`tel:${school.phone.replace(/\s/g, '')}`" class="btn">{{ school.phone }}</a>
    </div>
  </article>
</template>

<script>
import {YEARS, formatMiles} from '@/plugins/assess';

const PLOT_H = 170;

function niceDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleDateString('en-GB', {month: 'short', year: 'numeric'});
}

export default {
  name: 'SchoolDetail',
  props: {
    school: {type: Object, required: true},
    assessment: {type: Object, required: true},
    year: {type: String, required: true},
  },
  data() {
    return {YEARS};
  },
  computed: {
    ratingKey() {
      return (this.school.rating || 'none').toLowerCase();
    },
    ratingLabel() {
      const r = this.school.rating || 'Not rated';
      return r.charAt(0).toUpperCase() + r.slice(1);
    },
    latestDate() {
      return niceDate((this.school.ofstedLatest && this.school.ofstedLatest.date) || this.school.ratingDate);
    },
    ofstedSummary() {
      const s = this.school.ofstedLatest && this.school.ofstedLatest.summary;
      return s && s.toLowerCase() !== this.ratingKey ? s : '';
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
    top() {
      const nums = YEARS.map(y => this.school.intakeDist[y]).filter(c => c);
      return Math.max(...nums, this.assessment.dist || 0, 0.5) * 1.15;
    },
    bars() {
      return YEARS.map(y => {
        const c = this.school.intakeDist[y];
        const hi = y === this.year;
        const colour = this.school.colour;
        if (c === undefined || c === 0) return {year: y, label: 'n/a', cls: 'is-none', style: {}};
        if (c === null) return {year: y, label: 'All', cls: 'is-open', style: {'--c': colour}};
        return {
          year: y,
          label: formatMiles(c),
          cls: hi ? 'is-on' : '',
          style: {height: `${(c / this.top) * PLOT_H}px`, background: colour},
        };
      });
    },
    youBottom() {
      if (this.assessment.dist === null) return null;
      return Math.min(PLOT_H, (this.assessment.dist / this.top) * PLOT_H);
    },
    chartAlt() {
      const you = this.assessment.dist === null ? '' : `; your home is ${formatMiles(this.assessment.dist)} away`;
      return `${this.school.shortName}: furthest offer distance by year${you}`;
    },
    p8() {
      const v = this.school.progress8;
      return typeof v === 'number' ? (v > 0 ? '+' : '') + v.toFixed(2) : 'Not published';
    },
  },
  methods: {
    formatMiles,
    num(v) {
      return typeof v === 'number' ? v : 'Not published';
    },
    pct(v) {
      return typeof v === 'number' ? `${v}%` : 'Not published';
    },
  },
};
</script>

<style scoped>
.detail { padding: 20px 22px; display: flex; flex-direction: column; gap: 18px; }
.detail__head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; align-items: flex-start; }
.detail__title { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.detail__title h2 { margin: 0; font-family: var(--font-display); font-size: 22px; font-weight: 700; }
.detail__meta { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font-size: 13px; color: var(--ink-2); }
.detail__ofsted { margin: 0; font-size: 13px; color: var(--ink-2); }
.ofsted { display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: 6px; font-size: 12px; font-weight: 700; background: #F1F2F4; color: #3A3F48; }
.ofsted--outstanding { background: #E3F4EA; color: #14532D; }
.ofsted--good { background: #E6EEFE; color: #1E3A8A; }
.detail__verdict { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-size: 13px; color: var(--ink-2); }
.pill--big { height: 30px; font-size: 14px; padding: 0 14px; }
.detail__note { margin: 0; padding: 10px 12px; background: #FFF4E5; border-radius: 10px; font-size: 13px; color: #6B3A00; }

.detail__body { display: flex; flex-wrap: wrap; gap: 24px; }
.chart { margin: 0; flex: 2 1 340px; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.chart figcaption, .stats__title { font-size: 13px; font-weight: 600; }
.chart__hint { font-weight: 400; color: var(--ink-3); }
.chart__plot {
  position: relative;
  height: 170px;
  padding-top: 18px;
  display: grid;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
  gap: 8px;
  align-items: end;
  border-bottom: 1px solid var(--line-strong);
}
.chart__col { height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 4px; }
.chart__val { font-size: 11px; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
.chart__bar { width: 100%; border-radius: 6px 6px 0 0; opacity: .45; transition: height .2s; }
.chart__bar.is-on { opacity: 1; }
.chart__bar.is-none { height: 2px; background: var(--line-strong); opacity: 1; border-radius: 0; }
.chart__bar.is-open {
  flex: 1;
  opacity: 1;
  background: repeating-linear-gradient(135deg,
  color-mix(in srgb, var(--c) 14%, transparent) 0 6px,
  color-mix(in srgb, var(--c) 6%, transparent) 6px 12px);
}
.chart__you { position: absolute; left: 0; right: 0; border-top: 2px dashed var(--home); pointer-events: none; }
.chart__you span {
  position: absolute; right: 0; top: -18px;
  font-size: 11px; font-weight: 700; color: #B54708;
  background: #fff; padding: 0 4px;
}
.chart__years { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: 8px; }
.chart__years span { text-align: center; font-size: 11px; color: var(--ink-3); }
.chart__years span.is-on { font-weight: 700; color: var(--ink); }

.stats { flex: 1 1 200px; display: flex; flex-direction: column; gap: 10px; }
.stat { display: flex; justify-content: space-between; gap: 8px; padding-bottom: 8px; border-bottom: 1px solid #EEF0F3; font-size: 13px; color: var(--ink-2); }
.stat strong { color: var(--ink); font-size: 14px; }
.stats__foot { font-size: 12px; color: var(--ink-3); }

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
