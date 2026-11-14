<template>
  <aside v-if="advert" :class="['advert', `advert--${space}`]" aria-label="Advertisement"
         @mouseenter="hovered = true" @mouseleave="hovered = false" @focusin="hovered = true" @focusout="hovered = false">
    <span class="advert__label">Advert</span>
    <a ref="link" class="advert__link" :href="advert.href" target="_blank" rel="noopener sponsored"
       :style="{aspectRatio: `${advert.width} / ${advert.height}`}">
      <transition name="advert-fade">
        <video v-if="filmed" ref="film" :key="advert.film" :src="advert.film" :width="advert.width"
               :height="advert.height" :aria-label="advert.alt" muted playsinline preload="auto"
               disablepictureinpicture></video>
        <img v-else :key="advert.src" :src="advert.src" :width="advert.width" :height="advert.height"
             :alt="advert.alt" decoding="async">
      </transition>
    </a>
  </aside>
</template>

<script>
// One advert space. What fills it is set in src/adverts/adverts.js: with several adverts
// it starts on a random one and moves through the rest in a shuffled order; with none,
// nothing is drawn and no room is taken.
//
// An advert with a film plays it once each time it comes up, and the film rests on its
// last frame (the same as the picture). Nothing plays or moves on while the space is
// off screen, so the film starts when someone can see it.
import adverts from '@/adverts/adverts';

const EVERY = 12000; // ms each advert stays up, its film included

function shuffled(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default {
  name: 'AdSlot',
  props: {
    // 'desktop' or 'mobile': which space this is
    space: {type: String, required: true},
  },
  data() {
    return {
      order: shuffled(adverts[this.space] || []),
      at: 0,
      // Pointer or keyboard focus is on the advert: hold it still so it can't change under a click
      hovered: false,
      // Enough of the space is on screen to be looked at
      seen: false,
      // Films are off for someone who asked for less motion, and once a film has refused to play
      still: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    };
  },
  computed: {
    advert() {
      return this.order[this.at] || null;
    },
    filmed() {
      return !!(this.advert && this.advert.film) && !this.still;
    },
  },
  watch: {
    advert() {
      this.$nextTick(this.roll);
    },
    seen(now) {
      if (now) this.roll();
      else clearTimeout(this.timer);
    },
  },
  mounted() {
    if (!this.advert) return;
    this.watcher = new IntersectionObserver(([entry]) => {
      this.seen = entry.isIntersecting;
    }, {threshold: 0.6});
    this.watcher.observe(this.$refs.link);
  },
  beforeUnmount() {
    clearTimeout(this.timer);
    if (this.watcher) this.watcher.disconnect();
  },
  methods: {
    // The current advert has come into view, or has just come up: play its film from
    // the start and line up the next advert.
    roll() {
      if (!this.seen) return;
      const film = this.$refs.film;
      if (film) {
        film.muted = true; // as a property too: browsers only start a film unasked when it is silent
        film.currentTime = 0;
        const playing = film.play();
        // Refused (a phone saving power, say): show the pictures instead from here on
        if (playing) playing.catch(e => { if (e.name === 'NotAllowedError') this.still = true; });
      }
      clearTimeout(this.timer);
      if (this.order.length > 1) {
        this.preloadNext();
        this.timer = setTimeout(this.next, EVERY);
      }
    },
    next() {
      // Being pointed at, or the tab is in the background: look again shortly
      if (this.hovered || document.hidden) {
        this.timer = setTimeout(this.next, 1000);
        return;
      }
      this.at = (this.at + 1) % this.order.length;
    },
    // Fetch the next picture ahead of its turn, so the change is never to a blank box
    preloadNext() {
      const next = this.order[(this.at + 1) % this.order.length];
      if (!this.filmed) new Image().src = next.src;
    },
  },
};
</script>

<style scoped>
.advert { display: flex; flex-direction: column; gap: 4px; }
.advert__label {
  font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase;
  color: var(--ink-3); padding: 0 2px;
}
/* The link holds the advert's shape, so nothing moves before a picture arrives or while two cross over.
   Its colour is the adverts' own background: a film that has yet to load looks like its empty first frame. */
.advert__link {
  position: relative;
  display: block;
  border-radius: 12px;
  overflow: hidden;
  background: #FBF8F3;
  box-shadow: 0 0 0 1px var(--line);
  transition: box-shadow .15s;
}
.advert__link:hover { box-shadow: 0 0 0 1px var(--line-strong), 0 2px 8px rgba(22, 24, 29, .08); }
.advert__link img, .advert__link video { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
/* On a tablet the phone list is wide: keep the advert near the size it was drawn for */
.advert--mobile { width: 100%; max-width: 420px; margin: 4px auto; }

.advert-fade-enter-active, .advert-fade-leave-active { transition: opacity .5s; }
.advert-fade-enter-from, .advert-fade-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .advert-fade-enter-active, .advert-fade-leave-active { transition: none; }
}
</style>
