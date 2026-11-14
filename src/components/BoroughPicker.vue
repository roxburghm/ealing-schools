<template>
  <main class="picker">
    <header class="picker__head">
      <span class="picker__mark" aria-hidden="true"><school-icon kind="cap"/></span>
      <h1>Secondary school places</h1>
      <p>How close did you need to live to get a place? See each school's cut-off distance for every year since 2019,
        and your chances from your own address.</p>
    </header>

    <h2 class="picker__ask">Choose a borough</h2>
    <ul class="picker__grid">
      <li v-for="card in cards" :key="card.id">
        <button type="button" :class="['card', {'card--all': card.all}]" @click="$emit('pick', card.ids)">
          <svg class="card__map" :viewBox="card.viewBox" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <path v-for="piece in card.pieces" :key="piece.id" :d="piece.d" class="card__shape"/>
            <circle v-for="dot in card.dots" :key="dot.name" :cx="dot.x" :cy="dot.y" :r="card.all ? 3 : 4.5"
                    :fill="dot.colour" class="card__dot"/>
          </svg>
          <span class="card__text">
            <span class="card__name">{{ card.name }}</span>
            <span class="card__meta">{{ card.count }} schools · {{ card.years }}</span>
            <span class="card__council">{{ card.source }}</span>
          </span>
          <svg class="card__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </button>
      </li>
    </ul>

    <p class="picker__foot">
      Figures are estimates worked out from the councils' published offers, to help you plan. The councils and schools
      make the admissions decisions. Borough outlines: ONS, Open Government Licence.
    </p>
  </main>
</template>

<script>
// The first screen: one card per borough, each drawn as its outline with its
// schools as dots in their map colours, then one card with every borough
// fitted together for seeing all the schools at once.
import SchoolIcon from '@/components/SchoolIcon.vue';
import outlines from '@/data/outlines';
import {YEARS} from '@/plugins/assess';

const SIZE = 200; // each map is scaled so its longer side is this many viewBox units
const PAD = 8;

// Draws one or more borough outlines in a shared flat projection (squashed
// east–west by the latitude so shapes look right), with schools as dots.
// With `gap`, each piece shrinks slightly and moves that many units out from the
// middle of the group, so several boroughs read as a jigsaw pulled apart.
function drawMap(rings, schools, gap = 0) {
  const points = rings.flatMap(r => r.ring);
  const lat0 = points.length ? points.reduce((t, p) => t + p[1], 0) / points.length : 51.5;
  const k = Math.cos(lat0 * Math.PI / 180);
  const xs = points.map(p => p[0] * k);
  const ys = points.map(p => -p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const scale = SIZE / (Math.max(maxX - minX, maxY - minY) || 1);
  const project = (lng, lat) => [(lng * k - minX) * scale, (-lat - minY) * scale];

  // Each piece shrinks a little about its own centre (so seams open even for
  // the piece in the middle) and moves outward from the middle of the group.
  const midX = (maxX - minX) * scale / 2, midY = (maxY - minY) * scale / 2;
  const moves = {};
  for (const r of rings) {
    if (!gap || !r.ring.length) continue;
    const pts = r.ring.map(([lng, lat]) => project(lng, lat));
    const cx = pts.reduce((t, p) => t + p[0], 0) / pts.length;
    const cy = pts.reduce((t, p) => t + p[1], 0) / pts.length;
    const len = Math.hypot(cx - midX, cy - midY) || 1;
    moves[r.id] = {cx, cy, dx: (cx - midX) / len * gap, dy: (cy - midY) / len * gap};
  }
  const SHRINK = 0.9;
  const place = (id, lng, lat) => {
    const [x, y] = project(lng, lat);
    const m = moves[id];
    if (!m) return [x, y];
    return [m.cx + (x - m.cx) * SHRINK + m.dx, m.cy + (y - m.cy) * SHRINK + m.dy];
  };

  const pieces = rings.filter(r => r.ring.length).map(r => ({id: r.id, pts: r.ring.map(([lng, lat]) => place(r.id, lng, lat))}));
  const all = pieces.flatMap(p => p.pts);
  const left = Math.min(...all.map(p => p[0])), right = Math.max(...all.map(p => p[0]));
  const top = Math.min(...all.map(p => p[1])), bottom = Math.max(...all.map(p => p[1]));
  return {
    viewBox: `${left - PAD} ${top - PAD} ${right - left + PAD * 2} ${bottom - top + PAD * 2}`,
    pieces: pieces.map(p => ({id: p.id, d: 'M' + p.pts.map(pt => pt.map(n => n.toFixed(1)).join(' ')).join('L') + 'Z'})),
    dots: schools.map(s => {
      const [x, y] = place(s.borough, s.centre.lng, s.centre.lat);
      return {name: s.name, x: x.toFixed(1), y: y.toFixed(1), colour: s.colour};
    }),
  };
}

function yearRange(schools) {
  const years = YEARS.filter(y => schools.some(s => y in s.intakeDist));
  return years.length ? `${years[0]}–${years[years.length - 1]}` : 'no figures yet';
}

export default {
  name: 'BoroughPicker',
  components: {SchoolIcon},
  props: {
    boroughs: {type: Array, required: true},
    schools: {type: Array, required: true},
  },
  emits: ['pick'],
  computed: {
    cards() {
      const cards = this.boroughs.map(b => {
        const schools = this.schools.filter(s => s.borough === b.id);
        return {
          id: b.id,
          ids: [b.id],
          name: b.name,
          source: `Figures from ${b.council}`,
          count: schools.length,
          years: yearRange(schools),
          ...drawMap([{id: b.id, ring: outlines[b.id] || []}], schools),
        };
      });
      if (this.boroughs.length < 2) return cards;
      return [...cards, {
        id: 'all',
        all: true,
        ids: this.boroughs.map(b => b.id),
        name: 'All boroughs',
        source: `Figures from all ${this.boroughs.length} councils`,
        count: this.schools.length,
        years: yearRange(this.schools),
        ...drawMap(this.boroughs.map(b => ({id: b.id, ring: outlines[b.id] || []})), this.schools, 8),
      }];
    },
  },
};
</script>

<style scoped>
.picker {
  width: 100%;
  box-sizing: border-box;
  max-width: 1040px;
  margin: 0 auto;
  padding: 56px 24px 40px;
  font-family: var(--font);
  color: var(--ink);
}

.picker__head { max-width: 620px; }
.picker__mark {
  display: block;
  width: 44px;
  height: 44px;
  padding: 9px;
  box-sizing: border-box;
  border-radius: 12px;
  background: var(--accent);
  color: #fff;
}
.picker__head h1 {
  margin: 20px 0 0;
  font-family: var(--font-display);
  font-size: clamp(30px, 5vw, 44px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.05;
}
.picker__head p { margin: 14px 0 0; font-size: 17px; line-height: 1.55; color: var(--ink-2); }

.picker__ask {
  margin: 44px 0 14px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-3);
}

.picker__grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.card {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto 1fr;
  gap: 16px 12px;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: #fff;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color .15s, box-shadow .15s, transform .15s;
}
.card:hover { border-color: var(--accent); box-shadow: 0 6px 20px rgba(22, 24, 29, .08); }
.card:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.card:active { transform: translateY(1px); }

.card__map { grid-column: 1 / -1; width: 100%; height: 170px; }
.card__shape { fill: #EEF1F5; stroke: var(--line-strong); stroke-width: 1.25; stroke-linejoin: round; }
.card:hover .card__shape { fill: #E6EEFE; stroke: #9DB5EE; }
.card__dot { stroke: #fff; stroke-width: 1.5; }

/* The jigsaw: every borough as its own piece, pulled slightly apart */
.card--all .card__shape { fill: #E3E8EF; stroke: var(--line-strong); stroke-width: 1; }
.card--all:hover .card__shape { fill: #DCE6FB; stroke: #9DB5EE; }
.card--all .card__dot { stroke-width: 1; }

.card__text { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.card__name { font-family: var(--font-display); font-size: 22px; font-weight: 700; letter-spacing: -0.01em; }
.card__meta { font-size: 14px; font-weight: 500; color: var(--ink-2); }
.card__council { font-size: 13px; color: var(--ink-3); }
.card__arrow { align-self: end; color: var(--ink-3); transition: color .15s, transform .15s; }
.card:hover .card__arrow { color: var(--accent); transform: translateX(3px); }

.picker__foot { margin: 40px 0 0; max-width: 620px; font-size: 13px; line-height: 1.5; color: var(--ink-3); }

/* Phones: outline beside the text, so every borough fits on one screen */
@media (max-width: 600px) {
  .picker { padding: 28px 16px 32px; }
  .picker__head h1 { margin-top: 16px; }
  .picker__head p { font-size: 16px; }
  .picker__ask { margin-top: 28px; }
  .picker__grid { gap: 12px; }
  .card {
    grid-template-columns: 96px 1fr auto;
    grid-template-rows: auto;
    align-items: center;
    gap: 14px;
    padding: 14px;
  }
  .card__map { grid-column: auto; height: 80px; }
  .card__dot { r: 7px; stroke-width: 2; } /* the outline is drawn much smaller here */
  .card--all .card__dot { r: 4px; stroke-width: 1; }
  .card__arrow { align-self: center; }
  .card__name { font-size: 19px; }
}

@media (prefers-reduced-motion: reduce) {
  .card, .card__arrow { transition: none; }
}
</style>
