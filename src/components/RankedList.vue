<template>
  <div>
    <ol class="ranked">
      <li v-for="row in decorated" :key="row.school.name">
        <button type="button" :class="['row', {'row--on': row.school.name === selectedName}]"
                :aria-pressed="row.school.name === selectedName" @click="$emit('select', row.school)">
          <span class="row__dot" aria-hidden="true" :style="{background: row.school.colour}"></span>
          <span class="row__body">
            <span class="row__top">
              <span class="row__name">{{ row.school.shortName }}</span>
              <span v-if="row.a.distLabel" class="row__dist">{{ row.a.distLabel }}</span>
            </span>
            <span class="row__verdict">
              <span :class="['pill', `pill--${row.a.kind}`]">{{ row.a.verdict }}</span>
              <span class="row__sub">{{ row.a.sub }}</span>
            </span>
          </span>
          <svg class="row__spark" viewBox="0 0 80 43" preserveAspectRatio="none" aria-hidden="true">
            <rect v-for="b in row.bars" :key="b.year" :x="b.x" :y="36 - b.h" :width="b.w" :height="b.h" rx="1.5"
                  :fill="row.school.colour" :fill-opacity="b.opacity"/>
            <line v-if="row.youY !== null" x1="0" x2="80" :y1="row.youY" :y2="row.youY" stroke="#E8590C"
                  stroke-width="2" vector-effect="non-scaling-stroke"/>
            <polygon v-if="row.marker" :points="row.marker" class="row__marker"/>
          </svg>
        </button>
      </li>
    </ol>
    <p v-if="!rows.length" class="empty">No school names match that.</p>
  </div>
</template>

<script>
import {YEARS} from '@/plugins/assess';

export default {
  name: 'RankedList',
  props: {
    rows: {type: Array, required: true},
    selectedName: {type: String, default: null},
    year: {type: String, required: true},
  },
  emits: ['select'],
  computed: {
    decorated() {
      return this.rows.map(row => {
        const cuts = YEARS.map(y => row.school.intakeDist[y]);
        const nums = cuts.filter(c => c);
        const top = Math.max(...nums, row.a.dist || 0, 0.5) * 1.1;
        const gap = 2;
        const w = (80 - gap * (YEARS.length - 1)) / YEARS.length;
        const bars = cuts.map((c, i) => {
          const x = i * (w + gap);
          const hi = YEARS[i] === this.year;
          if (c === undefined || c === 0) return {year: YEARS[i], x, w, h: 2, opacity: 0.25};
          if (c === null) return {year: YEARS[i], x, w, h: 36, opacity: hi ? 0.3 : 0.15};
          return {year: YEARS[i], x, w, h: Math.max(3, (c / top) * 36), opacity: hi ? 1 : 0.5};
        });
        const youY = row.a.dist === null ? null : Math.max(1, 36 - (row.a.dist / top) * 36);
        // Small triangle under the chosen year's bar.
        const on = bars.find(b => b.year === this.year);
        const marker = on ? `${on.x + on.w / 2 - 3.5},43 ${on.x + on.w / 2 + 3.5},43 ${on.x + on.w / 2},38.5` : null;
        return {...row, bars, youY, marker};
      });
    },
  },
};
</script>

<style scoped>
.ranked { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.row {
  width: 100%;
  min-height: 64px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 2px solid transparent;
  box-shadow: 0 0 0 1px var(--line);
  background: #fff;
  color: var(--ink);
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font: inherit;
}
.row:hover { box-shadow: 0 0 0 1px var(--line-strong); }
.row--on { border-color: var(--accent); box-shadow: 0 2px 8px rgba(22, 24, 29, .08); }
.row__dot { width: 12px; height: 12px; border-radius: 50%; margin-top: 4px; flex: none; }
.row__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.row__top { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
.row__name { font-weight: 600; font-size: 15px; }
.row__dist { font-size: 13px; color: var(--ink-2); white-space: nowrap; }
.row__verdict { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.row__sub { font-size: 12px; color: var(--ink-3); }
.row__spark { width: 80px; height: 43px; flex: none; }
.row__marker { fill: var(--ink-2); }
.empty { margin: 0; font-size: 14px; color: var(--ink-3); }
</style>

<style>
.pill {
  display: inline-flex; align-items: center;
  height: 24px; padding: 0 10px;
  border-radius: 999px;
  font-size: 12px; font-weight: 700;
  background: #F1F2F4; color: #3A3F48;
  white-space: nowrap;
}
.pill--likely, .pill--open { background: #E3F4EA; color: #14532D; }
.pill--possible { background: #E6EEFE; color: #1E3A8A; }
.pill--unlikely { background: #FFF0E0; color: #8A3A00; }
</style>
