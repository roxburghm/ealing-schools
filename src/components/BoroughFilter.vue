<template>
  <div class="boroughs" role="group" aria-label="Show schools in">
    <span class="boroughs__label" aria-hidden="true">Boroughs</span>
    <button v-for="b in boroughs" :key="b.id" type="button" class="chip"
            :class="{'chip--on': isOn(b.id)}" :aria-pressed="isOn(b.id)"
            :title="isOn(b.id) && modelValue.length === 1 ? 'At least one borough stays on' : ''"
            @click="toggle(b.id)">
      <svg v-if="isOn(b.id)" class="chip__tick" width="14" height="14" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5"/>
      </svg>
      {{ b.name }}
      <span class="chip__count">{{ counts[b.id] || 0 }}</span>
    </button>
  </div>
</template>

<script>
// Toggle chips, one per borough. At least one stays on: switching off the last
// one would leave an empty list and map.
export default {
  name: 'BoroughFilter',
  props: {
    boroughs: {type: Array, required: true},
    // ids of the boroughs shown
    modelValue: {type: Array, required: true},
    counts: {type: Object, default: () => ({})},
  },
  emits: ['update:modelValue'],
  methods: {
    isOn(id) {
      return this.modelValue.includes(id);
    },
    toggle(id) {
      if (this.isOn(id)) {
        if (this.modelValue.length === 1) return;
        this.$emit('update:modelValue', this.modelValue.filter(x => x !== id));
      } else {
        // Keep the boroughs' own order rather than the order they were picked in.
        this.$emit('update:modelValue', this.boroughs.map(b => b.id).filter(x => x === id || this.isOn(x)));
      }
    },
  },
};
</script>

<style scoped>
.boroughs { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.boroughs__label { font-size: 13px; font-weight: 600; color: var(--ink-3); margin-right: 2px; }
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid #D5D9E0;
  border-radius: 999px;
  background: #fff;
  font: 600 14px var(--font);
  color: var(--ink-2);
  cursor: pointer;
  transition: background .12s, border-color .12s, color .12s;
}
.chip:hover { border-color: var(--line-strong); color: var(--ink); }
.chip:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.chip--on { background: #E6EEFE; border-color: transparent; color: var(--accent); }
.chip--on:hover { border-color: transparent; color: var(--accent); }
.chip__tick { margin-left: -2px; }
.chip__count { font-weight: 500; font-variant-numeric: tabular-nums; color: var(--ink-3); }
.chip--on .chip__count { color: var(--accent); opacity: .75; }
</style>
