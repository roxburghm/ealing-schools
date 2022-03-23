<template>
    <v-app class="fill-height">
        <v-navigation-drawer width="340"
                             v-model="drawer"
                             app :temporary="false"
        >
            <school-list :year="year" v-model="schools" @home="newVal => home = newVal"/>
        </v-navigation-drawer>

        <v-app-bar app color="secondary" dark>
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            <div class="font-weight-thin display-1 hidden-sm-and-down">Ealing School Intake Areas</div>
            <div class="font-weight-thin title hidden-md-and-up">Ealing Intake</div>
            <v-spacer/>
            <v-layout class="hidden-sm-and-down shrink">
                <v-btn class="mr-2" v-for="showYear in years" :key="showYear"
                       @click="year = showYear"
                       :color="showYear === year ? 'primary' : 'grey'">{{ showYear }}
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
                    <p>All intake information is based on data in the
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

                    <p>The distance used to show the "intake areas" is from the "School Statistics" table on page 6/7 of
                        the above in the column <em>"The distance and criterion of the last person to be offered on 1
                            March 2022"</em></p>

                    <p>Where all applicants were offered a space an arbitary 3 miles intake zone is shown.</p>

                    <p>Enter your address in the box in the top left to see your home on the map, click schools in the
                        left panel to enable or disable their zones.</p>

                    <p><em>Privacy: NO DATA IS COLLECTED WHEN USING THIS APPLICATION. IT ALL STAYS LOCALLY ON YOUR
                        MACHINE.</em></p>

                    <p class="font-weight-light font-italic text-center">
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
                <v-card-text class="subtitle-1 pt-4">
                    <v-row dense>
                        <v-col cols="4" class="text-right">
                            Rating
                        </v-col>
                        <v-col cols="8">
                            {{ currentSchool.rating.toUpperCase() }}
                            <a target="_blank" class="ml-4 text-decoration-none" :href="currentSchool.perf"><v-btn elevation="0" color="primary" x-small>Compare</v-btn></a>
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
                    </v-row>
                    <v-row dense>
                        <v-col cols="4" class="text-right">
                            Intake Distance
                        </v-col>
                        <v-col cols="8">
                        </v-col>
                        <v-col cols="12">
                            <v-simple-table dense>
                                <thead>
                                <tr>
                                    <th class="text-right">Year</th>
                                    <th>Distance</th>
                                </tr>
                                </thead>
                                <tbody>
                            <tr dense v-for="(intakeDist, year) in currentSchool.intakeDist" :key="year">
                                <td class="text-right">
                                    {{ year }}
                                </td>
                                <td>
                                    {{ currentSchool.intakeDist[year] === 'null' ? 'All applicants accepted' : currentSchool.intakeDist[year].toFixed(3) + ' mi' }}<br/>
                                    {{ currentSchool.notes }}
                                </td>
                            </tr>
                                </tbody>
                            </v-simple-table>
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
import GoogleMap from './components/GoogleMap.vue'
import SchoolList from "./components/SchoolList";
import schools from '@/plugins/schools';

export default {
    name: 'App',
    components: {
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
            year: "2022",
            years: ['average', "2019", "2020", "2021", "2022"]
        }
    },
    methods: {
        showSchool(school) {
            this.currentSchool = school;
            this.showSchoolInfo = true;
        }
    }
}
</script>
