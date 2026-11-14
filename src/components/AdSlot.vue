<template>
  <aside v-if="advert" :class="['advert', `advert--${space}`]" aria-label="Advertisement"
         @mouseenter="hovered = true" @mouseleave="hovered = false" @focusin="hovered = true" @focusout="hovered = false">
    <span class="advert__label">Advert</span>
    <a class="advert__link" :href="advert.href" target="_blank" rel="noopener sponsored"
       :style="{aspectRatio: `${advert.width} / ${advert.height}`}">
      <transition name="advert-fade">
        <img :key="advert.src" :src="advert.src" :width="advert.width" :height="advert.height" :alt="advert.alt"
             decoding="async">
      </transition>
    </a>
  </aside>
</template>

<script>
// One advert space. What fills it is set in src/data/adverts.js: with several adverts
// it starts on a random one and moves through the rest in a shuffled order; with none,
// nothing is drawn and no room is taken.
import adverts from '@/data/adverts';

const EVERY = 12000; // ms each advert stays up

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
    };
  },
  computed: {
    advert() {
      return this.order[this.at] || null;
    },
  },
  mounted() {
    if (this.order.length < 2) return;
    this.preloadNext();
    this.timer = setInterval(() => {
      if (this.hovered || document.hidden) return;
      this.at = (this.at + 1) % this.order.length;
      this.preloadNext();
    }, EVERY);
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
  methods: {
    // Fetch the next picture ahead of its turn, so the change is never to a blank box
    preloadNext() {
      new Image().src = this.order[(this.at + 1) % this.order.length].src;
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
/* The link holds the advert's shape, so nothing moves before a picture arrives or while two cross over */
.advert__link {
  position: relative;
  display: block;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 0 1px var(--line);
  transition: box-shadow .15s;
}
.advert__link:hover { box-shadow: 0 0 0 1px var(--line-strong), 0 2px 8px rgba(22, 24, 29, .08); }
.advert__link img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
/* On a tablet the phone list is wide: keep the advert near the size it was drawn for */
.advert--mobile { width: 100%; max-width: 420px; margin: 4px auto; }

.advert-fade-enter-active, .advert-fade-leave-active { transition: opacity .5s; }
.advert-fade-enter-from, .advert-fade-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .advert-fade-enter-active, .advert-fade-leave-active { transition: none; }
}
</style>
