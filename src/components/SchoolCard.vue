<template>
  <v-card class="mx-2 my-2" elevation="1">
    <v-card-text class="py-1 px-2" :class="{ 'school-disabled' : !school.visible}"
                 @click="$emit('school-visibility', school.visible)">
      <v-row dense class="align-content-center" :style="schoolFlashStyle(school)">
        <v-col cols="12">
          {{ school.name }}
        </v-col>


        <v-col cols="11">
              <v-chip size="x-small" class="mr-1" :outlined="school.rating !== 'unknown'"
                      :color="ratingColor">
                  {{ school.rating }}
              </v-chip>
              <v-chip size="x-small" v-if="school.progress8" :color="p8Color"
                      :text-color="p8Color === 'yellow' ? 'black' : 'white'">
                  p8: {{ school.progress8 }}
              </v-chip>
        </v-col>
          <v-col cols="1">
            <v-icon v-if="school.intakeCriteria" v-tooltip="'Has Intake Criteria'" class="d-inline-block" size="small">mdi-filter-outline</v-icon>

        </v-col>
        <v-col cols="12" class="caption font-italic" v-if="school.intakeDist[year] === null">
          All applicants admitted
        </v-col>
        <v-col cols="12" v-if="school.notes !== null" class="text-caption text-grey">
          {{ school.notes }}
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>

import utils from '@/plugins/utils.js';

export default {
  name: "SchoolCard",
  props: {
    school: {type: Object, required: true},
    year: {type: String, required: true}
  },
  methods: {
    schoolFlashStyle(school) {
      return 'border-left: 10px solid ' + school.colour;
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
