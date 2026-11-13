<template>
  <div class="timeline" :style="{'--n': years.length}">
    <span class="timeline__track" aria-hidden="true"></span>
    <span class="timeline__fill" aria-hidden="true" :style="{width: fillWidth}"></span>
    <div v-for="(y, i) in years" :key="y" class="timeline__step" aria-hidden="true">
      <span :class="['timeline__dot', {'is-on': y === modelValue, 'is-past': i < index}]"></span>
      <span :class="['timeline__label', {'is-on': y === modelValue}]">’{{ y.slice(2) }}</span>
    </div>
    <!-- A real range input on top: drag, tap anywhere, or use the arrow keys -->
    <input class="timeline__range" type="range" min="0" :max="years.length - 1" step="1" :value="index"
           aria-label="Offer year" :aria-valuetext="modelValue"
           @input="$emit('update:modelValue', years[+$event.target.value])">
  </div>
</template>

<script>
export default {
  name: 'YearTimeline',
  props: {
    modelValue: {type: String, required: true},
    years: {type: Array, required: true},
  },
  emits: ['update:modelValue'],
  computed: {
    index() {
      return this.years.indexOf(this.modelValue);
    },
    fillWidth() {
      const n = this.years.length;
      return `${(this.index / (n - 1)) * (100 - 100 / n)}%`;
    },
  },
};
</script>

<style scoped>
.timeline {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
  flex: 0 1 380px;
  min-width: 0;
  border-radius: 10px;
}
.timeline:focus-within { outline: 2px solid var(--accent); outline-offset: 4px; }
.timeline__track, .timeline__fill {
  position: absolute;
  top: 14px;
  height: 2px;
  left: calc(50% / var(--n));
}
.timeline__track { right: calc(50% / var(--n)); background: var(--line); }
.timeline__fill { background: var(--accent); transition: width .15s; }
.timeline__step {
  position: relative;
  min-height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  pointer-events: none;
}
.timeline__dot {
  position: relative;
  z-index: 1;
  margin-top: 10px;
  width: 10px;
  height: 10px;
  box-sizing: border-box;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--line-strong);
  transition: all .15s;
}
.timeline__dot.is-past { background: var(--accent); border-color: var(--accent); }
.timeline__dot.is-on {
  margin-top: 7px;
  width: 16px;
  height: 16px;
  background: var(--accent);
  border: 0;
  box-shadow: 0 0 0 4px #fff, 0 0 0 6px var(--accent);
}
.timeline__label { font-size: 12px; font-weight: 500; color: var(--ink-3); font-variant-numeric: tabular-nums; }
.timeline__label.is-on { font-weight: 700; color: var(--ink); }

/* Invisible range input covering the whole timeline. Its thumb lines up with
   the dots because the range runs from the first dot's centre to the last's. */
.timeline__range {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(50% / var(--n) - 12px);
  width: calc(100% - 100% / var(--n) + 24px);
  margin: 0;
  opacity: 0;
  cursor: grab;
  touch-action: pan-y;
}
.timeline__range:active { cursor: grabbing; }
.timeline__range::-webkit-slider-thumb { width: 24px; height: 44px; -webkit-appearance: none; appearance: none; }
.timeline__range::-moz-range-thumb { width: 24px; height: 44px; border: 0; }

@media (max-width: 600px) {
  .timeline { flex: 1 1 100%; }
}
</style>
