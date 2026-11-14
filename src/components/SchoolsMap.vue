<template>
  <div class="map-wrap" :style="height ? {height} : null">
    <GoogleMap v-if="mapsReady" ref="gmap" :api-promise="apiPromise" :center="center" :zoom="12" :styles="mapStyles"
               :clickable-icons="false" :street-view-control="false" :map-type-control="false"
               :fullscreen-control="interactive" :zoom-control="interactive" :disable-default-ui="!interactive"
               :gesture-handling="interactive ? gestures : 'cooperative'" :is-fractional-zoom-enabled="true"
               class="map" :class="{'map--fill': height}" @idle="onIdle">
      <Polygon v-for="r in rings" :key="'ring-' + r.key" :options="r.options"/>

      <CustomMarker v-for="pin in pins" :key="'pin-' + pin.school.name"
                    :options="{position: pin.school.centre, anchorPoint: 'CENTER', zIndex: pin.selected ? 50 : 10}">
        <button type="button" class="pin" :class="{'pin--on': pin.selected, 'pin--open': pin.open}"
                :aria-label="`${pin.school.name}: ${pin.description}`"
                @click.stop="$emit('select', pin.school)">
          <span class="pin__dot" :style="{background: pin.colour, color: pin.ink}">
            <school-icon :kind="pin.kind"/>
          </span>
          <span class="pin__label">
            {{ pin.school.shortName }}
            <!-- The tick says it at a glance; spell it out once the school is picked -->
            <span v-if="pin.open && pin.selected" class="pin__tag">All offered</span>
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
    <div v-else class="map map--loading" :class="{'map--fill': height}">{{ mapsFailed ? 'The map couldn’t load. You can still enter your address above to see your chances.' : 'Loading map…' }}</div>
    <div v-if="focus && mapsReady && interactive" class="map-actions">
      <button type="button" class="map-action" @click="$emit('clear-focus')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>
        </svg>
        Show all schools
      </button>
      <button v-if="hasCatchment" type="button" class="map-action" :aria-pressed="intakeView" @click="showIntake">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" stroke-dasharray="3 2.6"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/>
        </svg>
        Show intake
      </button>
    </div>
  </div>
</template>

<script>
import {CustomMarker, GoogleMap, Polygon} from 'vue3-google-map';
import walking from '@/plugins/walking';
import SchoolIcon from '@/components/SchoolIcon.vue';

const PIN_DESCRIPTIONS = {
  open: 'everyone who applied was offered a place',
  walk: 'places offered by walking distance',
  none: 'no places offered by distance',
  unknown: 'no cut-off published',
  distance: 'places offered by distance',
};

// Light school colours get a dark icon so it stays visible.
function isLight(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(c => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4;
}

const EARTH_RADIUS_M = 6371000;
const METRES_PER_MILE = 1609.34;
// The furthest out the all-schools view goes: wide enough on a desktop for every
// borough at once, but kept to street-name scale on a narrow phone map.
const MIN_AREA_ZOOM = 11;
const MIN_AREA_ZOOM_NARROW = 12;
// The closest in a school-and-home view goes.
const MAX_FOCUS_ZOOM = 16;

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
  components: {GoogleMap, CustomMarker, Polygon, SchoolIcon},
  props: {
    // The school the map is zoomed to, or null for the whole area.
    focus: {type: Object, default: null},
    schools: {type: Array, required: true},
    year: {type: String, required: true},
    home: {type: Object, default: null},
    selected: {type: Object, default: null},
    apiPromise: {type: Promise, default: null},
    mapsReady: {type: Boolean, default: false},
    mapsFailed: {type: Boolean, default: false},
    // CSS height for the map, e.g. '100%' or '220px'. Defaults to a share of the viewport.
    height: {type: String, default: null},
    // false for small preview maps: no controls, and two-finger panning.
    interactive: {type: Boolean, default: true},
    // Google gestureHandling: 'greedy' for a full-screen map, 'cooperative' when
    // the map sits in a scrolling page (wheel scrolls; Ctrl/⌘ + wheel zooms).
    gestures: {type: String, default: 'greedy'},
    // Re-fit when a hidden map (another tab) becomes visible again.
    visible: {type: Boolean, default: true},
  },
  emits: ['select', 'clear-focus'],
  data() {
    return {
      fitted: false,
      // Zoomed to the focused school's whole intake area (and home), not just school and home.
      intakeView: false,
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
    // While zoomed to a school, hide the others so its catchment stands out.
    shown() {
      return this.focus ? this.schools.filter(s => s.name === this.focus.name) : this.schools;
    },
    // Years in which the focused school drew a cut-off line on the map.
    catchmentYears() {
      if (!this.focus) return [];
      return Object.entries(this.focus.intakeDist)
          .filter(([year, cut]) => /^\d{4}$/.test(year) && typeof cut === 'number' && cut > 0)
          .map(([year]) => year);
    },
    hasCatchment() {
      return this.catchmentYears.length > 0;
    },
    rings() {
      return this.shown
          .filter(s => typeof s.intakeDist[this.year] === 'number' && s.intakeDist[this.year] > 0)
          .map(s => {
            const sel = this.isSelected(s);
            const path = this.catchmentPath(s);
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
      return this.shown.map(s => {
        const cut = s.intakeDist[this.year];
        let kind = 'distance';
        if (cut === null) kind = 'open';
        else if (cut === 0) kind = 'none';
        else if (cut === undefined) kind = 'unknown';
        else if (s.measure === 'walk') kind = 'walk';
        return {
          school: s,
          kind,
          description: PIN_DESCRIPTIONS[kind],
          selected: this.isSelected(s),
          open: kind === 'open',
          colour: s.colour,
          ink: isLight(s.colour) ? '#16181D' : '#fff',
        };
      });
    },
  },
  mounted() {
    // Re-fit when the map's box changes size (first layout, rotating a phone,
    // resizing the window) so the schools always fill it.
    if (typeof ResizeObserver === 'undefined') return;
    let last = '';
    this.resizeObserver = new ResizeObserver(([entry]) => {
      const {width, height} = entry.contentRect;
      const size = `${Math.round(width)}x${Math.round(height)}`;
      if (!width || !height || size === last) return;
      last = size;
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(this.fitView, 120);
    });
    this.resizeObserver.observe(this.$el);
  },
  beforeUnmount() {
    this.resizeObserver?.disconnect();
    clearTimeout(this.resizeTimer);
  },
  watch: {
    focus() {
      this.intakeView = false;
      this.fitView();
    },
    // No re-fit on year change: the zoomed view already covers every year.
    home() {
      if (this.focus) this.fitView();
    },
    visible(now) {
      if (now) this.$nextTick(this.fitView);
    },
  },
  methods: {
    catchmentPath(s, year = this.year) {
      const walk = walking.cutoffOutline(s, year) || (s.intakePath && s.intakePath[year]);
      return walk
          ? walk.map(([lng, lat]) => ({lat, lng}))
          : circlePoints(s.centre, s.intakeDist[year]);
    },
    showIntake() {
      this.intakeView = true;
      this.fitView();
    },
    onIdle() {
      // First idle means the map exists: replace the fixed start view with a fit.
      if (this.fitted) return;
      this.fitted = true;
      this.fitView();
    },
    // Zoom to the focused school, or to every school. None of these depend on
    // the year, so moving through the years never re-zooms the map.
    //  - school + home: crop tight to the two, for the most street detail
    //  - school only, or "Show intake": fit its largest catchment across all
    //    the years, plus home if we have one
    fitView() {
      const map = this.$refs.gmap?.map;
      if (!map || !window.google) return;
      const bounds = new window.google.maps.LatLngBounds();
      const points = [];
      if (this.focus && this.home && !this.intakeView) {
        points.push(this.focus.centre, this.home);
      } else if (this.focus) {
        points.push(this.focus.centre);
        if (this.home) points.push(this.home);
        this.catchmentYears.forEach(year => points.push(...this.catchmentPath(this.focus, year)));
      } else {
        points.push(...this.schools.map(s => s.centre));
      }
      points.forEach(p => bounds.extend(p));
      if (points.length === 1) {
        map.panTo(points[0]);
        map.setZoom(15);
        return;
      }
      if (this.focus) {
        // Room at the top for the Show all button and the home pin (it rises
        // above its point). With a home the school sits at the edge, so also
        // leave room below and beside it for its name.
        let padding = {top: 60, right: 16, bottom: 16, left: 16};
        if (this.home) padding = this.intakeView
            ? {top: 60, right: 32, bottom: 24, left: 32}
            : {top: 60, right: 56, bottom: 48, left: 56};
        map.fitBounds(bounds, padding);
        // Home right next to the school: stop at street level.
        window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          if (map.getZoom() > MAX_FOCUS_ZOOM) map.setZoom(MAX_FOCUS_ZOOM);
        });
      } else {
        map.fitBounds(bounds, 16);
        // Whole-area view: on narrow screens fitting every school lands at a
        // city-wide zoom. Stay at street-name scale, around home if we have one.
        window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          const min = map.getDiv().offsetWidth < 600 ? MIN_AREA_ZOOM_NARROW : MIN_AREA_ZOOM;
          if (map.getZoom() >= min) return;
          map.setZoom(min);
          if (this.home) map.setCenter(this.home);
        });
      }
    },
    isSelected(s) {
      return !!this.selected && this.selected.name === s.name;
    },
  },
};
</script>

<style scoped>
.map-wrap { position: relative; }
.map--fill { height: 100% !important; }
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
  width: 22px; height: 22px;
  padding: 4px;
  box-sizing: border-box;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, .35);
  transition: width .15s, height .15s, padding .15s;
}
.pin__label {
  position: absolute; left: 50%; top: 35px;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 11px; font-weight: 600; color: var(--ink);
  text-shadow: 0 0 3px #fff, 0 0 3px #fff, 0 0 3px #fff;
  line-height: 1.25;
  text-align: center;
}
.pin__tag {
  display: block;
  width: max-content;
  margin: 2px auto 0;
  padding: 1px 6px;
  border-radius: 999px;
  background: #DCFCE7;
  color: #14532D;
  font-size: 10px;
  font-weight: 700;
  text-shadow: none;
  box-shadow: 0 0 0 1px rgba(22, 101, 52, .25);
}
.pin--on .pin__dot { width: 30px; height: 30px; padding: 5px; }
.pin--on .pin__label { top: 39px; font-size: 13px; font-weight: 700; }
.home-pin { display: block; pointer-events: none; }
.map-actions {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 60px; /* clear of the full-screen control */
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  pointer-events: none;
}
.map-action {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: #fff;
  color: var(--ink);
  font: 600 13px var(--font);
  box-shadow: 0 1px 2px rgba(22, 24, 29, .16), 0 4px 12px rgba(22, 24, 29, .12);
  cursor: pointer;
}
.map-action:hover { background: var(--ground); }
.map-action[aria-pressed="true"] { color: var(--accent); }
</style>
