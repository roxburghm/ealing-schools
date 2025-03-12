<template>
  <v-sparkline
      :labels="labels"
      :model-value="getRatingForYearsForSpark"
      color="blue"
      :line-width="width"
      smooth
      :min="allSame ? 0 : undefined"
      padding="16"
  ></v-sparkline>
</template>
<script>
export default {
  name: 'RatingSparkline',
  props: {
    school: {},
    years: {},
    width: { default: "4"},
    showLabels: { default: false }
  },
  computed: {
    labels() {
      return this.showLabels ? this.actualYears : []
    },
    getRatingForYearsForSpark() {
      return this.getDistancesForYears.map(val => val == null ? 5 : val)
    },
    getDistancesForYears() {
      let result = [];
      this.actualYears.forEach(year => {
        result.push(this.school.intakeDist[year] ?? null)
      })
      return result;
    },
    allSame() {
       if (this.getRatingForYearsForSpark.length === 0) {
          return true; // Empty array considered all the same
        }
        const firstNumber = this.getRatingForYearsForSpark[0];
        return this.getRatingForYearsForSpark.every(number => number === firstNumber);
    },
    actualYears() {
      return this.years.filter(year => !isNaN(parseInt(year)));
    }

  }
}
</script>