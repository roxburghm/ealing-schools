<template>
    <div>
    <v-card class="mx-2 px-2 my-3 py-2">
        <v-layout>
        <v-flex class="input-area">
            <GmapAutocomplete
                placeholder="Enter your home address"
                @place_changed='setPlace'
            />
        </v-flex>
        </v-layout>
    </v-card>
    <school-card :school="school" :year="year"
                 :key="'m-' + index"
                 v-for="(school, index) in schools"
                 @school-visibility="school.visible = !school.visible"
    />
    <v-card>
        <v-card-text class="font-weight-light font-italic text-center">
            Use at your own risk - all data approximate - issues contact matt@roxburghm.com
        </v-card-text>
    </v-card>
    </div>
</template>

<script>
import SchoolCard from "./SchoolCard";

export default {
    name: "SchoolList",
    mounted() {
        this.$emit('home', this.home);
    },
    data() {
        return {
            schools: [],
            home: JSON.parse(localStorage.getItem('home')),
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
    components: {SchoolCard},
    props: {
        value: {type: Array, required: true},
        year: {type: String, required: true}
    },
    methods: {
        setPlace(place) {
            this.home = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
            };
            localStorage.setItem('home', JSON.stringify(this.home))
            this.$emit('home', this.home);
        },
    }
}
</script>

<style scoped>

</style>
