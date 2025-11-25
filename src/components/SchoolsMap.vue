<template>
  <div style="height: calc(100vh - 64px)" v-if="mapReady">
    <teleport to="#home-address-input">
      <vue-google-autocomplete id="school-map" classname="form-control"
                               placeholder="Enter your home address"
                               @placechanged="setPlace"
                               country="uk"
                               enable-geolocation
                               v-if="mapReady"
      />

    </teleport>
    <GoogleMap
        :center='center'
        :zoom='13.5'
        :api-promise="apiPromise"
        style='width:100%; height: calc(100vh - 64px); min-height: 200px;'
        :styles="mapStyles"
    >
      <CustomMarker
          :key="'m-' + index" v-for="(school, index) in visibleSchools"
          :options="{ position: school.centre, zIndex: isHovered(school) ? 100 : 1 }"
          @click="showSchool(school)"
      >
        <div style="position: relative; width: 0; height: 0; cursor: pointer;"
             @mouseover="$emit('hover-school', school)"
             @mouseleave="$emit('hover-school', null)">
          <!-- Image: Anchored bottom-center to (0,0) using transform -->
          <div style="position: absolute; left: 0; top: 0; height: 30px; transform: translate(-50%, -100%); transition: transform 0.2s;"
               :style="{ transform: isHovered(school) ? 'translate(-50%, -100%) scale(1.2)' : 'translate(-50%, -100%)' }">
             <img :src="getIconForSchool(school)" alt="School Marker" style="height: 100%; width: auto; display: block;">
          </div>
          
          <!-- Label: Anchored top-center to (0,0) with tighter offset -->
          <div class="marker-label"
               style="position: absolute; top: 2px; left: 0; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center;"
               :style="{
                 backgroundColor: isHovered(school) ? '#3F51B5' : 'white',
                 color: isHovered(school) ? 'white' : 'black',
                 fontWeight: isHovered(school) ? 'bold' : '500',
                 zIndex: isHovered(school) ? 100 : 10
               }">
            <span style="white-space: nowrap;">{{ school.shortName }}</span>
            <span v-if="!school.radius" style="font-size: 0.75em; font-weight: normal; white-space: nowrap; opacity: 0.8;">(See notes)</span>
            <span v-if="school.intakeDist[year] === null" style="font-size: 0.75em; font-weight: normal; white-space: nowrap; opacity: 0.8; color: #2E7D32;">(All accepted)</span>
          </div>
        </div>
      </CustomMarker>

      <CustomMarker
          :key="'im-' + index" v-for="(school, index) in invisibleSchools"
          :options="{ position: school.centre, zIndex: 0 }"
          @click="showSchool(school)"
      >
         <div style="position: relative; width: 0; height: 0; cursor: pointer;"
              @mouseover="$emit('hover-school', school)"
              @mouseleave="$emit('hover-school', null)">
           <!-- Dot: Anchored center to (0,0) -->
          <div style="position: absolute; left: -6px; top: -6px; width: 12px; height: 12px; border-radius: 50%; background-color: #9E9E9E; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">
          </div>
          
          <!-- Label: Hidden by default, shown on hover -->
          <div class="marker-label" 
               v-if="isHovered(school)"
               style="position: absolute; top: 10px; left: 0; transform: translateX(-50%); white-space: nowrap; background-color: white; padding: 2px 6px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-size: 11px; z-index: 100;">
            {{ school.shortName }}
          </div>
        </div>
      </CustomMarker>

      <CustomMarker v-if="home !== null" :options="{ position: home }">
         <div style="transform: translate(-50%, -50%);">
            <v-icon color="red" size="large">mdi-map-marker</v-icon>
         </div>
      </CustomMarker>

      <Polyline
          :key="'r-' + index"
          v-for="(school, index) in visibleSchoolsIntakeAll"
          :options="linkOptions(school)"
      />
      <Polygon
          :key="'r-' + index"
          v-for="(school, index) in visibleSchoolsCircles"
          :options="circleOptions(school)"/>
    </GoogleMap>
  </div>
</template>

<script>
import {CustomMarker, Circle, GoogleMap, Polygon, Polyline} from 'vue3-google-map'
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
      mapStyles: [
        {
          "elementType": "geometry",
          "stylers": [{"color": "#f5f5f5"}]
        },
        {
          "elementType": "labels.icon",
          "stylers": [{"visibility": "off"}]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#616161"}]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [{"color": "#f5f5f5"}]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#bdbdbd"}]
        },
        {
          "featureType": "poi",
          "elementType": "geometry",
          "stylers": [{"color": "#eeeeee"}]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#757575"}]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry",
          "stylers": [{"color": "#e5e5e5"}]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#9e9e9e"}]
        },
        {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [{"color": "#ffffff"}]
        },
        {
          "featureType": "road.arterial",
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#757575"}]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [{"color": "#dadada"}]
        },
        {
          "featureType": "road.highway",
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#616161"}]
        },
        {
          "featureType": "road.local",
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#9e9e9e"}]
        },
        {
          "featureType": "transit.line",
          "elementType": "geometry",
          "stylers": [{"color": "#e5e5e5"}]
        },
        {
          "featureType": "transit.station",
          "elementType": "geometry",
          "stylers": [{"color": "#eeeeee"}]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [{"color": "#c9c9c9"}]
        },
        {
          "featureType": "water",
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#9e9e9e"}]
        }
      ]
    }
  },
  beforeMount() {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      libraries: ['places'], // Removed 'marker' as we don't need AdvancedMarker anymore
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
  components: {GoogleMap, CustomMarker, Circle, Polygon, Polyline, VueGoogleAutocomplete},
  props: {
    schools: {type: Array, required: true},
    year: {type: String, required: true},
    hoveredSchool: {type: Object, default: null}
  },
  methods: {
    setPlace(place) {
      this.home = {
        lat: place.latitude,
        lng: place.longitude,
      };

      localStorage.setItem('home', JSON.stringify(this.home))
    },
    isHovered(school) {
        return this.hoveredSchool && this.hoveredSchool.name === school.name;
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
    linkPath(school) {
      return [school.centre, this.home];
    },
    circleRadius(school) {
      if (null === school.intakeDist[this.year]) return 5 * 1609;

      return 1609 * school.intakeDist[this.year];
    },
    hasIntakeDistance(school) {
      return !(null === school.intakeDist[this.year]);
    },
    getIconForSchool(school) {
      // if (null === school.intakeDist[this.year]) return '/school_all.png'; // Deprecated
      // if (!school.radius) return '/school_notes.png'; // Deprecated
      return '/school.png'
    },
    circleOptions: function (school) {
      const isHovered = this.isHovered(school);
      
      return {
        path: this.circlePath(school),
        strokeColor: school.colour,
        strokeOpacity: school.intakeDist[this.year] == null ? 0.4 : (isHovered ? 1.0 : null),
        strokeWeight: isHovered ? 2 : 0.6,
        fillColor: school.colour,
        fillOpacity: school.intakeDist[this.year] == null ? 0.05 : (isHovered ? 0.4 : 0.2),
        zIndex: isHovered ? 100 : 1
      }
    },
    linkOptions: function (school) {
      const isHovered = this.isHovered(school);
      const isTookAll = school.intakeDist[this.year] == null;
      const color = isTookAll ? '#4CAF50' : school.colour;

      const lineSymbol = {
        path: "M 0,-1 0,1",
        strokeOpacity: isHovered ? 1 : 0.4,
        scale: 2,
      };

      return {
        path: this.linkPath(school),
        strokeColor: color,
        strokeWeight: isHovered ? 2 : 1,
        strokeOpacity: 0,
        zIndex: isHovered ? 100 : 1,
        icons: [
          {
            icon: lineSymbol,
            offset: "0",
            repeat: "10px",
          },
        ],
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
    visibleSchoolsIntakeAll() {
      return this.schools.filter(school => school.visible && this.home !== null && !this.hasIntakeDistance(school))
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

/* Style the teleported autocomplete input to match Vuetify */
#home-address-input input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.38);
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

#home-address-input input:focus {
  outline: none;
  border-color: #3F51B5; /* Primary color */
  border-width: 2px;
  padding-left: 11px; /* Adjust for border width change */
}

.marker-label {
  opacity: 1;
  border-radius: 4px;
  background-color: white;
  color: rgba(0, 0, 0, 0.87);
  padding: 4px 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  font-weight: 500;
  border: 1px solid rgba(0,0,0,0.1);
}

.pac-container {
  z-index: 2000;
  font-family: 'Inter', sans-serif;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border-top: none;
}

.pac-item {
  padding: 8px;
  cursor: pointer;
}

.pac-item:hover {
  background-color: #F5F7FA;
}

</style>
