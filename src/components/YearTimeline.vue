<template>
  <nav class="timeline" aria-label="Offer year" :style="{'--n': years.length}">
    <span class="timeline__track" aria-hidden="true"></span>
    <span class="timeline__fill" aria-hidden="true" :style="{width: fillWidth}"></span>
    <button v-for="(y, i) in years" :key="y" type="button" class="timeline__step"
            :aria-pressed="y === modelValue" :aria-label="`Show ${y}`" @click="$emit('update:modelValue', y)">
      <span :class="['timeline__dot', {'is-on': y === modelValue, 'is-past': i < index}]"></span>
      <span :class="['timeline__label', {'is-on': y === modelValue}]">{{ y }}</span>
    </button>
  </nav>
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
  flex: 0 1 460px;
  min-width: 300px;
}
.timeline__track, .timeline__fill {
  position: absolute;
  top: 14px;
  height: 2px;
  left: calc(50% / var(--n));
}
.timeline__track { right: calc(50% / var(--n)); background: var(--line); }
.timeline__fill { background: var(--accent); transition: width .2s; }
.timeline__step {
  position: relative;
  min-height: 48px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
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
.timeline__label { font-size: 12px; font-weight: 500; color: var(--ink-3); }
.timeline__label.is-on { font-weight: 700; color: var(--ink); }
.timeline__step:hover .timeline__dot:not(.is-on) { border-color: var(--accent); }
</style>
