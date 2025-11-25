<template>
  <v-card class="rounded-xl overflow-hidden">
    <!-- Header -->
    <v-toolbar color="primary" density="comfortable">
      <v-toolbar-title class="text-h6 font-weight-bold pl-4">
        <v-icon start icon="mdi-help-circle-outline" class="mr-2"></v-icon>
        About & Help
      </v-toolbar-title>
      <v-btn icon="mdi-close" variant="text" @click="$parent.isActive.value = false"></v-btn>
    </v-toolbar>

    <v-card-text class="pa-0">
      <v-container class="pa-6">
        
        <!-- Data Sources Section -->
        <div class="mb-8">
          <h3 class="text-h6 font-weight-bold mb-3 text-primary">Data Sources</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            All intake information is based on official data from the following documents:
          </p>
          <v-card variant="outlined" class="rounded-lg border-opacity-50">
            <v-list density="compact" lines="one" class="bg-transparent py-0">
              <v-list-item href="/Documents/High_school_on_time_offers_2025.pdf" target="_blank" prepend-icon="mdi-file-pdf-box" color="primary">
                <v-list-item-title class="text-body-2 font-weight-medium">High school on time offers 2025 ('24 data)</v-list-item-title>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item href="/Documents/Starting_High_School_2025.pdf" target="_blank" prepend-icon="mdi-file-pdf-box" color="primary">
                <v-list-item-title class="text-body-2 font-weight-medium">Starting High School 2025 ('24 data)</v-list-item-title>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item href="/Documents/Starting_High_School_2024.pdf" target="_blank" prepend-icon="mdi-file-pdf-box" color="primary">
                <v-list-item-title class="text-body-2 font-weight-medium">Starting High School 2024 ('23 data)</v-list-item-title>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item href="/Documents/Starting_High_School_2023.pdf" target="_blank" prepend-icon="mdi-file-pdf-box" color="primary">
                <v-list-item-title class="text-body-2 font-weight-medium">Starting High School 2023 ('22 data)</v-list-item-title>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item href="/Documents/Starting_High_School_2022.pdf" target="_blank" prepend-icon="mdi-file-pdf-box" color="primary">
                <v-list-item-title class="text-body-2 font-weight-medium">Starting High School 2022 ('21 data)</v-list-item-title>
              </v-list-item>
               <v-divider></v-divider>
              <v-list-item href="/Documents/Starting_High_School_2021.pdf" target="_blank" prepend-icon="mdi-file-pdf-box" color="primary">
                <v-list-item-title class="text-body-2 font-weight-medium">Starting High School 2021 ('20 data)</v-list-item-title>
              </v-list-item>
               <v-divider></v-divider>
              <v-list-item href="/Documents/Starting_High_School_2020.pdf" target="_blank" prepend-icon="mdi-file-pdf-box" color="primary">
                <v-list-item-title class="text-body-2 font-weight-medium">Starting High School 2020 ('19 data)</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </div>

        <!-- Understanding the Map -->
        <div class="mb-8">
          <h3 class="text-h6 font-weight-bold mb-3 text-primary">Understanding the Map</h3>
          <v-alert color="info" variant="tonal" class="mb-4 text-body-2" border="start" density="comfortable">
            <div class="font-weight-bold mb-1">Intake Areas</div>
            The colored circles represent the distance of the last person offered a place on March 1st of that year.
          </v-alert>
          
          <div class="d-flex align-start mb-3">
             <v-icon color="success" class="mr-3 mt-1">mdi-check-circle-outline</v-icon>
             <div class="text-body-2 text-medium-emphasis">
               <strong>"All Accepted"</strong>: If all applicants were successful, no circle is shown. Instead, a <span class="text-success font-weight-bold">green dotted line</span> connects the school to your home address.
             </div>
          </div>

          <div class="d-flex align-start">
             <v-icon color="warning" class="mr-3 mt-1">mdi-alert-circle-outline</v-icon>
             <div class="text-body-2 text-medium-emphasis">
               <strong>Complex Criteria</strong>: Where entry criteria are more complex (e.g., faith schools), the icon may show "(See notes)" to indicate you should check the specific admissions policy.
             </div>
          </div>
        </div>

        <!-- How to Use -->
        <div>
          <h3 class="text-h6 font-weight-bold mb-3 text-primary">How to Use</h3>
          <v-row dense>
            <v-col cols="12" sm="4">
              <v-card variant="flat" color="grey-lighten-4" class="pa-3 h-100">
                <div class="d-flex flex-column align-center text-center">
                  <v-icon color="primary" class="mb-2">mdi-map-search</v-icon>
                  <div class="text-subtitle-2 font-weight-bold">Search</div>
                  <div class="text-caption text-medium-emphasis mt-1">Enter your address in the top-left box to see your location relative to schools.</div>
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" sm="4">
              <v-card variant="flat" color="grey-lighten-4" class="pa-3 h-100">
                <div class="d-flex flex-column align-center text-center">
                  <v-icon color="primary" class="mb-2">mdi-filter-variant</v-icon>
                  <div class="text-subtitle-2 font-weight-bold">Filter</div>
                  <div class="text-caption text-medium-emphasis mt-1">Click schools in the list to toggle their visibility on the map.</div>
                </div>
              </v-card>
            </v-col>
             <v-col cols="12" sm="4">
              <v-card variant="flat" color="grey-lighten-4" class="pa-3 h-100">
                <div class="d-flex flex-column align-center text-center">
                  <v-icon color="primary" class="mb-2">mdi-table</v-icon>
                  <div class="text-subtitle-2 font-weight-bold">Compare</div>
                  <div class="text-caption text-medium-emphasis mt-1">Use the table icon in the top right to see data for all schools at once.</div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>

      </v-container>
    </v-card-text>

    <v-divider></v-divider>

    <!-- Footer -->
    <v-card-actions class="bg-grey-lighten-5 pa-4 d-block">
      <div class="text-caption text-medium-emphasis text-center mb-2">
        <strong>Privacy:</strong> No data is intentionally collected. All processing happens locally on your device (except for Google Maps address lookup).
      </div>
      <div class="text-caption text-disabled font-italic text-center">
        Use at your own risk - all data approximate. Contact matt@roxburghm.com for issues.
      </div>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'Help'
}
</script>