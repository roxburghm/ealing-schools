<template>
  <div class="home-picker">
    <div class="home-picker__top">
      <label for="home-search" class="home-picker__label">Where do you live?</label>
      <button v-if="hasHome" type="button" class="home-picker__clear" @click="clear">Clear</button>
    </div>
    <div class="home-picker__field">
      <svg class="home-picker__pin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/>
        <circle cx="12" cy="9" r="2.5"/>
      </svg>
      <vue-google-autocomplete v-if="mapsReady" ref="search" id="home-search" classname="home-picker__input"
                               :placeholder="hasHome ? 'Search for a different address' : 'Enter your postcode or street'" country="uk"
                               @placechanged="placeChanged" @no-results-found="noResult"/>
      <input v-else id="home-search" class="home-picker__input" placeholder="Loading address search…" disabled>
      <button type="button" class="home-picker__locate" aria-label="Use my current location"
              :disabled="locating" @click="useMyLocation">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
        </svg>
      </button>
    </div>
    <p v-if="error" class="home-picker__error" role="alert">{{ error }}</p>
    <div class="home-picker__presets">
      <span>Near</span>
      <button v-for="p in presets" :key="p.name" type="button"
              :class="['preset', {'preset--on': homeName === p.name}]" :aria-pressed="homeName === p.name"
              @click="$emit('set-home', {lat: p.lat, lng: p.lng}, p.name)">
        {{ p.name }}
      </button>
      <span>or click the map</span>
    </div>
  </div>
</template>

<script>
import VueGoogleAutocomplete from 'vue-google-autocomplete';

export default {
  name: 'HomePicker',
  components: {VueGoogleAutocomplete},
  props: {
    mapsReady: {type: Boolean, default: false},
    homeName: {type: String, default: ''},
    hasHome: {type: Boolean, default: false},
  },
  emits: ['set-home', 'clear-home'],
  data() {
    return {
      locating: false,
      error: '',
      presets: [
        {name: 'Ealing Broadway', lat: 51.5150, lng: -0.3017},
        {name: 'West Ealing', lat: 51.5130, lng: -0.3200},
        {name: 'Hanwell', lat: 51.5096, lng: -0.3384},
        {name: 'Acton', lat: 51.5070, lng: -0.2731},
        {name: 'Greenford', lat: 51.5423, lng: -0.3456},
        {name: 'Northolt', lat: 51.5480, lng: -0.3680},
        {name: 'Southall', lat: 51.5054, lng: -0.3780},
      ],
    };
  },
  methods: {
    noResult(place) {
      this.error = 'Pick an address from the suggestions list.';
    },
    placeChanged(address, place) {
      this.error = '';
      const name = (place && (place.name || place.formatted_address)) || address.postal_code || 'your home';
      this.$emit('set-home', {lat: address.latitude, lng: address.longitude}, name);
    },
    clear() {
      this.$refs.search?.clear();
      this.error = '';
      this.$emit('clear-home');
    },
    useMyLocation() {
      if (!navigator.geolocation) {
        this.error = 'Your browser can’t share its location. Type your postcode instead.';
        return;
      }
      this.locating = true;
      this.error = '';
      navigator.geolocation.getCurrentPosition(pos => {
        this.locating = false;
        this.$emit('set-home', {lat: pos.coords.latitude, lng: pos.coords.longitude}, 'your location');
      }, () => {
        this.locating = false;
        this.error = 'Couldn’t get your location. Type your postcode instead.';
      });
    },
  },
};
</script>

<style>
/* not scoped: the autocomplete component renders its own <input> */
.home-picker { display: flex; flex-direction: column; gap: 10px; }
.home-picker__top { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.home-picker__clear {
  min-height: 32px; padding: 0 8px; border: 0; border-radius: 8px;
  background: transparent; color: var(--accent); font: 600 13px var(--font); cursor: pointer;
}
.home-picker__clear:hover { background: #F0F2F5; }
.home-picker__label { font-family: var(--font-display); font-size: 18px; font-weight: 600; }
.home-picker__field { position: relative; }
.home-picker__pin { position: absolute; left: 14px; top: 14px; color: var(--ink-3); pointer-events: none; }
.home-picker__input {
  width: 100%;
  height: 48px;
  box-sizing: border-box;
  border: 1px solid #D5D9E0;
  border-radius: 12px;
  padding: 0 52px 0 44px;
  font: 15px var(--font);
  background: #fff;
  box-shadow: 0 1px 2px rgba(22, 24, 29, .04);
  color: var(--ink);
}
.home-picker__input:focus { outline: 2px solid var(--accent); outline-offset: -1px; border-color: transparent; }
.home-picker__locate {
  position: absolute; right: 2px; top: 2px;
  width: 44px; height: 44px;
  border: 0; border-radius: 10px;
  background: transparent; color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.home-picker__locate:hover { background: #F0F2F5; }
.home-picker__locate:disabled { opacity: .5; cursor: progress; }
.home-picker__error { margin: 0; font-size: 13px; color: #8A3A00; }
.home-picker__presets { display: flex; flex-wrap: wrap; align-items: center; column-gap: 2px; font-size: 13px; color: var(--ink-3); }
.home-picker__presets > span:first-child { margin-right: 4px; }
.home-picker__presets > span:last-child { margin-left: 4px; }
.preset {
  min-height: 36px; padding: 0 6px;
  border: 0; background: transparent; cursor: pointer;
  font: 500 13px var(--font); color: var(--ink-2);
  text-decoration: underline; text-decoration-color: var(--line-strong); text-underline-offset: 4px;
}
.preset--on { color: var(--accent); font-weight: 700; text-decoration-color: var(--accent); text-decoration-thickness: 2px; }

.pac-container { z-index: 2000; font-family: var(--font); border-radius: 0 0 10px 10px; box-shadow: 0 6px 16px rgba(0, 0, 0, .12); border-top: none; }
.pac-item { padding: 8px; cursor: pointer; }
.pac-item:hover { background-color: var(--ground); }
</style>
