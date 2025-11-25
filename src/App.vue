<template>
  <v-app class="fill-height bg-background">
    <v-navigation-drawer width="360"
                         v-model="drawer"
                         app
                         elevation="2"
                         class="border-none"
    >
      <school-list :year="year" :value="schools" @home="newVal => home = newVal" @hover-school="hoveredSchool = $event"/>
    </v-navigation-drawer>

    <v-app-bar app color="surface" elevation="1" density="comfortable">
      <v-app-bar-nav-icon @click="drawer = !drawer" color="primary"></v-app-bar-nav-icon>
      <div class="text-h6 font-weight-bold text-primary ml-2 d-none d-md-flex">Ealing School Intake</div>
      <div class="text-subtitle-1 font-weight-bold text-primary ml-2 d-md-none">Ealing Intake</div>
      <v-spacer/>
      
      <div class="d-none d-md-flex align-center">
        <span class="text-caption text-medium-emphasis mr-2">Year:</span>
        <v-btn-toggle v-model="year" mandatory density="compact" color="primary" variant="outlined" divided class="mr-4">
            <v-btn v-for="showYear in years" :key="showYear" :value="showYear" size="small">
                {{ showYear }}
            </v-btn>
        </v-btn-toggle>
      </div>

      <v-layout class="d-md-none shrink align-center">
        <v-select density="compact" variant="outlined" color="primary" class="shrink mr-2" style="min-width: 130px;" v-model="year" :items="years" hide-details label="Year"/>
      </v-layout>

      <v-btn @click="showTable = true" icon color="primary" variant="text">
        <v-icon>mdi-table</v-icon>
      </v-btn>
      <v-btn @click="showHelp = true" icon color="primary" variant="text">
        <v-icon>mdi-help-circle-outline</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <SchoolsMap :home="home" :schools="schools" @show-school-info="showSchool" :year="year" :hovered-school="hoveredSchool" @hover-school="hoveredSchool = $event"/>
    </v-main>

    <v-dialog v-model="showHelp" width="800" scrollable>
      <Help/>
    </v-dialog>

    <v-dialog v-model="showTable" width="90%" scrollable>
      <SchoolTable :years="years" :schools="schools"/>
    </v-dialog>

    <v-dialog v-model="showSchoolInfo" max-height="90vh" width="900" max-width="90vw" scrollable>
        <SchoolInfo v-if="showSchoolInfo" :current-school="currentSchool" :home="home" :years="years"/>
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
      year: "2025",
      years: ['min', 'max', 'average', "2019", "2020", "2021", "2022", "2023", "2024","2025"],
      hoveredSchool: null,
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
:root {
  font-family: 'Inter', sans-serif;
}

.v-application {
  font-family: 'Inter', sans-serif !important;
}

.gold {
  background-color: gold !important;
}

</style>
