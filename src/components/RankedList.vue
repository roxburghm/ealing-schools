<template>
  <div>
    <ol class="ranked">
      <li v-for="row in rows" :key="row.school.name" :data-school="row.school.name">
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
              <span class="row__sub"><span v-if="boroughNames" class="row__borough">{{ boroughNames[row.school.borough] }} · </span>{{ row.a.sub }}</span>
            </span>
          </span>
          <mini-spark :school="row.school" :year="year" :dist="row.a.dist"/>
        </button>
      </li>
    </ol>
    <p v-if="!rows.length" class="empty">No school names match that.</p>
  </div>
</template>

<script>
import MiniSpark from '@/components/MiniSpark.vue';

export default {
  name: 'RankedList',
  components: {MiniSpark},
  props: {
    rows: {type: Array, required: true},
    selectedName: {type: String, default: null},
    year: {type: String, required: true},
    // borough id → name, when rows should say which borough they're in
    boroughNames: {type: Object, default: null},
  },
  emits: ['select'],
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
.row__borough { font-weight: 600; color: var(--ink-2); }
.row__verdict { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.row__sub { font-size: 12px; color: var(--ink-3); }
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
