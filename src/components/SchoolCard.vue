<template>
  <!-- Compact List Item Mode -->
  <v-list-item
    v-if="compact"
    :value="school"
    @click="$emit('school-visibility', school.visible)"
    class="mb-1 rounded-lg transition-swing"
    :class="{ 'school-disabled': !school.visible }"
    elevation="0"
    lines="two"
    density="compact"
  >
    <template v-slot:prepend>
       <div :style="'width: 4px; height: 32px; background-color: ' + school.colour" class="mr-3 rounded-pill"></div>
    </template>

    <v-list-item-title class="font-weight-bold text-body-2">
      {{ school.name }}
    </v-list-item-title>

    <v-list-item-subtitle class="d-flex align-center mt-1">
       <v-chip size="x-small" :color="ratingColor" label class="mr-2 font-weight-bold" density="comfortable" style="height: 18px;">
         {{ school.rating }}
       </v-chip>
       <span v-if="school.intakeDist[year]" class="text-caption text-medium-emphasis">
         {{ humanDistance(school.intakeDist[year]) }}
       </span>
    </v-list-item-subtitle>

    <template v-slot:append>
      <v-icon size="small" color="grey-lighten-1" icon="mdi-chevron-right"></v-icon>
    </template>
  </v-list-item>

  <!-- Card Mode (Fallback/Original) -->
  <v-card v-else class="mx-3 my-3 rounded-lg transition-swing" elevation="1" hover>
    <div :style="'height: 6px; background-color: ' + school.colour"></div>
    <v-card-text class="pa-4" :class="{ 'school-disabled' : !school.visible}"
                 @click="$emit('school-visibility', school.visible)"
                 style="cursor: pointer">
      <v-row dense align="center">
        <v-col cols="12" class="mb-1">
          <div class="text-subtitle-1 font-weight-bold text-high-emphasis text-wrap" style="line-height: 1.2;">{{ school.name }}</div>
        </v-col>

        <v-col cols="12" class="d-flex align-center flex-wrap">
              <v-chip size="x-small" class="mr-2 font-weight-medium" :variant="school.rating !== 'unknown' ? 'flat' : 'outlined'"
                      :color="ratingColor">
                  {{ school.rating }}
              </v-chip>
              <v-chip size="x-small" v-if="school.progress8" :color="p8Color" variant="flat"
                      class="font-weight-medium">
                  P8: {{ school.progress8 }}
              </v-chip>
              <v-spacer></v-spacer>
              <v-icon v-if="school.intakeCriteria" v-tooltip="'Has Intake Criteria'" color="primary" size="small">mdi-filter-variant</v-icon>
        </v-col>
        
        <v-col cols="12" class="text-caption font-italic text-medium-emphasis mt-2" v-if="school.intakeDist[year] === null">
          All applicants admitted
        </v-col>
        <v-col cols="12" v-if="school.notes !== null" class="text-caption text-medium-emphasis mt-1">
          {{ school.notes }}
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>

import utils from '@/plugins/utils.js';
import DistanceUtils from "@/plugins/distanceUtils.js";

export default {
  name: "SchoolCard",
  props: {
    school: {type: Object, required: true},
    year: {type: String, required: true},
    compact: {type: Boolean, default: false}
  },
  methods: {
    schoolFlashStyle(school) {
      return 'border-left: 10px solid ' + school.colour;
    },
    humanDistance(dist) {
      return DistanceUtils.getHumanDistanceInMiles(dist, 'en-GB', 'us');
    }
  },
  computed: {
    p8Color() {
      const p8 = parseFloat(this.school.progress8);
      if (p8 < 0) return 'red lighten-3';
      if (p8 < 0.5) return 'yellow';
      return 'green lighten-3';
    },
    ratingColor() {
      return utils.getRatingColor(this.school.rating);
    },
    confidenceColor() {
      return utils.getConfidenceColor(this.school.progress8Confidence)
    }
  }
}
</script>

<style scoped>
.v-tooltip__content {
  background: white !important;
  color: rgba(0, 0, 0, 0.87) !important;
  opacity: 1 !important;
}

.school-disabled {
  filter: grayscale(50%);
  opacity: 0.3;
  background-color: lightgrey;
}
</style>
