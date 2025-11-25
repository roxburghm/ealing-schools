<template>
  <div class="fill-height bg-surface">
    <v-row no-gutters>
      <v-col>
    <v-card class="mx-3 mt-3 mb-2" variant="outlined" color="grey-lighten-2">
      <v-layout class="input-area pa-2" id="home-address-input">
      </v-layout>
    </v-card>
      </v-col>
    </v-row>

    <v-list class="bg-transparent pa-2" density="compact">
      <school-card :school="school" :year="year"
                   :key="'m-' + index"
                   v-for="(school, index) in schools"
                   @school-visibility="school.visible = !school.visible"
                   @mouseover="$emit('hover-school', school)"
                   @mouseleave="$emit('hover-school', null)"
                   compact
      />
    </v-list>
    <v-card flat class="bg-transparent mt-2 mb-16">
      <v-card-text class="font-weight-light text-caption text-center text-medium-emphasis">
        Use at your own risk - all data approximate<br/>
        Issues: <a href="mailto:matt@roxburghm.com" class="text-decoration-none text-primary">matt@roxburghm.com</a><br/>

        <v-chip variant="text" color="grey" size="x-small" density="comfortable" class="mt-2">Build: {{ buildDateTime }}</v-chip>
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
