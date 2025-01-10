<template>
  <v-sparkline
      :labels="labels"
      :model-value="getDistancesForYearsForSpark"
      color="blue"
      :line-width="width"
      smooth
      min="0"
      padding="16"
  ></v-sparkline>
</template>
<script>
export default {
  name: 'IntakeDistSparkline',
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
    getDistancesForYearsForSpark() {
      return this.getDistancesForYears.map(val => val == null ? 5 : val)
    },
    getDistancesForYears() {
      let result = [];
      this.actualYears.forEach(year => {
        result.push(this.school.intakeDist[year] ?? null)
      })
      return result;
    },
    actualYears() {
      return this.years.filter(year => !isNaN(parseInt(year)));
    }

  }
}
</script>