<template>
  <aside v-if="advert" :class="['advert', `advert--${space}`]" aria-label="Advertisement">
    <span class="advert__label">Advert</span>
    <a class="advert__link" :href="advert.href" target="_blank" rel="noopener sponsored">
      <img :src="advert.src" :width="advert.width" :height="advert.height" :alt="advert.alt" decoding="async">
    </a>
  </aside>
</template>

<script>
// One advert space. What fills it is set in src/data/adverts.js; with nothing set
// for the space, nothing is drawn and no room is taken.
import adverts from '@/data/adverts';

export default {
  name: 'AdSlot',
  props: {
    // 'desktop' or 'mobile': which space this is
    space: {type: String, required: true},
  },
  computed: {
    advert() {
      return adverts[this.space] || null;
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
.advert__link {
  display: block;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 0 1px var(--line);
  transition: box-shadow .15s;
}
.advert__link:hover { box-shadow: 0 0 0 1px var(--line-strong), 0 2px 8px rgba(22, 24, 29, .08); }
/* width and height on the picture give the box its shape before the picture arrives */
.advert__link img { display: block; width: 100%; height: auto; }
/* On a tablet the phone list is wide: keep the advert near the size it was drawn for */
.advert--mobile { width: 100%; max-width: 420px; margin: 4px auto; }
</style>
