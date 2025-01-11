<template>
  <div style="height: calc(100vh - 64px)" v-if="mapReady">
    <teleport to="#home-address-input">
      <vue-google-autocomplete id="school-map" classname="form-control"
                               placeholder="Enter your home address"
                               @placechanged="setPlace"
                               country="uk"
                               v-if="mapReady"
      />

    </teleport>
    <GoogleMap
        mapId="school-map"
        :center='center'
        :zoom='13.5'
        :api-promise="apiPromise"
        style='width:100%; height: calc(100vh - 64px); min-height: 200px;'
    >
      <AdvancedMarker
          :key="'m-' + index" v-for="(school, index) in visibleSchools"
          :options="schoolMarkerOptions(school)"
          :pin-options="schoolMarkerPinOptions(school)"
          @click="showSchool(school)"
      />
      <AdvancedMarker
          :key="'im-' + index" v-for="(school, index) in invisibleSchools"
          :options="invisiSchoolMarkerOptions(school)"
          :pin-options="invisiSchoolMarkerPinOptions(school)"
          @click="showSchool(school)"
      />
      <AdvancedMarker v-if="home !== null"
                      :options="homeMarkerOptions()"
      />
      <Polygon
          :key="'r-' + index"
          v-for="(school, index) in visibleSchoolsCircles"
          :options="circleOptions(school)"/>
    </GoogleMap>
  </div>
</template>

<script>
import {GoogleMap, AdvancedMarker, Circle, Polyline, Polygon} from 'vue3-google-map'
import {Loader} from '@googlemaps/js-api-loader';
import VueGoogleAutocomplete from "vue-google-autocomplete";

export default {
  name: 'SchoolsMap',
  data() {
    return {
      apiPromise: null,
      google: null,
      mapReady: false,
      center: {lat: 51.51215, lng: -0.312812},
      currentSchool: null,
      showSchoolInfo: false,
    }
  },
  beforeMount() {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      libraries: ['places', 'marker'],
    });

    this.apiPromise = loader.load();
    this.apiPromise.then((google) => {
      this.google = google;
      this.mapReady = true;
    });
  },
  mounted() {
    this.geolocate();
    this.home = JSON.parse(localStorage.getItem('home'))
  },
  components: {GoogleMap, AdvancedMarker, Circle, Polygon, Polyline, VueGoogleAutocomplete},
  props: {
    schools: {type: Array, required: true},
    year: {type: String, required: true},
  },
  methods: {
    setPlace(place) {
      this.home = {
        lat: place.latitude,
        lng: place.longitude,
      };

      localStorage.setItem('home', JSON.stringify(this.home))
    },
    schoolMarkerOptions(school) {
      return {
        position: school.centre,
      }
    },
    schoolMarkerPinOptions(school) {
      const image = document.createElement('img');
      image.src = this.getIconForSchool(school);
      image.alt = 'School Marker';
      image.style.width = '30px';
      image.style.height = '30px';

      const markerContainer = document.createElement('div');
      markerContainer.style.position = 'relative'; // Required for positioning the label

// Add the image to the container
      markerContainer.appendChild(image);

// Create the label element
      const label = document.createElement('div');
      label.textContent = school.shortName;
      label.style.position = 'absolute';
      label.style.top = '60px'; // Adjust this value to position the label below the image
      label.style.left = '-35px';
      label.style.padding = '4px'
      label.style.borderRadius = '4px'
      label.style.backgroundColor = 'black';
      label.style.textAlign = 'center';
      label.style.width = '100px';
      label.style.fontSize = '12px'; // Adjust font size as needed

// Add the label to the container
      markerContainer.appendChild(label);

      return {
        glyph: markerContainer,
        borderColor: 'black',
        background: 'white',
        glyphColor: 'white',
        scale: 1.5
      }
    },
    invisiSchoolMarkerOptions(school) {
      return {
        position: school.centre,
      }
    },
    invisiSchoolMarkerPinOptions(school) {
      const marker = this.schoolMarkerPinOptions(school);
      marker.glyph.style.opacity = 0.2
      marker.background = '#ffffffc0'
      marker.borderColor = '#00000020';
      return marker;
    },
    homeMarkerOptions() {
      return {
        position: this.home
      }
    },
    geolocate: function () {
      navigator.geolocation.getCurrentPosition(position => {
        this.centerx = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
      });
    },
    circlePath(school) {
      if (school.intakePath && school.intakePath[this.year]) {
        return school.intakePath[this.year].map(point => { return { "lat": point[1], "lng": point[0]} })
      }
      let center = school.centre;
      let radiusMeters = this.circleRadius(school);
      const points = [];
      const numPoints = 100; // Number of points to create the circle
      const EarthRadius = 6371000; // Earth's radius in meters

      for (let i = 0; i <= numPoints; i++) {
        const angle = (Math.PI * 2 * i) / numPoints;
        const lat = center.lat + (radiusMeters / EarthRadius) * Math.cos(angle) * (180 / Math.PI);
        const lng = center.lng + (radiusMeters / EarthRadius) * Math.sin(angle) * (180 / Math.PI) / Math.cos(center.lat * Math.PI / 180);
        points.push({lat, lng});
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
        path: this.circlePath(school),
        strokeColor: school.colour,
        strokeOpacity: school.intakeDist[this.year] == null ? 0.4 : null,
        strokeWeight: 0.6,
        fillColor: school.colour,
        fillOpacity: school.intakeDist[this.year] == null ? 0.05 : 0.2,
      }
    },
    polygonOptions: function (school) {

      var lineSymbol = {
        path: 'M 0,-1 0,1',
        strokeOpacity: 1,
        strokeWeight: 0.8,
        scale: 3
      };

      return {
        ...this.circleOptions(school),
        path: this.circlePath(school),
        icons: [{
          icon: lineSymbol,
          offset: '0',
          repeat: '15px'
        }],
        strokeOpacity: 0,
        fillOpacity: 0.07

      }

    },
    showSchool(school) {
      this.$emit('show-school-info', school);
    },
  },
  computed: {
    visibleSchools() {
      return this.schools.filter(school => school.visible)
    },
    invisibleSchools() {
      return this.schools.filter(school => !school.visible)
    },
    visibleSchoolsCircles() {
      return this.schools.filter(school => school.visible && this.hasIntakeDistance(school))
    },
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
;
</script>

<style>
.disabled {
  opacity: 0.3;
}

.xinput-area {
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

.pac-container {
  z-index: 2000;
  width: 275px !important;
}

</style>
