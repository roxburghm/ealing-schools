<template>
  <!-- A school's cut-off for each year as small bars, your home as an orange line,
       and a triangle under the chosen year. Pale full-height bars: everyone offered. -->
  <svg class="mini-spark" :viewBox="`0 0 ${width} ${height + 7}`" :style="{width: `${width}px`, height: `${height + 7}px`}"
       preserveAspectRatio="none" aria-hidden="true">
    <rect v-for="b in bars" :key="b.year" :x="b.x" :y="height - b.h" :width="b.w" :height="b.h" rx="1.5"
          :fill="school.colour" :fill-opacity="b.opacity"/>
    <line v-if="youY !== null" x1="0" :x2="width" :y1="youY" :y2="youY" stroke="#E8590C"
          stroke-width="2" vector-effect="non-scaling-stroke"/>
    <polygon v-if="marker" :points="marker" class="mini-spark__marker"/>
  </svg>
</template>

<script>
import {YEARS} from '@/plugins/assess';

export default {
  name: 'MiniSpark',
  props: {
    school: {type: Object, required: true},
    year: {type: String, required: true},
    // Distance from home in miles, or null without a home.
    dist: {type: Number, default: null},
    width: {type: Number, default: 80},
    // Height of the bar area; the year marker adds 7 below.
    height: {type: Number, default: 36},
  },
  computed: {
    top() {
      const nums = YEARS.map(y => this.school.intakeDist[y]).filter(c => c);
      return Math.max(...nums, this.dist || 0, 0.5) * 1.1;
    },
    bars() {
      const gap = this.width > 100 ? 3 : 2;
      const w = (this.width - gap * (YEARS.length - 1)) / YEARS.length;
      return YEARS.map((year, i) => {
        const c = this.school.intakeDist[year];
        const x = i * (w + gap);
        const on = year === this.year;
        if (c === undefined || c === 0) return {year, x, w, h: 2, opacity: 0.25};
        if (c === null) return {year, x, w, h: this.height, opacity: on ? 0.3 : 0.15};
        return {year, x, w, h: Math.max(3, (c / this.top) * this.height), opacity: on ? 1 : 0.5};
      });
    },
    youY() {
      return this.dist === null ? null : Math.max(1, this.height - (this.dist / this.top) * this.height);
    },
    marker() {
      const on = this.bars.find(b => b.year === this.year);
      if (!on) return null;
      const cx = on.x + on.w / 2;
      const bottom = this.height + 7;
      return `${cx - 3.5},${bottom} ${cx + 3.5},${bottom} ${cx},${bottom - 4.5}`;
    },
  },
};
</script>

<style scoped>
.mini-spark { display: block; flex: none; }
.mini-spark__marker { fill: var(--ink-2); }
</style>
