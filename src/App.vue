<template>
  <v-app class="fill-height">
    <v-navigation-drawer width="340"
                         v-model="drawer"
                         app :temporary="false"
    >
      <school-list :year="year" :value="schools" @home="newVal => home = newVal"/>
    </v-navigation-drawer>

    <v-app-bar app color="blue" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <div class="font-weight-thin display-1 hidden-sm-and-down">Ealing School Intake Areas</div>
      <div class="font-weight-thin title hidden-md-and-up">Ealing Intake</div>
      <v-spacer/>
      <v-layout class="hidden-sm-and-down shrink">
        <v-btn :class="showYear === 'average' ? 'mr-12' : 'mr-2'" v-for="showYear in years" :key="showYear"
               @click="year = showYear"
               :color="showYear === year ? 'white' : 'blue-grey'">{{ showYear }}
        </v-btn>
      </v-layout>
      <v-layout class="hidden-md-and-up shrink">
        <v-select class="shrink" style="max-width: 100px;" v-model="year" :items="years" hide-details/>
      </v-layout>

      <v-btn @click="showHelp = true" icon>
        <v-icon large color="white">mdi-help-circle</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>

      <GoogleMap :home="home" :schools="schools" @show-school-info="showSchool" :year="year"/>

    </v-main>

    <v-dialog v-model="showHelp" width="500">
      <v-card>
        <v-card-title class="secondary headline white--text font-weight-light">
          Information
        </v-card-title>
        <v-card-text class="pt-4">
          <p class="mb-4">All intake information is based on data in the
            <a target="_blank"
               href="https://www.ealing.gov.uk/download/downloads/id/13820/high_school_prospectus_202324.pdf">High
              School Prospectus 2023/24</a>,
            <a target="_blank"
               href="https://viewer.joomag.com/high-school-prospectus-2022/0579981001629885520">Starting
              High School 2022</a>,
            <a target="_blank"
               href="https://www.ealing.gov.uk/download/downloads/id/13820/high_school_prospectus_202122.pdf">Starting
              High School 2021</a> and
            <a target="_blank"
               href="https://view.joomag.com/high-school-prospectus-ec8682-high-school-prospectus-2020-final/0315251001567583240?short">Starting
              High School 2020</a>
          </p>

          <p class="mb-4">The distance used to show the "intake areas" is from the "School Statistics" table on page 6/7
            of
            the above in the column <em>"The distance and criterion of the last person to be offered on 1
              March 2022"</em></p>

          <p class="mb-4">Where all applicants were offered a space an arbitary 3 miles intake zone is shown.</p>

          <p class="mb-4">Where the entry criteria is more complex only a line is shown for the intake zone is shown and
            the icon has a "notes" indicator.</p>

          <p class="mb-4">Enter your address in the box in the top left to see your home on the map, click schools in
            the
            left panel to enable or disable their zones.</p>

          <p class="text-caption mb-4"><em>Privacy: NO DATA IS COLLECTED WHEN USING THIS APPLICATION. IT ALL STAYS
            LOCALLY ON YOUR
            MACHINE.</em></p>

          <p class="font-weight-light font-italic text-caption text-center bg-grey">
            Use at your own risk - all data approximate - any issues contact me matt@roxburghm.com
          </p>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showSchoolInfo" width="600">
      <v-card v-if="showSchoolInfo">
        <v-card-title class="headline white--text font-weight-light"
                      :style="'background-color: ' + currentSchool.colour">{{ currentSchool.name }}
        </v-card-title>
        <v-card-text class="text-caption pt-4">
          <v-row dense>
            <v-col cols="4" class="text-right">
              Ofsted Rating
            </v-col>
            <v-col cols="8">
              <v-chip size="x-small" :color="ratingColour(currentSchool.rating)" class="white--text mr-4">
                {{ currentSchool.rating }}
              </v-chip>
              {{ currentSchool.ratingDate }}
              <a target="_blank" class="ml-4 text-decoration-none" :href="currentSchool.perf">
                <v-btn elevation="0" color="primary" size="x-small">Compare</v-btn>
              </a>
            </v-col>
            <v-col cols="4" class="text-right">
              Website
            </v-col>
            <v-col cols="8">
              <a target="_blank" :href="currentSchool.website">{{ currentSchool.website }}</a>
            </v-col>
            <v-col cols="4" class="text-right">
              Email
            </v-col>
            <v-col cols="8">
              <a target="_blank" :href="'mailto:' + currentSchool.email">{{ currentSchool.email }}</a>
            </v-col>
            <v-col cols="4" class="text-right">
              Phone
            </v-col>
            <v-col cols="8">
              <a target="_blank" :href="'tel:' + currentSchool.phone">{{ currentSchool.phone }}</a>
            </v-col>
            <v-col cols="4" class="text-right">
              Address
            </v-col>
            <v-col cols="8" v-html="currentSchool.address">
            </v-col>
            <v-col cols="4" class="text-right">
              Notes
            </v-col>
            <v-col cols="8" v-html="currentSchool.notes">
            </v-col>

            <v-col cols="4" class="text-right" v-if="currentSchool.progress8">Progress 8</v-col>
            <v-col cols="8" v-if="currentSchool.progress8">{{ currentSchool.progress8 }}
              <v-chip size="x-small" class="ml-1" outlined :color="confidenceColor(currentSchool.progress8Confidence)">
                Confidence: {{ currentSchool.progress8Confidence }}
              </v-chip>
            </v-col>

            <v-col cols="4" class="text-right" v-if="currentSchool.attainment8">Attainment 8</v-col>
            <v-col cols="8" v-if="currentSchool.attainment8">{{ currentSchool.attainment8 }}</v-col>

            <v-col cols="4" class="text-right" v-if="currentSchool.grade5Above">Grade 5 & above</v-col>
            <v-col cols="8" v-if="currentSchool.grade5Above">{{ currentSchool.grade5Above }}%</v-col>

          </v-row>
          <v-row dense>
            <v-col cols="4" class="text-right">
              Intake Distance
            </v-col>
            <v-col cols="8">
            </v-col>
            <v-col cols="12">
              <v-table density="compact">
                <thead>
                <tr>
                  <th class="text-right">Year</th>
                  <th>Distance</th>
                  <th v-if="home && currentSchool.radius" class="text-center">In Catchment</th>
                </tr>
                </thead>
                <tbody>
                <tr :class="{ 'grey lighten-2': isNaN(parseInt(year))}" dense
                    v-for="(intakeDist, year) in currentSchool.intakeDist" :key="year">
                  <td class="text-right">
                    {{ year }}
                  </td>
                  <td>
                    {{
                      currentSchool.intakeDist[year] === null ? 'All applicants accepted' : humanDistanceInMiles(currentSchool.intakeDist[year], 'en-GB', 'us', false)
                    }}
                  </td>
                  <td class="text-center" v-if="home && currentSchool.radius">
                    <in-intake-icon :school="currentSchool" :year="year" :home="home"/>
                  </td>
                </tr>
                </tbody>
              </v-table>
            </v-col>
            <v-col cols="12" v-html="currentSchool.description">
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

  </v-app>
</template>

<script>
import DistanceUtils from "@/plugins/distanceUtils.js";

import GoogleMap from './components/GoogleMap.vue'
import SchoolList from "./components/SchoolList.vue";
import schools from '@/plugins/schools';
import InIntakeIcon from "@/InIntakeIcon.vue";
import utils from "@/plugins/utils";

export default {
  name: 'App',

  components: {
    InIntakeIcon,
    SchoolList,
    GoogleMap
  },
  data() {
    return {
      schools: schools,
      drawer: true,
      home: null,
      currentSchool: null,
      showSchoolInfo: false,
      showHelp: false,
      year: "2024",
      years: ['min', 'max', 'average', "2019", "2020", "2021", "2022", "2024"]
    }
  },
  methods: {
    humanDistanceInMiles(dist, locale, unitSystem, forceSign) {
      return DistanceUtils.getHumanDistanceInMiles(dist, locale, unitSystem, forceSign);
    },
    ratingColour(rating) {
      return utils.getRatingColor(rating);
    },
    confidenceColor(confidence) {
      return utils.getConfidenceColor(confidence)
    },
    showSchool(school) {
      this.currentSchool = school;
      this.showSchoolInfo = true;
    }
  }
}
</script>

<style>

.gold {
  background-color: gold !important;
}

</style>
