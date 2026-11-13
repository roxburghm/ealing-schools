<template>
  <!-- One of four glyphs saying how a school offered places in a year. Drawn in currentColor. -->
  <svg viewBox="0 0 24 24" aria-hidden="true" class="school-icon">
    <!-- Everyone offered: a tick -->
    <path v-if="kind === 'open'" d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.5"
          stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Walking distance: a walking figure (Material Design Icons "walk") -->
    <path v-else-if="kind === 'walk'" fill="currentColor"
          d="M14.12,10H19V8.2H15.38L13.38,4.87C13.08,4.37 12.54,4.03 11.92,4.03C11.74,4.03 11.58,4.06 11.42,4.11L6,5.8V11H7.8V7.33L9.91,6.67L6,22H7.8L10.67,13.89L13,17V22H14.8V15.59L12.31,11.05L13.04,8.18M14,3.8C15,3.8 15.8,3 15.8,2C15.8,1 15,0.2 14,0.2C13,0.2 12.2,1 12.2,2C12.2,3 13,3.8 14,3.8Z"/>

    <!-- No places by distance: a dash -->
    <path v-else-if="kind === 'none'" d="M6.5 12h11" fill="none" stroke="currentColor" stroke-width="3.5"
          stroke-linecap="round"/>

    <!-- Straight-line distance cut-off: a radius -->
    <g v-else fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
      <circle cx="12" cy="12" r="8"/>
      <path d="M12 12l5.2-5.2"/>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'SchoolIcon',
  props: {
    // 'open' | 'walk' | 'none' | 'distance'
    kind: {type: String, required: true},
  },
};
</script>

<style scoped>
.school-icon { display: block; width: 100%; height: 100%; }
</style>
