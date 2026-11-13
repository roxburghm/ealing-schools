<template>
  <div class="legend" :class="{'legend--compact': compact}">
    <span><i class="lg-ring"></i>{{ compact ? `Cut-off ${year}` : `Furthest distance offered, ${year}` }}</span>
    <span><i class="lg-walk"></i>{{ compact ? 'Walking area' : 'Walking area (Drayton Manor)' }}</span>
    <span><i class="lg-open"></i>Everyone offered</span>
    <span><i class="lg-home"></i>{{ compact ? 'Your home' : 'Your home (click the map to move it)' }}</span>
  </div>
</template>

<script>
export default {
  name: 'MapLegend',
  props: {
    year: {type: String, required: true},
    // Short labels in a floating card, for the full-screen phone map.
    compact: {type: Boolean, default: false},
  },
};
</script>

<style scoped>
.legend { display: flex; flex-wrap: wrap; gap: 6px 18px; font-size: 12px; color: var(--ink-2); padding: 0 6px 2px; }
.legend span { display: flex; align-items: center; gap: 6px; }
.legend i { display: inline-block; flex: none; }
.legend--compact {
  display: grid;
  grid-template-columns: auto auto;
  gap: 4px 12px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, .94);
  box-shadow: 0 1px 2px rgba(22, 24, 29, .14), 0 2px 8px rgba(22, 24, 29, .08);
  font-size: 11px;
  pointer-events: none;
}
.lg-ring { width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--ink-2); background: rgba(58, 63, 72, .08); }
.lg-walk { width: 16px; height: 12px; border: 2px dashed var(--ink-2); border-radius: 3px; }
.lg-open { width: 10px; height: 10px; border-radius: 50%; background: #9AA1AC; box-shadow: 0 0 0 2px #fff, 0 0 0 3px #9AA1AC; }
.lg-home { width: 10px; height: 10px; border-radius: 50%; background: var(--home); }
.legend--compact .lg-ring { width: 12px; height: 12px; }
.legend--compact .lg-walk { width: 13px; height: 10px; }
</style>
