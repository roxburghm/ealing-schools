<template>
  <div class="text-no-wrap text-caption text-right">
      <span style="width: 70px; max-width: 70px;" class="mr-4 d-inline-block">
      {{ humanDistanceInMiles(relativeDist, 'en-GB', 'us', true) }}
        </span>
      <v-icon size="small" :color="color">{{ icon }}</v-icon>
  </div>
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
      if (dist === null) return '';
      return DistanceUtils.getHumanDistanceInMiles(dist, locale, unitSystem, forceSign);
    }
  },
  computed: {
    relativeDist() {
      if (this.school.intakeDist[this.year] === null) return null;
      let dist = this.school.intakeDist[this.year] - this.distanceFromSchool;
      return (dist < 0 ? '-' : '+') + Math.abs(dist);
    },
    distanceFromSchool() {
      return DistanceUtils.getDistanceInMiles(this.school.centre, this.home);
    },
    inIntake() {
      if (this.school.intakeDist[this.year] === null) return true;
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