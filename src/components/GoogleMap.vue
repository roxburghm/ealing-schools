<template>
  <div style="height: calc(100vh - 64px)">
      <GMapMap
          :center='center'
          :zoom='13.5'
          style='width:100%; height: calc(100vh - 64px); min-height: 200px;'
      >
        <GMapMarker
            :key="'m-' + index" v-for="(school, index) in visibleSchools"
            :position="school.centre"
            :icon="getIconForSchool(school)"
            @click="showSchool(school)"
            :label="{ className: 'marker-label', text: school.shortName, fontSize: '20px', fontWeight: 'bold', color:'#666', marginTop: '40px'}"
        />
        <GMapMarker v-if="home !== null"
                    :animation="2"
                    :position="home"
                    :label="{ className: 'marker-label', text: 'Home', fontSize: '20px', fontWeight: 'bold', color:'#666', marginTop: '40px'}"
        />
        <GMapCircle
            :key="'r-' + index"
            v-for="(school, index) in visibleSchoolsCircles"
            :center="school.centre" :radius="circleRadius(school)" :options="circleOptions(school)"/>
        <GMapPolyline
            :key="'rp-' + index"
            v-for="(school, index) in visibleSchoolsCirclesWalking"
            :path="circlePath(school)" :options="circleOptions(school)"/>
      </GMapMap>
  </div>
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
    schools: {type: Array, required: true},
    year: {type: String, required: true},
    home: {required: true}
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
    circlePath(school) {
      let center = school.centre;
      let radiusMeters = this.circleRadius(school);
      const points = [];
      const numPoints = 100; // Number of points to create the circle
      const EarthRadius = 6371000; // Earth's radius in meters

      for (let i = 0; i <= numPoints; i++) {
        const angle = (Math.PI * 2 * i) / numPoints;
        const lat = center.lat + (radiusMeters / EarthRadius) * Math.cos(angle) * (180 / Math.PI);
        const lng = center.lng + (radiusMeters / EarthRadius) * Math.sin(angle) * (180 / Math.PI) / Math.cos(center.lat * Math.PI / 180);
        points.push({ lat, lng});
      }
      return points;
    },
    circleRadius(school) {
      if (null === school.intakeDist[this.year]) return 5 * 1609;

      return 1609 * school.intakeDist[this.year];
    },
    hasIntakeDistance(school) {
      return !(null === school.intakeDist[this.year]);
    },
    getIconForSchool(school) {
      if (null === school.intakeDist[this.year]) return '/school_all.png';
      if (!school.radius) return '/school_notes.png';
      return '/school.png'
    },
    circleOptions: function (school) {
      return {
        strokeColor: school.colour,
        strokeOpacity: school.intakeDist[this.year] == null ? 0.4 : null,
        strokeWeight: 0.6,
        fillColor: school.colour,
        fillOpacity: school.intakeDist[this.year] == null ? 0.05 : 0.2,
        strokeDasharray: [100, 100]
      }

    },
    showSchool(school) {
      this.$emit('show-school-info', school);
    },
    markerImage(pinColor) {
      var pinSVGFilled = "M 12,2 C 8.1340068,2 5,5.1340068 5,9 c 0,5.25 7,13 7,13 0,0 7,-7.75 7,-13 0,-3.8659932 -3.134007,-7 -7,-7 z";
      var labelOriginFilled = [12, 9];


      var markerImage = {  // https://developers.google.com/maps/documentation/javascript/reference/marker#MarkerLabel
        path: pinSVGFilled,
        anchor: [12, 17],
        fillOpacity: 1,
        fillColor: pinColor,
        strokeWeight: 2,
        strokeColor: "white",
        scale: 2,
        labelOrigin: labelOriginFilled
      };
      return markerImage;
    }
  }
  ,
  computed: {
    visibleSchools() {
      return this.schools.filter(school => school.visible)
    }
    ,
    visibleSchoolsCircles() {
      return this.schools.filter(school => school.visible && school.radius && this.hasIntakeDistance(school))
    }
    ,
    visibleSchoolsCirclesWalking() {
      return this.schools.filter(school => school.visible && !school.radius && this.hasIntakeDistance(school))
    }
  }
}
;
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
  background-color: rgba(255, 255, 255, 0.4);
  padding: 2px 6px;
}

</style>
