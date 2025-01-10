<template>
  <div class="bg-grey-lighten-2">
    <v-row>
      <v-col>
    <v-card class="mx-2 px-2 my-3 py-2">
      <v-layout class="input-area" id="home-address-input">
<!--          <GMapAutocomplete-->
<!--              placeholder="Enter your home address"-->
<!--              :bounds="autoCompleteBounds"-->
<!--              :options="autoCompleteOptions"-->
<!--              @place_changed='setPlace'-->
<!--          />-->
      </v-layout>
    </v-card>
      </v-col>
    </v-row>

    <school-card :school="school" :year="year"
                 :key="'m-' + index"
                 v-for="(school, index) in schools"
                 @school-visibility="school.visible = !school.visible"
    />
    <v-card>
      <v-card-text class="font-weight-light font-italic text-center">
        Use at your own risk - all data approximate - issues contact matt@roxburghm.com<br/>

        <v-chip variant="outlined" color="grey" size="x-small" density="comfortable">Build: {{ buildDateTime }}</v-chip>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import SchoolCard from "./SchoolCard.vue";
import VueGoogleAutocomplete from "vue-google-autocomplete";

export default {
  name: "SchoolList",
  data() {
    return {
      schools: [],
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(newValue) {
        this.schools = newValue;
      }
    }
  },
  components: {SchoolCard, VueGoogleAutocomplete},
  props: {
    value: {type: Array, required: true},
    year: {type: String, required: true}
  },
  methods: {
  },
  computed: {
    buildDateTime() {
      return import.meta.env.VITE_BUILD_DATE_TIME;
    }
  }
}
</script>

<style scoped>

</style>
