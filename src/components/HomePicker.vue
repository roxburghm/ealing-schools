<template>
  <div class="home-picker" :class="{'home-picker--compact': compact}">
    <label v-if="!compact" for="home-search" class="home-picker__label">Where do you live?</label>

    <!-- Once a home is set, show it as a chip: change it, or remove it with the × -->
    <div v-if="hasHome && !editing" class="home-chip">
      <button type="button" class="home-chip__main" :aria-label="`Change address: ${homeName}`" @click="startEditing">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
        <span class="home-chip__name">{{ homeName }}</span>
        <span class="home-chip__action">Change</span>
      </button>
      <button type="button" class="home-chip__remove" aria-label="Remove address" v-tooltip:bottom="'Remove address'"
              @click="clear">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25"
             stroke-linecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18"/>
        </svg>
      </button>
    </div>

    <div v-else class="home-picker__field">
      <svg class="home-picker__pin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/>
        <circle cx="12" cy="9" r="2.5"/>
      </svg>
      <label v-if="compact" for="home-search" class="visually-hidden">Your home address</label>
      <vue-google-autocomplete v-if="mapsReady" ref="search" id="home-search" classname="home-picker__input"
                               :placeholder="hasHome ? 'Search for a different address' : 'Enter your postcode or street'"
                               country="uk" types="geocode"
                               @placechanged="placeChanged" @no-results-found="noResult" @keyup="onKeyup"/>
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

    <div v-if="hasHome && editing" class="home-picker__actions">
      <button type="button" class="home-picker__clear" @click="editing = false">Keep {{ homeName }}</button>
    </div>

    <p v-if="error" class="home-picker__error" role="alert">{{ error }}</p>
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
    // {north, south, east, west}: suggestions inside this box are preferred, not required.
    searchArea: {type: Object, default: null},
    // Phones: no heading or hint, and a set address collapses to a chip.
    compact: {type: Boolean, default: false},
  },
  emits: ['set-home', 'clear-home'],
  data() {
    return {
      locating: false,
      error: '',
      editing: false,
    };
  },
  computed: {
    // The search box is rebuilt each time it appears (no home yet, or Change).
    searchShown() {
      return this.mapsReady && (!this.hasHome || this.editing);
    },
  },
  watch: {
    searchShown: {
      immediate: true,
      handler(shown) {
        if (shown) this.$nextTick(this.biasToArea);
      },
    },
  },
  methods: {
    biasToArea() {
      const autocomplete = this.$refs.search?.autocomplete;
      if (autocomplete && this.searchArea) {
        autocomplete.setOptions({bounds: this.searchArea, strictBounds: false});
      }
    },
    startEditing() {
      this.editing = true;
      this.$nextTick(() => this.$refs.search?.focus());
    },
    onKeyup(event) {
      if (event.key === 'Escape' && this.hasHome) this.editing = false;
    },
    noResult() {
      this.error = 'Pick an address from the suggestions list.';
    },
    placeChanged(address, place) {
      this.error = '';
      this.editing = false;
      const name = (place && (place.name || place.formatted_address)) || address.postal_code || 'your home';
      this.$emit('set-home', {lat: address.latitude, lng: address.longitude}, name);
      this.$refs.search?.clear();
    },
    clear() {
      this.$refs.search?.clear();
      this.error = '';
      this.editing = false;
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
        this.editing = false;
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
.home-picker--compact { gap: 6px; }
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
  font: 16px var(--font); /* 16px stops iOS zooming in on focus */
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
.home-picker__actions { display: flex; justify-content: flex-end; }
.home-picker__error { margin: 0; font-size: 13px; color: #8A3A00; }

.home-chip {
  display: flex;
  align-items: stretch;
  min-height: 48px;
  border: 1px solid #D5D9E0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(22, 24, 29, .04);
  overflow: hidden;
}
.home-chip__main {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px 0 14px;
  border: 0;
  background: transparent;
  color: var(--ink);
  font: 500 15px var(--font);
  text-align: left;
  cursor: pointer;
}
.home-chip__main:hover { background: #F7F8FA; }
.home-chip__main svg { flex: none; color: var(--home); }
.home-chip__name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.home-chip__action { flex: none; font-size: 13px; font-weight: 600; color: var(--accent); }
.home-chip__remove {
  flex: none;
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-left: 1px solid var(--line);
  background: transparent;
  color: var(--ink-2);
  cursor: pointer;
}
.home-chip__remove:hover { background: #FDECEC; color: #8B1C1C; }

.pac-container { z-index: 3000; font-family: var(--font); border-radius: 0 0 10px 10px; box-shadow: 0 6px 16px rgba(0, 0, 0, .12); border-top: none; }
.pac-item { padding: 8px; cursor: pointer; }
.pac-item:hover { background-color: var(--ground); }
</style>
