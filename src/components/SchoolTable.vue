<template>
  <v-card>
    <v-card-title class="bg-blue">School Intake Distances In Miles</v-card-title>
    <v-card-text>
      <v-table density="comfortable">
        <thead>
        <tr>
          <th>School</th>
          <th>Rating Trend</th>
          <th>Dist Trend</th>
          <th class="text-center" v-for="year in actualYears" :key="`th-${year}`">{{ year }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(school, sIdx) in schools" :key="`th-${sIdx}`">
          <td>{{ school.name }}</td>
          <td>
            <IntakeDistSparkline :school="school" :years="years"/>
          </td>
          <td>
            <RatingSparkline :school="school" :years="years"/>
          </td>
          <td class="text-center" v-for="(dist, dIdx) in getDistancesForYears(school)" :key="`td-${sIdx}-${dIdx}`">
            {{ formatDist(dist) }}
          </td>
        </tr>

        </tbody>
      </v-table>
    </v-card-text>
  </v-card>

</template>

<script>

import IntakeDistSparkline from "@/components/IntakeDistSparkline.vue";
import RatingSparkline from "@/components/RatingSparkline.vue";

export default {
  name: "SchoolTable",
  components: {IntakeDistSparkline, RatingSparkline},
  data() {
    return {}
  },
  props: {
    schools: {type: Array, required: true},
    years: {type: Array, required: true}
  },
  methods: {
    formatDist(dist) {
        if (dist === 0) return "-";
        if (dist === null) return "all";
        return dist.toFixed(3)
    },
    getDistancesForYearsForSpark(school) {
        return this.getDistancesForYears(school).map(val => val == null ? 5 : val)
    },
    getDistancesForYears(school) {
      let result = [];
      this.actualYears.forEach(year => {
        result.push(school.intakeDist[year] ?? null)
      })
      return result;
    }
  },
  computed: {
    actualYears() {
      return this.years.filter(year => !isNaN(parseInt(year)));
    }
  }
}
</script>

