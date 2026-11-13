<template>
  <div class="school-row" :class="{ 'is-hidden': !school.visible, 'is-hovered': hovered }"
       role="button" tabindex="0"
       :aria-label="`${school.name}: open details`"
       @click="$emit('open', school)"
       @keydown.enter.prevent="$emit('open', school)"
       @keydown.space.prevent="$emit('open', school)">

    <label class="map-toggle" @click.stop v-tooltip:right="school.visible ? 'Hide on map' : 'Show on map'">
      <input type="checkbox" :checked="school.visible" @change="$emit('toggle', school)"
             :aria-label="`Show ${school.name} on the map`">
      <span class="map-toggle-box" :style="{ '--school': school.colour }">
        <v-icon size="14" color="white">mdi-check</v-icon>
      </span>
    </label>

    <div class="school-body">
      <div class="school-name">{{ school.name }}</div>
      <div class="school-meta">
        <span class="ofsted" :class="`text-${ofsted.colour}`">{{ ofsted.label }}</span>
        <span class="dot" aria-hidden="true">·</span>
        <span class="status" :class="statusClass">
          <v-icon v-if="statusIcon" size="14" class="mr-1">{{ statusIcon }}</v-icon>{{ statusText }}
        </span>
      </div>
    </div>

    <v-icon size="18" class="chevron">mdi-chevron-right</v-icon>
  </div>
</template>

<script>
import ofsted from '@/plugins/ofsted';
import admission from '@/plugins/admission';
import DistanceUtils from '@/plugins/distanceUtils';

export default {
  name: "SchoolCard",
  props: {
    school: {type: Object, required: true},
    year: {type: String, required: true},
    home: {type: Object, default: null},
    hovered: {type: Boolean, default: false},
  },
  emits: ['open', 'toggle'],
  computed: {
    ofsted() {
      return ofsted.summary(this.school);
    },
    status() {
      return admission.status(this.school, this.year, this.home);
    },
    statusIcon() {
      return this.home ? admission.STATUS_ICON[this.status.kind] : null;
    },
    statusClass() {
      const colour = admission.STATUS_COLOUR[this.status.kind];
      return this.home && colour !== 'grey' ? `text-${colour}` : '';
    },
    statusText() {
      const s = this.status;
      const miles = d => DistanceUtils.getHumanDistanceInMiles(d, 'en-GB', 'us');
      switch (s.kind) {
        case 'cutoff':
          return `Cut-off ${miles(s.cutoff)}` + (s.measure === 'walk' ? ' walk' : '');
        case 'in':
        case 'out':
          if (s.margin === null || s.lowerBound) return admission.STATUS_TEXT[s.kind];
          return `${miles(Math.abs(s.margin))} ${s.margin >= 0 ? 'inside' : 'outside'}`;
        default:
          return admission.STATUS_TEXT[s.kind];
      }
    },
  }
}
</script>

<style scoped>
.school-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px 10px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 140ms;
  outline: none;
}

.school-row:hover,
.school-row.is-hovered {
  background: rgba(var(--v-theme-primary), 0.06);
}

.school-row:focus-visible {
  box-shadow: inset 0 0 0 2px rgb(var(--v-theme-primary));
}

.map-toggle {
  position: relative;
  flex: none;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  margin: -4px;
  cursor: pointer;
}

.map-toggle input {
  position: absolute;
  opacity: 0;
  inset: 0;
  margin: 0;
  cursor: pointer;
}

.map-toggle-box {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 2px solid var(--school);
  background: var(--school);
  transition: background-color 140ms, opacity 140ms;
}

.map-toggle input:not(:checked) + .map-toggle-box {
  background: transparent;
}

.map-toggle input:not(:checked) + .map-toggle-box .v-icon {
  opacity: 0;
}

.map-toggle input:focus-visible + .map-toggle-box {
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.35);
}

.school-body {
  flex: 1;
  min-width: 0;
}

.school-name {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  color: rgb(var(--v-theme-on-surface));
}

.is-hidden .school-name {
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-weight: 500;
}

.school-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 6px;
  margin-top: 2px;
  font-size: 12.5px;
  color: rgba(var(--v-theme-on-surface), 0.68);
  font-variant-numeric: tabular-nums;
}

.ofsted {
  font-weight: 600;
}

.status {
  display: inline-flex;
  align-items: center;
}

.dot {
  opacity: 0.5;
}

.chevron {
  flex: none;
  opacity: 0.35;
  transition: opacity 140ms, transform 140ms;
}

.school-row:hover .chevron {
  opacity: 0.7;
  transform: translateX(2px);
}
</style>
