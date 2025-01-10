<template>
  <v-card>
    <v-card-title class="headline text-white font-weight-light "
                  :style="'background-color: ' + currentSchool.colour">{{ currentSchool.name }}
    </v-card-title>
    <v-card-text class="text-caption pt-4">
      <v-table density="compact">
        <tbody>
        <tr>
          <th class="text-right">
            Ofsted Rating
          </th>
          <td>
            <v-chip size="x-small" :color="ratingColour(currentSchool.rating)" class="white--text mr-4">
              {{ currentSchool.rating }}
            </v-chip>
            {{ currentSchool.ratingDate }}
            <a target="_blank" class="ml-4 text-decoration-none" :href="currentSchool.perf">
              <v-btn elevation="0" color="primary" size="x-small">Compare</v-btn>
            </a>
          </td>
        </tr>
        <tr>
          <th class="text-right">
            Website
          </th>
          <td>
            <a target="_blank" :href="currentSchool.website">{{ currentSchool.website }}</a>
          </td>
        </tr>
        <tr>
          <th class="text-right">
            Email
          </th>
          <td>
            <a target="_blank" :href="'mailto:' + currentSchool.email">{{ currentSchool.email }}</a>
          </td>
        </tr>
        <tr>
          <th class="text-right">
            Phone
          </th>
          <td>
            <a target="_blank" :href="'tel:' + currentSchool.phone">{{ currentSchool.phone }}</a>
          </td>
        </tr>
        <tr>
          <th class="text-right">
            Address
          </th>
          <td v-html="currentSchool.address">
          </td>
        </tr>
        <tr>
          <th class="text-right">
            Notes
          </th>
          <td v-html="currentSchool.notes">
          </td>
        </tr>
        <tr>

          <th class="text-right" v-if="currentSchool.progress8">Progress 8</th>
          <td v-if="currentSchool.progress8">{{ currentSchool.progress8 }}
            <v-chip size="x-small" class="ml-1" outlined :color="confidenceColor(currentSchool.progress8Confidence)">
              Confidence: {{ currentSchool.progress8Confidence }}
            </v-chip>
          </td>

        </tr>
        <tr>
          <th class="text-right" v-if="currentSchool.attainment8">Attainment 8</th>
          <td v-if="currentSchool.attainment8">{{ currentSchool.attainment8 }}</td>
        </tr>
        <tr>

          <th class="text-right" v-if="currentSchool.grade5Above">Grade 5 & above</th>
          <td v-if="currentSchool.grade5Above">{{ currentSchool.grade5Above }}%</td>
        </tr>
        <tr>
          <th class="">Intake Distances</th>
          <td>
          <v-table density="compact">
            <thead>
            <tr>
              <th class="text-right">Year</th>
              <th>Intake Distance</th>
              <th v-if="home && currentSchool.radius" class="text-center">In Catchment</th>
            </tr>
            </thead>
            <tbody>
            <tr :class="{ 'bg-grey-lighten-2': isNaN(parseInt(year))}" dense
                v-for="(intakeDist, year) in applicableIntakes(currentSchool.intakeDist)" :key="year">
              <td class="text-right text-caption">
                {{ year }}
              </td>
              <td class="text-caption">
                {{
                  currentSchool.intakeDist[year] === null ? 'All applicants accepted' : humanDistanceInMiles(currentSchool.intakeDist[year], 'en-GB', 'us')
                }}
              </td>
              <td class="text-center text-no-wrap" v-if="home && currentSchool.radius">
                <in-intake-icon :school="currentSchool" :year="year" :home="home"/>
              </td>
            </tr>
            </tbody>
          </v-table>
          </td>
        </tr>
        </tbody>
      </v-table>

      <v-row>
        <v-col cols="12" v-html="currentSchool.description">
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
import InIntakeIcon from "@/InIntakeIcon.vue"
import DistanceUtils from "@/plugins/distanceUtils";
import utils from "@/plugins/utils";

export default {
  name: 'SchoolInfo',
  components: {InIntakeIcon},
  props: {
    currentSchool: {},
    home: {},
    years: {}
  },
  methods: {
    applicableIntakes(intakes) {
      console.log(intakes)
      let result = {};
      Object.keys(intakes).forEach(key => {
        if (this.years.includes(key)) {
          result[key] = intakes[key]
        }
      })
      return result;
    },
  humanDistanceInMiles(dist, locale, unitSystem, forceSign) {
    return DistanceUtils.getHumanDistanceInMiles(dist, locale, unitSystem, forceSign);
  },
  ratingColour(rating) {
    return utils.getRatingColor(rating);
  },
  confidenceColor(confidence) {
    return utils.getConfidenceColor(confidence)
  }
  }
}
</script>

<style>
th {
  padding-right: 16px;
  opacity: 0.5;
}
</style>