<template>
  <v-card rounded="xl" class="help">
    <header class="help-head">
      <h2>How it works</h2>
      <button type="button" class="icon-btn" aria-label="Close" @click="$emit('close')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25"
             stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </header>

    <div class="help-body">
      <section>
        <h3>What the rings mean</h3>
        <p>
          Each ring shows the furthest distance from the school that a place was offered on distance, on national
          offer day in the year you pick. If your home was inside the ring, distance alone would have got you a place
          that year. Siblings and looked-after children are offered places first, so the ring moves from year to year.
        </p>
        <ul class="symbols">
          <li><i><school-icon kind="distance"/></i>Places given by straight-line distance</li>
          <li><i><school-icon kind="walk"/></i>Places given by walking distance</li>
          <li><i><school-icon kind="open"/></i>Everyone who applied got a place, so there's no ring</li>
          <li><i><school-icon kind="none"/></i>No places were given on distance that year</li>
        </ul>
      </section>

      <section>
        <h3>How your chances are worked out</h3>
        <p>We count how many years since 2019 your home was inside each school's ring.</p>
        <dl class="verdicts">
          <div><dt><span class="pill pill--likely">Very likely</span></dt><dd>Inside every year</dd></div>
          <div><dt><span class="pill pill--possible">Possible</span></dt><dd>Inside at least half the years</dd></div>
          <div><dt><span class="pill pill--unlikely">Unlikely</span></dt><dd>Inside in fewer than half</dd></div>
          <div><dt><span class="pill pill--outside">Outside</span></dt><dd>Never inside</dd></div>
        </dl>
        <p class="aside">
          Years when everyone got a place count as inside. A home within about 50 metres of the ring is too close to
          call and counts as half.
        </p>
      </section>

      <section>
        <h3>How distance is measured</h3>
        <p>
          Most schools use a straight line from your home to the school. Drayton Manor uses walking distance, so we
          ask Google Maps how far your walk is. The council measures from its own address points, so our figures can
          differ slightly from theirs.
        </p>
      </section>

      <section>
        <h3>Schools with extra rules</h3>
        <p>
          Faith schools, specialist places and priority for children whose nearest school it is all change who the
          ring applies to. These schools have a note in their details: read it before relying on the ring.
        </p>
      </section>

      <section>
        <h3>Ofsted grades</h3>
        <p>
          Ofsted stopped giving one overall grade in September 2024, and since November 2025 its report cards grade
          each area separately. We show the last overall grade with its date, or a summary of the report card with
          every area listed in the school's details.
        </p>
      </section>

      <section>
        <h3>Sources</h3>
        <p>Cut-off distances come from Ealing Council. Each year's figures are in:</p>
        <ul class="sources">
          <li v-for="row in sources" :key="row.year">
            <span class="sources__year">{{ row.year }}</span>
            <span class="sources__links">
              <a v-for="doc in row.docs" :key="doc.href" :href="doc.href" target="_blank" rel="noopener">{{ doc.title }}</a>
            </span>
          </li>
        </ul>
        <p class="aside">
          GCSE results from the Department for Education, Ofsted grades from reports.ofsted.gov.uk, and walking
          distances from Google Maps. Walking areas on the map ©
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>.
        </p>
      </section>

      <section>
        <h3>Your privacy</h3>
        <p>
          Your address is saved only in this browser. Google sees what you type in the address box, and the location
          you choose, to suggest addresses and work out walking distances. Nothing is sent anywhere else.
        </p>
      </section>

      <footer class="help-foot">
        These figures are estimates to help you plan. Ealing Council makes all admissions decisions.
        Questions or corrections: <a href="mailto:matt@roxburghm.com">matt@roxburghm.com</a>
      </footer>
    </div>
  </v-card>
</template>

<script>
import SchoolIcon from '@/components/SchoolIcon.vue';

const offers = year => ({title: 'Offers report', href: `/Documents/High_school_on_time_offers_${year}.pdf`});
const booklet = (year, title = `Starting High School ${year}`) => ({title, href: `/Documents/Starting_High_School_${year}.pdf`});

export default {
  name: 'Help',
  components: {SchoolIcon},
  emits: ['close'],
  data() {
    return {
      // Each "Starting High School" booklet prints the previous year's figures.
      sources: [
        {year: '2026', docs: [offers(2026), booklet(2027)]},
        {year: '2025', docs: [offers(2025), booklet(2026)]},
        {year: '2024', docs: [offers(2024), booklet(2025)]},
        {year: '2023', docs: [booklet(2024)]},
        {year: '2022', docs: [{title: 'Offers report', href: '/Documents/Other/High_School_ontime_offers_2022.pdf'}, booklet(2023)]},
        {year: '2021', docs: [booklet(2022)]},
        {year: '2020', docs: [booklet(2021)]},
        {year: '2019', docs: [booklet(2020)]},
      ],
    };
  },
};
</script>

<style scoped>
.help {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  font-family: var(--font);
  color: var(--ink);
}

.help-head {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 12px 10px 28px;
  border-bottom: 1px solid var(--line);
}
.help-head h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.help-body {
  overflow-y: auto;
  padding: 8px 28px 28px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--ink-2);
}

section { max-width: 64ch; margin-top: 24px; }
h3 {
  margin: 0 0 6px;
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  color: var(--ink);
}
p { margin: 0; }
p + p, p + .sources, .sources + p, dl + p, ul + p { margin-top: 10px; }
.aside { font-size: 13.5px; color: var(--ink-3); }

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; text-underline-offset: 3px; }

.symbols { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 8px; }
.symbols li { display: flex; align-items: center; gap: 10px; font-size: 14px; }
.symbols i {
  flex: none;
  width: 22px; height: 22px;
  padding: 4px;
  box-sizing: border-box;
  border-radius: 50%;
  background: var(--ink-2);
  color: #fff;
}

.verdicts { margin: 10px 0 0; display: grid; gap: 6px; }
.verdicts div { display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 12px; }
.verdicts dt, .verdicts dd { margin: 0; }
.verdicts dd { font-size: 14px; }
.pill--outside { background: #F1F2F4; color: #3A3F48; }

.sources { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line); }
.sources li {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 12px;
  padding: 7px 0;
  border-bottom: 1px solid var(--line);
  font-size: 14px;
}
.sources__year { font-weight: 600; color: var(--ink); }
.sources__links { display: flex; flex-wrap: wrap; gap: 4px 18px; }

.help-foot {
  margin-top: 28px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
  font-size: 13.5px;
  color: var(--ink-3);
}

@media (max-width: 600px) {
  .help-head { padding-left: 16px; }
  .help-body { padding: 4px 16px 24px; }
  .verdicts div { grid-template-columns: 104px 1fr; }
}
</style>
