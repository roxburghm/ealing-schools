<template>
  <div class="map-wrap">
    <teleport to="#home-address-input" v-if="mapReady">
      <div class="address-field" :class="{ 'has-home': home }">
        <v-icon class="address-icon" size="20" :color="home ? 'primary' : undefined">mdi-home-outline</v-icon>
        <vue-google-autocomplete id="home-address"
                                 ref="address"
                                 classname="address-input"
                                 placeholder="Enter your home address"
                                 @placechanged="setPlace"
                                 country="uk"
                                 aria-label="Home address"
        />
        <v-btn v-if="home" icon="mdi-close" size="small" variant="text" density="comfortable"
               aria-label="Clear home address" @click="clearHome"/>
        <v-btn v-else icon="mdi-crosshairs-gps" size="small" variant="text" density="comfortable"
               aria-label="Use my current location" v-tooltip:bottom="'Use my location'" @click="useMyLocation"/>
      </div>
    </teleport>

    <GoogleMap v-if="mapReady"
               :center="center"
               :zoom="13.5"
               :api-promise="apiPromise"
               :styles="mapStyles"
               :street-view-control="false"
               :fullscreen-control="false"
               class="map"
    >
      <CustomMarker
          v-for="school in visibleSchools" :key="'m-' + school.name"
          :options="{ position: school.centre, zIndex: isHovered(school) ? 100 : 10 }"
          @click="showSchool(school)"
      >
        <div class="marker" :class="{ hovered: isHovered(school) }"
             @mouseover="$emit('hover-school', school)"
             @mouseleave="$emit('hover-school', null)">
          <img src="/school.png" alt="" class="marker-icon">
          <div class="marker-label">
            <span class="marker-name">
              <v-icon v-if="home && statusIcon(school)" :color="statusColour(school)" size="14" class="mr-1">{{ statusIcon(school) }}</v-icon>{{ school.shortName }}
            </span>
            <span v-if="school.intakeDist[year] === null" class="marker-note text-success">Everyone offered</span>
            <span v-else-if="isWalk(school)" class="marker-note">Walking distance</span>
          </div>
        </div>
      </CustomMarker>

      <CustomMarker
          v-for="school in hiddenSchools" :key="'h-' + school.name"
          :options="{ position: school.centre, zIndex: 1 }"
          @click="showSchool(school)"
      >
        <div class="marker-dot-wrap"
             @mouseover="$emit('hover-school', school)"
             @mouseleave="$emit('hover-school', null)">
          <div class="marker-dot" :style="{ backgroundColor: isHovered(school) ? school.colour : undefined }"></div>
          <div v-if="isHovered(school)" class="marker-label marker-label--dot">{{ school.shortName }}</div>
        </div>
      </CustomMarker>

      <CustomMarker v-if="home" :options="{ position: home, zIndex: 200 }">
        <div class="home-pin" aria-label="Your home">
          <v-icon color="white" size="18">mdi-home</v-icon>
        </div>
      </CustomMarker>

      <Polyline
          v-for="school in everyoneOfferedSchools" :key="'l-' + school.name"
          :options="linkOptions(school)"
      />
      <Polygon
          v-for="school in catchmentSchools" :key="'c-' + school.name"
          :options="catchmentOptions(school)"
      />
    </GoogleMap>

    <div class="map-legend" v-if="mapReady">
      <div class="legend-row"><span class="legend-swatch"></span>Last place offered in {{ yearLabel }}</div>
      <div class="legend-row"><span class="legend-dash"></span>School offered everyone a place</div>
    </div>
  </div>
</template>

<script>
import {CustomMarker, GoogleMap, Polygon, Polyline} from 'vue3-google-map'
import {Loader} from '@googlemaps/js-api-loader';
import VueGoogleAutocomplete from "vue-google-autocomplete";
import mapStyles from '@/plugins/mapStyles';
import walking, {METRES_PER_MILE} from '@/plugins/walking';
import admission from '@/plugins/admission';

const HOME_KEY = 'home';

export default {
  name: 'SchoolsMap',
  components: {GoogleMap, CustomMarker, Polygon, Polyline, VueGoogleAutocomplete},
  props: {
    schools: {type: Array, required: true},
    year: {type: String, required: true},
    yearLabel: {type: String, default: ''},
    hoveredSchool: {type: Object, default: null}
  },
  emits: ['show-school-info', 'hover-school'],
  data() {
    return {
      apiPromise: null,
      mapReady: false,
      center: {lat: 51.51215, lng: -0.312812},
      mapStyles,
    }
  },
  beforeMount() {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      libraries: ['places'],
    });

    this.apiPromise = loader.load();
    this.apiPromise.then(() => {
      this.mapReady = true;
      this.$nextTick(this.restoreHome);
    });
  },
  methods: {
    restoreHome() {
      let saved = null;
      try {
        saved = JSON.parse(localStorage.getItem(HOME_KEY));
      } catch (e) {
        saved = null;
      }
      if (!saved || typeof saved.lat !== 'number') return;
      this.home = {lat: saved.lat, lng: saved.lng};
      this.center = this.home;
      if (saved.label) this.$refs.address?.update(saved.label);
    },
    setPlace(place, result) {
      this.home = {lat: place.latitude, lng: place.longitude};
      this.center = this.home;
      const label = result?.formatted_address || '';
      try {
        localStorage.setItem(HOME_KEY, JSON.stringify({...this.home, label}));
      } catch (e) {
        // Private browsing: the address simply won't be remembered.
      }
    },
    clearHome() {
      this.home = null;
      this.$refs.address?.clear();
      try {
        localStorage.removeItem(HOME_KEY);
      } catch (e) {
        // Nothing stored.
      }
    },
    useMyLocation() {
      this.$refs.address?.geolocate();
    },
    isHovered(school) {
      return this.hoveredSchool && this.hoveredSchool.name === school.name;
    },
    isWalk(school) {
      return admission.measure(school) === 'walk';
    },
    statusFor(school) {
      return admission.status(school, this.year, this.home);
    },
    statusIcon(school) {
      return admission.STATUS_ICON[this.statusFor(school).kind];
    },
    statusColour(school) {
      return admission.STATUS_COLOUR[this.statusFor(school).kind];
    },
    // Walking-distance schools use the outline CI built from GraphHopper, then
    // any hand-made outline in the data, then fall back to a circle.
    catchmentPath(school) {
      const outline = walking.cutoffOutline(school, this.year)
          || school.intakePath?.[this.year];
      if (outline) return outline.map(([lng, lat]) => ({lat, lng}));
      return this.circle(school.centre, school.intakeDist[this.year] * METRES_PER_MILE);
    },
    circle(centre, radiusMetres) {
      const EARTH_RADIUS = 6371000;
      const points = [];
      for (let i = 0; i <= 100; i++) {
        const angle = (Math.PI * 2 * i) / 100;
        points.push({
          lat: centre.lat + (radiusMetres / EARTH_RADIUS) * Math.cos(angle) * (180 / Math.PI),
          lng: centre.lng + (radiusMetres / EARTH_RADIUS) * Math.sin(angle) * (180 / Math.PI) / Math.cos(centre.lat * Math.PI / 180),
        });
      }
      return points;
    },
    catchmentOptions(school) {
      const hovered = this.isHovered(school);
      return {
        path: this.catchmentPath(school),
        strokeColor: school.colour,
        strokeOpacity: hovered ? 1 : 0.7,
        strokeWeight: hovered ? 2.5 : 1,
        fillColor: school.colour,
        fillOpacity: hovered ? 0.35 : 0.16,
        zIndex: hovered ? 100 : 1,
        clickable: false,
      }
    },
    linkOptions(school) {
      const hovered = this.isHovered(school);
      return {
        path: [school.centre, this.home],
        strokeColor: '#2E7D32',
        strokeOpacity: 0,
        zIndex: hovered ? 100 : 1,
        clickable: false,
        icons: [{
          icon: {path: 'M 0,-1 0,1', strokeOpacity: hovered ? 1 : 0.5, strokeWeight: hovered ? 2.5 : 1.5, scale: 2},
          offset: '0',
          repeat: '10px',
        }],
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
    hiddenSchools() {
      return this.schools.filter(school => !school.visible)
    },
    everyoneOfferedSchools() {
      if (!this.home) return [];
      return this.visibleSchools.filter(school => school.intakeDist[this.year] === null)
    },
    catchmentSchools() {
      return this.visibleSchools.filter(school => school.intakeDist[this.year] > 0)
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
</script>

<style>
.map-wrap {
  position: relative;
  height: calc(100dvh - var(--v-layout-top, 56px));
  min-height: 320px;
}

.map {
  width: 100%;
  height: 100%;
}

.marker {
  position: relative;
  width: 0;
  height: 0;
  cursor: pointer;
}

.marker-icon {
  position: absolute;
  left: 0;
  top: 0;
  height: 28px;
  transform: translate(-50%, -100%);
  transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1);
}

.marker.hovered .marker-icon {
  transform: translate(-50%, -100%) scale(1.15);
}

.marker-label {
  position: absolute;
  top: 3px;
  left: 0;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  white-space: nowrap;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.08);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.3;
  transition: background-color 160ms, color 160ms;
}

.marker.hovered .marker-label {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.marker.hovered .marker-label .v-icon,
.marker.hovered .marker-note {
  color: inherit !important;
}

.marker-name {
  display: inline-flex;
  align-items: center;
}

.marker-note {
  font-size: 10.5px;
  font-weight: 500;
  opacity: 0.85;
}

.marker-dot-wrap {
  position: relative;
  width: 0;
  height: 0;
  cursor: pointer;
}

.marker-dot {
  position: absolute;
  left: -6px;
  top: -6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #9AA1AD;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.3);
}

.marker-label--dot {
  top: 10px;
  font-weight: 500;
}

.home-pin {
  width: 32px;
  height: 32px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgb(var(--v-theme-primary));
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.35);
}

.map-legend {
  position: absolute;
  left: 12px;
  bottom: 28px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.08);
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.75);
  pointer-events: none;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-row + .legend-row {
  margin-top: 4px;
}

.legend-swatch {
  width: 14px;
  height: 10px;
  border-radius: 3px;
  background: rgba(var(--v-theme-primary), 0.18);
  border: 1px solid rgba(var(--v-theme-primary), 0.7);
}

.legend-dash {
  width: 14px;
  border-top: 2px dashed #2E7D32;
}

/* Address search, teleported into the side panel */
.address-field {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 44px;
  padding: 0 4px 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  background: rgb(var(--v-theme-surface));
  transition: border-color 160ms, box-shadow 160ms;
}

.address-field:focus-within {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.16);
}

.address-icon {
  opacity: 0.6;
}

.address-field.has-home .address-icon {
  opacity: 1;
}

.address-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: none;
  background: transparent;
  font: inherit;
  font-size: 15px;
  color: rgb(var(--v-theme-on-surface));
  text-overflow: ellipsis;
}

.address-input::placeholder {
  color: rgba(var(--v-theme-on-surface), 0.55);
}

.pac-container {
  z-index: 3000;
  font-family: inherit;
  margin-top: 4px;
  border-radius: 10px;
  border-top: none;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.14);
}

.pac-item {
  padding: 6px 10px;
  cursor: pointer;
}

.pac-item:hover {
  background-color: rgb(var(--v-theme-background));
}

@media (max-width: 600px) {
  .map-legend {
    display: none;
  }
}
</style>
