<template>
  <div class="map-wrap">
    <GoogleMap v-if="mapsReady" :api-promise="apiPromise" :center="center" :zoom="13" :styles="mapStyles"
               :clickable-icons="false" :street-view-control="false" :map-type-control="false"
               :fullscreen-control="true" class="map" @click="onMapClick">
      <Polygon v-for="r in rings" :key="'ring-' + r.key" :options="r.options"/>

      <CustomMarker v-for="pin in pins" :key="'pin-' + pin.school.name"
                    :options="{position: pin.school.centre, anchorPoint: 'CENTER', zIndex: pin.selected ? 50 : 10}">
        <button type="button" class="pin" :class="{'pin--on': pin.selected}" :aria-label="pin.school.name"
                @click.stop="$emit('select', pin.school)">
          <span class="pin__dot" :style="{background: pin.colour}"></span>
          <span class="pin__label">
            {{ pin.school.shortName }}
            <span v-if="pin.open" class="pin__tag">All offered</span>
          </span>
        </button>
      </CustomMarker>

      <CustomMarker v-if="home" :options="{position: home, anchorPoint: 'BOTTOM_CENTER', zIndex: 100}">
        <svg width="28" height="36" viewBox="0 0 28 36" aria-label="Your home" role="img" class="home-pin">
          <path d="M14 35s12-12.3 12-21A12 12 0 0 0 2 14c0 8.7 12 21 12 21z" fill="#E8590C" stroke="#fff" stroke-width="2"/>
          <circle cx="14" cy="14" r="4.5" fill="#fff"/>
        </svg>
      </CustomMarker>
    </GoogleMap>
    <div v-else class="map map--loading">{{ mapsFailed ? 'The map couldn’t load. You can still pick an area above to see your chances.' : 'Loading map…' }}</div>
  </div>
</template>

<script>
import {CustomMarker, GoogleMap, Polygon} from 'vue3-google-map';
import walking from '@/plugins/walking';

const EARTH_RADIUS_M = 6371000;
const METRES_PER_MILE = 1609.34;

function circlePoints(center, miles) {
  const radius = miles * METRES_PER_MILE;
  const pts = [];
  for (let i = 0; i <= 96; i++) {
    const angle = (Math.PI * 2 * i) / 96;
    const lat = center.lat + (radius / EARTH_RADIUS_M) * Math.cos(angle) * (180 / Math.PI);
    const lng = center.lng + (radius / EARTH_RADIUS_M) * Math.sin(angle) * (180 / Math.PI) / Math.cos(center.lat * Math.PI / 180);
    pts.push({lat, lng});
  }
  return pts;
}

export default {
  name: 'SchoolsMap',
  components: {GoogleMap, CustomMarker, Polygon},
  props: {
    schools: {type: Array, required: true},
    year: {type: String, required: true},
    home: {type: Object, default: null},
    selected: {type: Object, default: null},
    apiPromise: {type: Promise, default: null},
    mapsReady: {type: Boolean, default: false},
    mapsFailed: {type: Boolean, default: false},
  },
  emits: ['select', 'set-home'],
  data() {
    return {
      center: {lat: 51.522, lng: -0.325},
      mapStyles: [
        {elementType: 'geometry', stylers: [{color: '#f5f5f5'}]},
        {elementType: 'labels.icon', stylers: [{visibility: 'off'}]},
        {elementType: 'labels.text.fill', stylers: [{color: '#616161'}]},
        {elementType: 'labels.text.stroke', stylers: [{color: '#f5f5f5'}]},
        {featureType: 'poi', elementType: 'geometry', stylers: [{color: '#eeeeee'}]},
        {featureType: 'poi', elementType: 'labels', stylers: [{visibility: 'off'}]},
        {featureType: 'poi.park', elementType: 'geometry', stylers: [{color: '#e3eadf'}]},
        {featureType: 'road', elementType: 'geometry', stylers: [{color: '#ffffff'}]},
        {featureType: 'road.highway', elementType: 'geometry', stylers: [{color: '#dadada'}]},
        {featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{color: '#9e9e9e'}]},
        {featureType: 'transit.line', elementType: 'geometry', stylers: [{color: '#e5e5e5'}]},
        {featureType: 'water', elementType: 'geometry', stylers: [{color: '#c9d6e3'}]},
      ],
    };
  },
  computed: {
    rings() {
      return this.schools
          .filter(s => typeof s.intakeDist[this.year] === 'number' && s.intakeDist[this.year] > 0)
          .map(s => {
            const sel = this.isSelected(s);
            const walk = walking.cutoffOutline(s, this.year) || (s.intakePath && s.intakePath[this.year]);
            const path = walk
                ? walk.map(([lng, lat]) => ({lat, lng}))
                : circlePoints(s.centre, s.intakeDist[this.year]);
            return {
              key: `${s.name}-${this.year}-${sel}`,
              options: {
                path,
                clickable: false,
                strokeColor: s.colour,
                strokeOpacity: sel ? 1 : 0.6,
                strokeWeight: sel ? 3 : 1.5,
                fillColor: s.colour,
                fillOpacity: sel ? 0.16 : 0.06,
                zIndex: sel ? 20 : 1,
              },
            };
          });
    },
    pins() {
      return this.schools.map(s => {
        const cut = s.intakeDist[this.year];
        return {
          school: s,
          selected: this.isSelected(s),
          open: cut === null,
          colour: cut === null ? '#9AA1AC' : s.colour,
        };
      });
    },
  },
  methods: {
    isSelected(s) {
      return !!this.selected && this.selected.name === s.name;
    },
    onMapClick(e) {
      if (!e || !e.latLng) return;
      this.$emit('set-home', {lat: e.latLng.lat(), lng: e.latLng.lng()});
    },
  },
};
</script>

<style scoped>
.map-wrap { position: relative; }
.map {
  width: 100%;
  height: clamp(360px, 58vh, 640px);
  border-radius: 10px;
  overflow: hidden;
}
.map--loading {
  display: flex; align-items: center; justify-content: center;
  background: #E8ECEF; color: var(--ink-3); font-size: 14px; text-align: center; padding: 24px; box-sizing: border-box;
}
.pin {
  position: relative;
  width: 44px; height: 44px;
  padding: 0; border: 0; background: transparent;
  cursor: pointer;
  font: inherit;
}
.pin__dot {
  position: absolute; left: 50%; top: 50%;
  width: 12px; height: 12px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, .35);
  transition: width .15s, height .15s;
}
.pin__label {
  position: absolute; left: 50%; top: 32px;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 11px; font-weight: 600; color: var(--ink);
  text-shadow: 0 0 3px #fff, 0 0 3px #fff, 0 0 3px #fff;
  line-height: 1.25;
  text-align: center;
}
.pin__tag { display: block; font-size: 10px; font-weight: 700; color: #14532D; }
.pin--on .pin__dot { width: 18px; height: 18px; }
.pin--on .pin__label { font-size: 13px; font-weight: 700; }
.home-pin { display: block; pointer-events: none; }
</style>
