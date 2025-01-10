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

      <v-btn @click="showTable = true" icon>
        <v-icon large color="white">mdi-table</v-icon>
      </v-btn>
      <v-btn @click="showHelp = true" icon>
        <v-icon large color="white">mdi-help-circle</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <SchoolsMap :home="home" :schools="schools" @show-school-info="showSchool" :year="year"/>
    </v-main>

    <v-dialog v-model="showHelp" width="500">
      <Help/>
    </v-dialog>

    <v-dialog v-model="showTable" width="90%">
      <SchoolTable :years="years" :schools="schools"/>
    </v-dialog>

    <v-dialog v-model="showSchoolInfo" width="900">
      <div v-if="showSchoolInfo">
        <SchoolInfo :current-school="currentSchool" :home="home" :years="years"/>
      </div>
    </v-dialog>

  </v-app>
</template>

<script>
import DistanceUtils from "@/plugins/distanceUtils.js";

import SchoolsMap from './components/SchoolsMap.vue'
import SchoolList from "./components/SchoolList.vue";
import schools from '@/plugins/schools';
import utils from "@/plugins/utils";
import Help from "@/Help.vue";
import SchoolInfo from "@/SchoolInfo.vue";
import SchoolTable from "@/components/SchoolTable.vue";

export default {
  name: 'App',

  components: {
    SchoolTable,
    SchoolInfo,
    Help,
    SchoolList,
    SchoolsMap
  },
  data() {
    return {
      schools: schools,
      drawer: true,
      currentSchool: null,
      showSchoolInfo: false,
      showHelp: false,
      showTable: false,
      year: "2024",
      years: ['min', 'max', 'average', "2019", "2020", "2021", "2022", "2023", "2024"],
    }
  },
  methods: {
    showSchool(school) {
      this.currentSchool = school;
      this.showSchoolInfo = true;
    }
  },
  computed: {
    home: {
      get() {
        return this.$store.state.homeLocation
      },
      set(newValue) {
        this.$store.commit('homeLocation', newValue)
      }
    }
  }
}
</script>

<style>

.gold {
  background-color: gold !important;
}

</style>
