<template>
    <v-row no-gutters style="height: calc(100vh - 64px)">
        <v-col cols="12">
            <GmapMap
                :center='center'
                :zoom='13.5'
                style='width:100%;  height: 100%;'
            >
                <GmapMarker
                    :key="'m-' + index" v-for="(school, index) in visibleSchools"
                    :position="school.centre"
                    :icon="require('@/assets/school.png')"
                    @click="showSchool(school)"
                    :label="{ className: 'marker-label', text: school.shortName, fontSize: '20px', fontWeight: 'bold', color:'#666', marginTop: '40px'}"
                />
                <GmapMarker v-if="home !== null"
                            :animation="2"
                            :position="home"
                            :label="{ className: 'marker-label', text: 'Home', fontSize: '20px', fontWeight: 'bold', color:'#666', marginTop: '40px'}"
                />
                <GmapCircle
                    :key="'r-' + index"
                    v-for="(school, index) in visibleSchoolsCircles"
                    :center="school.centre" :radius="circleRadius(school)" :options="circleOptions(school)"/>
            </GmapMap>
        </v-col>
    </v-row>
</template>

<script>

export default {
    name: 'GoogleMap',
    data() {
        return {
            center: {lat: 51.51215, lng: -0.312812},
            currentSchool: null,
            showSchoolInfo: false,
        }
    },
    mounted() {
        this.geolocate();
    },
    props: {
        schools: { type: Array, required: true },
        year: { type: String, required: true },
        home: { required: true }
    },
    methods: {
        geolocate: function () {
            navigator.geolocation.getCurrentPosition(position => {
                this.centerx = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
            });
        },
        circleRadius(school) {
            if (null === school.intakeDist[this.year]) return 5 * 1609;

            return 1609 * school.intakeDist[this.year];
        },
        circleOptions: function (school) {

            return {
                strokeColor: school.colour,
                strokeOpacity: school.intakeDist[this.year] == null ? 0.4 : null,
                strokeWeight: 0.6,
                fillColor: school.colour,
                fillOpacity: school.intakeDist[this.year] == null ? 0.05 : 0.2
            }

        },
        showSchool(school) {
            this.$emit('show-school-info', school);
        },
        markerImage(pinColor) {
            var pinSVGFilled = "M 12,2 C 8.1340068,2 5,5.1340068 5,9 c 0,5.25 7,13 7,13 0,0 7,-7.75 7,-13 0,-3.8659932 -3.134007,-7 -7,-7 z";
            var labelOriginFilled =  [12,9];


            var markerImage = {  // https://developers.google.com/maps/documentation/javascript/reference/marker#MarkerLabel
                path: pinSVGFilled,
                anchor: [12,17],
                fillOpacity: 1,
                fillColor: pinColor,
                strokeWeight: 2,
                strokeColor: "white",
                scale: 2,
                labelOrigin: labelOriginFilled
            };
            return markerImage;
        }
    },
    computed: {
        visibleSchools() {
            return this.schools.filter(school => school.visible)
        },
        visibleSchoolsCircles() {
            return this.schools.filter(school => school.visible && school.radius)
        }
    }
};
</script>

<style>
.disabled {
    opacity: 0.3;
}

.input-area {
    border: 2px solid black;
    padding: 8px 8px;
}

input:focus {
    outline: none;
}

input {
    width: 100%;
}

.marker-label {
    opacity: 1;
    margin-top: 80px;
    border-radius: 10px;
    background-color: rgba(255,255,255,0.4);
    padding: 2px 6px;
}

</style>
