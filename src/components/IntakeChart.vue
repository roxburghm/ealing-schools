<template>
  <svg :viewBox="`0 0 ${width} ${height}`" class="intake-chart" :class="{ compact }"
       role="img" :aria-label="ariaLabel" preserveAspectRatio="xMidYMid meet">
    <defs>
      <pattern :id="patternId" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="6" height="6" class="all-fill"/>
        <line x1="0" y1="0" x2="0" y2="6" class="all-hatch"/>
      </pattern>
    </defs>

    <g v-if="!compact" class="axis">
      <g v-for="tick in ticks" :key="tick">
        <line :x1="pad.left" :x2="width - pad.right" :y1="y(tick)" :y2="y(tick)" class="grid"/>
        <text :x="pad.left - 8" :y="y(tick)" dy="0.32em" text-anchor="end">{{ tickLabel(tick) }}</text>
      </g>
    </g>

    <g v-for="(bar, i) in bars" :key="bar.year" :class="{ dim: selected && bar.year !== selected }" class="bar">
      <title>{{ bar.year }}: {{ bar.title }}</title>
      <rect v-if="bar.kind === 'value'"
            :x="x(i)" :y="y(bar.value)" :width="barWidth" :height="Math.max(1, y(0) - y(bar.value))"
            :rx="compact ? 1 : 3" :fill="colour"/>
      <rect v-else-if="bar.kind === 'all'"
            :x="x(i)" :y="pad.top" :width="barWidth" :height="y(0) - pad.top"
            :rx="compact ? 1 : 3" :fill="`url(#${patternId})`" class="all-bar"/>

      <template v-if="!compact">
        <text v-if="bar.kind !== 'missing'" :x="x(i) + barWidth / 2"
              :y="bar.kind === 'value' ? y(bar.value) - 6 : (bar.kind === 'all' ? pad.top - 6 : y(0) - 6)"
              text-anchor="middle" class="value">{{ bar.short }}</text>
        <text :x="x(i) + barWidth / 2" :y="height - 8" text-anchor="middle"
              class="year" :class="{ current: bar.year === selected }">{{ bar.year }}</text>
      </template>
    </g>

    <g v-if="homeLine" class="home">
      <rect v-if="homeLine.band" :x="pad.left" :width="width - pad.left - pad.right"
            :y="y(homeLine.high)" :height="Math.max(1, y(homeLine.low) - y(homeLine.high))" class="home-band"/>
      <line :x1="pad.left" :x2="width - pad.right + (compact ? 0 : 6)" :y1="y(homeLine.value)" :y2="y(homeLine.value)" class="home-line"/>
      <g v-if="!compact">
        <rect :x="width - pad.right + 6" :y="y(homeLine.value) - 10" :width="homeLabelWidth" height="20" rx="10" class="home-pill"/>
        <text :x="width - pad.right + 6 + homeLabelWidth / 2" :y="y(homeLine.value)" dy="0.34em" text-anchor="middle" class="home-text">{{ homeLine.label }}</text>
      </g>
    </g>
  </svg>
</template>

<script>
import admission from '@/plugins/admission';
import DistanceUtils from '@/plugins/distanceUtils';

let uid = 0;

export default {
  name: 'IntakeChart',
  props: {
    school: {type: Object, required: true},
    years: {type: Array, required: true},
    selected: {type: String, default: null},
    home: {type: Object, default: null},
    compact: {type: Boolean, default: false},
  },
  data() {
    return {patternId: `all-offered-${uid++}`, measured: 600};
  },
  mounted() {
    // Draw at the real pixel width so labels stay legible on phones.
    if (this.compact || typeof ResizeObserver === 'undefined') return;
    this.observer = new ResizeObserver(([entry]) => {
      this.measured = Math.max(300, Math.round(entry.contentRect.width));
    });
    this.observer.observe(this.$el.parentElement);
  },
  beforeUnmount() {
    this.observer?.disconnect();
  },
  computed: {
    width() {
      return this.compact ? 132 : this.measured;
    },
    height() {
      return this.compact ? 34 : (this.measured < 480 ? 210 : 240);
    },
    pad() {
      return this.compact
          ? {top: 2, right: 2, bottom: 2, left: 2}
          : {top: 26, right: this.home ? 96 : 12, bottom: 30, left: this.measured < 480 ? 40 : 52};
    },
    narrow() {
      return !this.compact && this.measured < 480;
    },
    colour() {
      return this.school.colour;
    },
    bars() {
      return this.years.map(year => {
        const value = this.school.intakeDist[year];
        if (value === undefined) return {year, kind: 'missing', title: 'no data'};
        if (value === null) return {year, kind: 'all', short: 'All', title: 'everyone offered a place'};
        if (value === 0) return {year, kind: 'none', short: '–', title: 'no places offered by distance'};
        const short = this.narrow ? value.toFixed(2) : this.miles(value);
        return {year, kind: 'value', value, short, title: `last place offered at ${this.miles(value)}`};
      });
    },
    homeLine() {
      if (!this.home) return null;
      const year = this.selected && !isNaN(parseInt(this.selected)) ? this.selected : this.years[this.years.length - 1];
      const status = admission.status(this.school, year, this.home);
      if (status.home && status.home.high !== null && status.home.high !== undefined) {
        const band = status.home.high - status.home.low > 0.001;
        return {
          value: status.homeMiles,
          low: status.home.low,
          high: status.home.high,
          band,
          label: `You ${band ? '~' : ''}${this.miles(status.homeMiles)}`,
        };
      }
      if (status.straight !== undefined) {
        // Walking-distance schools without a walking estimate: the straight
        // line is only a lower bound.
        const prefix = status.measure === 'walk' ? 'You ≥ ' : 'You ';
        return {value: status.straight, label: prefix + this.miles(status.straight)};
      }
      const straight = DistanceUtils.getDistanceInMiles(this.school.centre, this.home);
      return {value: straight, label: `You ${this.miles(straight)}`};
    },
    homeLabelWidth() {
      return this.homeLine ? Math.min(this.pad.right - 6, this.homeLine.label.length * 6.4 + 14) : 0;
    },
    maxValue() {
      const values = this.bars.filter(b => b.kind === 'value').map(b => b.value);
      if (this.homeLine) values.push(this.homeLine.high ?? this.homeLine.value);
      const max = Math.max(0.25, ...values);
      const step = this.step(max);
      return Math.ceil((max * 1.08) / step) * step;
    },
    ticks() {
      const step = this.step(this.maxValue);
      const ticks = [];
      for (let t = 0; t <= this.maxValue + 1e-9; t += step) ticks.push(Math.round(t * 100) / 100);
      return ticks;
    },
    slot() {
      return (this.width - this.pad.left - this.pad.right) / this.years.length;
    },
    barWidth() {
      return this.slot * (this.compact ? 0.7 : 0.56);
    },
    ariaLabel() {
      return `Cut-off distance by year for ${this.school.name}: ` + this.bars.map(b => `${b.year} ${b.title}`).join(', ');
    },
  },
  methods: {
    step(max) {
      if (max <= 0.6) return 0.1;
      if (max <= 1.5) return 0.25;
      if (max <= 3) return 0.5;
      return 1;
    },
    x(i) {
      return this.pad.left + i * this.slot + (this.slot - this.barWidth) / 2;
    },
    y(value) {
      const h = this.height - this.pad.top - this.pad.bottom;
      return this.pad.top + h - (value / this.maxValue) * h;
    },
    miles(value) {
      return DistanceUtils.getHumanDistanceInMiles(value, 'en-GB', 'us');
    },
    tickLabel(tick) {
      return tick === 0 ? '0' : `${tick} mi`;
    },
  },
}
</script>

<style scoped>
.intake-chart {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  font-family: inherit;
  font-variant-numeric: tabular-nums;
}

.intake-chart.compact {
  width: 132px;
}

.axis text {
  font-size: 11px;
  fill: rgba(var(--v-theme-on-surface), 0.55);
}

.grid {
  stroke: rgba(var(--v-theme-on-surface), 0.08);
  stroke-width: 1;
}

.bar {
  transition: opacity 160ms;
}

.bar.dim {
  opacity: 0.42;
}

.value {
  font-size: 11.5px;
  font-weight: 600;
  fill: rgba(var(--v-theme-on-surface), 0.8);
}

.year {
  font-size: 12px;
  fill: rgba(var(--v-theme-on-surface), 0.6);
}

.year.current {
  font-weight: 700;
  fill: rgb(var(--v-theme-on-surface));
}

.all-fill {
  fill: rgba(46, 125, 50, 0.1);
}

.all-hatch {
  stroke: rgba(46, 125, 50, 0.45);
  stroke-width: 2;
}

.all-bar {
  stroke: rgba(46, 125, 50, 0.4);
  stroke-width: 1;
}

.home-band {
  fill: var(--home, rgb(var(--v-theme-primary)));
  fill-opacity: 0.12;
}

.home-line {
  stroke: var(--home, rgb(var(--v-theme-primary)));
  stroke-width: 2;
  stroke-dasharray: 6 4;
}

.compact .home-line {
  stroke-width: 1.5;
  stroke-dasharray: 3 2;
}

.home-pill {
  fill: var(--home-dark, var(--home, rgb(var(--v-theme-primary))));
}

.home-text {
  font-size: 11px;
  font-weight: 600;
  fill: rgb(var(--v-theme-on-primary));
}
</style>
