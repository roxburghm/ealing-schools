<template>
  <v-row>
    <v-col>
      <v-icon :color="color">{{ icon }}</v-icon>

    </v-col>
    <v-col class="text-right">
      {{ humanDistanceInMiles(relativeDist, 'en-GB', 'us', true) }}
    </v-col>
  </v-row>
</template>
<script>
import DistanceUtils from "@/plugins/distanceUtils.js";

export default {
  name: 'in-intake-icon',
  props: {
    home: {type: Object, required: true},
    year: {type: String, required: true},
    school: {type: Object}
  },
  methods: {
    humanDistanceInMiles(dist, locale, unitSystem, forceSign) {
      return DistanceUtils.getHumanDistanceInMiles(dist, locale, unitSystem, forceSign);
    }
  },
  computed: {
    relativeDist() {
      let dist = this.school.intakeDist[this.year] - this.distanceFromSchool;
      return (dist < 0 ? '-' : '+') + Math.abs(dist);
    },
    distanceFromSchool() {
      return DistanceUtils.getDistanceInMiles(this.school.centre, this.home);
    },
    inIntake() {
      return this.distanceFromSchool <= this.school.intakeDist[this.year];
    },
    icon() {
      return this.inIntake ? 'mdi-check' : 'mdi-close'
    },
    color() {
      return this.inIntake ? 'success' : 'error'
    }
  },


}
</script>