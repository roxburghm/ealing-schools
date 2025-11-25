<template>
  <v-card class="rounded-xl overflow-hidden elevation-2 border-0 bg-surface">
    <!-- Modern Gradient Header -->
    <div class="position-relative">
      <div :style="`background: linear-gradient(135deg, ${currentSchool.colour} 0%, ${adjustColor(currentSchool.colour, -40)} 100%); height: 140px;`"
           class="d-flex align-end pa-6"
      >
        <div class="w-100">
          <v-chip size="small" color="white" variant="flat" class="mb-2 font-weight-bold text-uppercase tracking-wide" style="color: black !important">
            {{ currentSchool.type || 'Secondary School' }}
          </v-chip>
          <h2 class="text-h4 font-weight-bold text-white mb-0 text-wrap" style="line-height: 1.1; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">
            {{ currentSchool.name }}
          </h2>
        </div>
      </div>
      
      <!-- Quick Actions Floating Button (Optional, maybe for 'Close' or 'Share') -->
      <!-- <v-btn icon="mdi-close" variant="tonal" color="white" class="position-absolute top-0 right-0 ma-4"></v-btn> -->
    </div>

    <v-card-text class="pa-0">
      <!-- Key Metrics Strip -->
      <div class="d-flex flex-wrap border-b bg-grey-lighten-5">
        <!-- Ofsted -->
        <div class="flex-grow-1 pa-4 border-e d-flex flex-column justify-center align-center text-center" style="min-width: 120px;">
          <div class="text-caption text-uppercase font-weight-bold text-medium-emphasis mb-1">Ofsted</div>
          <v-chip :color="ratingColour(currentSchool.rating)" variant="flat" class="font-weight-bold px-3" label>
            {{ currentSchool.rating }}
          </v-chip>
          <div class="text-caption text-medium-emphasis mt-1">{{ currentSchool.ratingDate }}</div>
        </div>

        <!-- Progress 8 -->
        <div class="flex-grow-1 pa-4 border-e d-flex flex-column justify-center align-center text-center" style="min-width: 120px;" v-if="currentSchool.progress8">
          <div class="text-caption text-uppercase font-weight-bold text-medium-emphasis mb-1">Progress 8</div>
          <div class="text-h5 font-weight-bold" :class="getP8ColorClass(currentSchool.progress8)">
            {{ currentSchool.progress8 }}
          </div>
          <v-chip size="x-small" :color="confidenceColor(currentSchool.progress8Confidence)" variant="tonal" class="mt-1">
            {{ currentSchool.progress8Confidence }}
          </v-chip>
        </div>

        <!-- Grade 5+ -->
        <div class="flex-grow-1 pa-4 border-e d-flex flex-column justify-center align-center text-center" style="min-width: 120px;" v-if="currentSchool.grade5Above">
          <div class="text-caption text-uppercase font-weight-bold text-medium-emphasis mb-1">Grade 5+</div>
          <div class="text-h5 font-weight-bold text-high-emphasis">
            {{ currentSchool.grade5Above }}%
          </div>
          <div class="text-caption text-medium-emphasis mt-1">Passing</div>
        </div>

        <!-- Current Distance -->
        <div class="flex-grow-1 pa-4 d-flex flex-column justify-center align-center text-center" style="min-width: 120px;" v-if="currentSchool.intakeDist[year] !== undefined">
           <div class="text-caption text-uppercase font-weight-bold text-medium-emphasis mb-1">{{ year }} Distance</div>
           <div class="text-h5 font-weight-bold text-primary">
             {{ currentSchool.intakeDist[year] === null ? 'All' : humanDistanceInMiles(currentSchool.intakeDist[year], 'en-GB', 'us') }}
           </div>
           <div class="text-caption text-medium-emphasis mt-1" v-if="currentSchool.intakeDist[year] === null">Applicants Accepted</div>
           <div class="text-caption text-medium-emphasis mt-1" v-else>Straight Line</div>
        </div>
      </div>

      <v-row no-gutters>
        <!-- Main Content -->
        <v-col cols="12" md="8" class="pa-6">
          
          <!-- About Section -->
          <div class="mb-8">
            <h3 class="text-h6 font-weight-bold mb-3 d-flex align-center">
              <v-icon color="primary" class="mr-2">mdi-information-outline</v-icon>
              About
            </h3>
            <p class="text-body-1 text-medium-emphasis" style="line-height: 1.6;" v-if="currentSchool.description">{{ currentSchool.description }}</p>
            <p class="text-body-1 text-medium-emphasis font-italic" v-else>No description available.</p>
            
            <v-alert v-if="currentSchool.notes" type="info" variant="tonal" class="mt-4 text-body-2" density="comfortable" border="start" border-color="info">
               <div v-html="currentSchool.notes"></div>
            </v-alert>
          </div>

          <!-- Trends Section -->
          <div class="mb-8">
             <h3 class="text-h6 font-weight-bold mb-3 d-flex align-center">
              <v-icon color="primary" class="mr-2">mdi-chart-timeline-variant</v-icon>
              Intake Trends
            </h3>
            <v-card variant="outlined" class="pa-4 rounded-lg border-opacity-50">
               <intake-dist-sparkline :school="currentSchool" :years="years" :width="2" :show-labels="true"/>
            </v-card>
          </div>

          <!-- History Table -->
          <div>
            <h3 class="text-h6 font-weight-bold mb-3 d-flex align-center">
              <v-icon color="primary" class="mr-2">mdi-history</v-icon>
              History
            </h3>
            <v-table density="comfortable" class="rounded-lg border">
              <thead>
                <tr class="bg-grey-lighten-4">
                  <th class="text-left font-weight-bold">Year</th>
                  <th class="text-left font-weight-bold">Cut-off Distance</th>
                  <th v-if="home && currentSchool.radius" class="text-center font-weight-bold">Your Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(intakeDist, year) in applicableIntakes(currentSchool.intakeDist)" :key="year">
                  <td class="font-weight-medium text-body-2">{{ year }}</td>
                  <td class="text-body-2">
                    {{ currentSchool.intakeDist[year] === null ? 'All applicants accepted' : humanDistanceInMiles(currentSchool.intakeDist[year], 'en-GB', 'us') }}
                  </td>
                  <td class="text-center" v-if="home && currentSchool.radius">
                    <in-intake-icon :school="currentSchool" :year="year" :home="home"/>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>

        </v-col>

        <!-- Sidebar -->
        <v-col cols="12" md="4" class="bg-grey-lighten-5 border-s pa-6">
           <div class="text-subtitle-2 font-weight-bold text-uppercase text-medium-emphasis mb-4">Contact & Info</div>
           
           <v-card flat class="bg-white rounded-lg pa-4 mb-4 border">
              <div class="d-flex align-start mb-3">
                <v-icon color="primary" class="mr-3 mt-1">mdi-map-marker</v-icon>
                <div class="text-body-2" v-html="currentSchool.address"></div>
              </div>
              
              <v-divider class="my-3"></v-divider>

              <div class="d-flex flex-column gap-2">
                <v-btn v-if="currentSchool.website" :href="currentSchool.website" target="_blank" variant="text" density="compact" color="primary" prepend-icon="mdi-web" class="justify-start px-0">
                  Visit Website
                </v-btn>
                <v-btn v-if="currentSchool.email" :href="'mailto:' + currentSchool.email" variant="text" density="compact" color="primary" prepend-icon="mdi-email" class="justify-start px-0">
                  Email School
                </v-btn>
                <v-btn v-if="currentSchool.phone" :href="'tel:' + currentSchool.phone" variant="text" density="compact" color="primary" prepend-icon="mdi-phone" class="justify-start px-0">
                  {{ currentSchool.phone }}
                </v-btn>
              </div>
           </v-card>

           <div v-if="currentSchool.intakeCriteria">
              <div class="text-subtitle-2 font-weight-bold text-uppercase text-medium-emphasis mb-2">Admissions</div>
              <v-btn :href="currentSchool.intakeCriteria" target="_blank" block variant="flat" color="primary" prepend-icon="mdi-file-document-outline">
                View Criteria
              </v-btn>
           </div>
           
           <div class="mt-6" v-if="currentSchool.perf">
              <div class="text-subtitle-2 font-weight-bold text-uppercase text-medium-emphasis mb-2">Performance</div>
              <v-btn :href="currentSchool.perf" target="_blank" block variant="outlined" color="primary" prepend-icon="mdi-chart-box-outline">
                Gov.uk Data
              </v-btn>
           </div>

        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
import InIntakeIcon from "@/InIntakeIcon.vue"
import DistanceUtils from "@/plugins/distanceUtils";
import utils from "@/plugins/utils";
import IntakeDistSparkline from "@/components/IntakeDistSparkline.vue";

export default {
  name: 'SchoolInfo',
  components: {IntakeDistSparkline, InIntakeIcon},
  props: {
    currentSchool: {},
    home: {},
    years: {}
  },
  methods: {
    adjustColor(color, amount) {
        return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    },
    getP8ColorClass(score) {
        const num = parseFloat(score);
        if (num > 0.5) return 'text-green-darken-2';
        if (num > 0) return 'text-green';
        if (num > -0.5) return 'text-orange';
        return 'text-red';
    },
    getBaseName(uri) {
      if (uri.indexOf(".pdf") >= 0) {
        const lastSlashIndex = uri.lastIndexOf('/');
        if (lastSlashIndex !== -1) {
          return uri.substring(lastSlashIndex + 1);
        } else {
          return uri; // If no slash is found, return the original URI
        }
      }

      return uri;
    },
    applicableIntakes(intakes) {
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

<style scoped>
.tracking-wide {
  letter-spacing: 0.05em;
}
.gap-2 {
  gap: 8px;
}
</style>
