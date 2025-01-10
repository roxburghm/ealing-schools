<template>
  <v-card>
    <v-card-title class="secondary headline white--text font-weight-light">
      Information
    </v-card-title>
    <v-card-text class="pt-4">
      <p class="mb-4">All intake information is based on data in the following documents:</p>

        <ul class="mb-4 ml-8 text-decoration-none">
          <li><a target="_blank" href="/Documents/Starting_High_School_2025.pdf">Starting High School 2025 (&apos;24 data)</a></li>
          <li><a target="_blank" href="/Documents/Starting_High_School_2024.pdf">Starting High School 2024 (&apos;23 data)</a></li>
          <li><a target="_blank" href="/Documents/Starting_High_School_2023.pdf">Starting High School 2024 (&apos;22 data)</a></li>
          <li><a target="_blank" href="/Documents/Starting_High_School_2022.pdf">Starting High School 2022 (&apos;21 data)</a></li>
          <li><a target="_blank" href="/Documents/Starting_High_School_2021.pdf">Starting High School 2021  (&apos;20 data)</a></li>
          <li><a target="_blank" href="/Documents/Starting_High_School_2020.pdf">Starting High School 2020  (&apos;19 data)</a></li>
      </ul>

      <p class="mb-4">The distance used to show the "intake areas" is taken from values such as <em>"The distance and criterion of the last person to be offered on 1
          March 2022"</em></p>

      <p class="mb-4">Where the entry criteria is more complex a dashed line is shown for the intake zone is shown and
        the icon has a "notes" indicator.</p>

      <p class="mb-4">Enter your address in the box in the top left to see your home on the map, click schools in
        the
        left panel to enable or disable schools.</p>

      <p class="text-caption mb-4"><em>Privacy: No data is intentionally collected when using this application. It all stays
        locally on your machine except when using the google map address lookup.</em></p>

      <p class="font-weight-light font-italic text-caption text-center bg-grey">
        Use at your own risk - all data approximate - any issues contact matt@roxburghm.com quoting "ealing schools intake website"
      </p>
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  name: 'Help'
}
</script>