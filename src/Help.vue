<template>
  <v-card rounded="xl" class="help">
    <header class="help-head">
      <h2>About this data</h2>
      <v-btn icon="mdi-close" variant="text" aria-label="Close" @click="$emit('close')"/>
    </header>

    <v-card-text class="help-body">
      <section>
        <h3>What the map shows</h3>
        <p>
          Each ring shows how far from the school the last child offered a place on distance lived,
          on national offer day for the year you pick. If you lived inside it that year, distance alone would
          have got you a place. Children in higher priority groups, such as looked-after children and siblings,
          are offered places first, so the cut-off moves from year to year.
        </p>
        <ul>
          <li><strong>All offered:</strong> the school had room for every applicant that year, so there's no ring.</li>
          <li><strong>Faith and specialist places</strong> follow their own rules. Check the admission rules linked from each school.</li>
        </ul>
      </section>

      <section>
        <h3>Your chances</h3>
        <p>
          Each school is ranked by how many of the years since 2019 your home fell inside its cut-off.
          <em>Very likely</em> means every year, <em>Possible</em> at least half, <em>Unlikely</em> fewer than half,
          and <em>Outside</em> none. Years when everyone got a place count as inside, and years too close to call
          count as half. Past cut-offs are a guide, not a promise.
        </p>
      </section>

      <section>
        <h3>How distance is measured</h3>
        <p>
          Most Ealing schools measure in a straight line from your home to the school. Drayton Manor measures
          walking distance along pavements, so its area follows the street network rather than a circle.
        </p>
        <p>
          Walking distances are worked out in advance from OpenStreetMap data using GraphHopper, then looked up on your
          device. They're estimates: the council uses its own address points and routes. Results near the line are
          marked <em>too close to call</em>.
        </p>
      </section>

      <section>
        <h3>Ofsted grades</h3>
        <p>
          Ofsted stopped giving schools one overall grade in September 2024. Since November 2025, inspections produce a
          report card that grades each area separately, from <em>exceptional</em> to <em>urgent improvement</em>. For
          older inspections we show the overall grade and its date. For report cards we summarise the area grades
          and list them in the school's details.
        </p>
      </section>

      <section>
        <h3>Sources</h3>
        <ul class="sources">
          <li v-for="doc in documents" :key="doc.href">
            <a :href="doc.href" target="_blank" rel="noopener">
              <v-icon size="18">mdi-file-pdf-box</v-icon>{{ doc.title }}
            </a>
          </li>
        </ul>
        <p class="small">
          Exam results from the Department for Education. Ofsted grades from reports.ofsted.gov.uk.
          Walking routes © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>,
          calculated with <a href="https://www.graphhopper.com/" target="_blank" rel="noopener">GraphHopper</a>.
        </p>
      </section>

      <section>
        <h3>Privacy</h3>
        <p>
          Your address is saved only in this browser so it's there next time. Google sees what you type in the address
          box to suggest matches. Nothing else is sent anywhere.
        </p>
      </section>

      <p class="disclaimer">
        Figures are approximate and for guidance only. Problems or corrections:
        <a href="mailto:matt@roxburghm.com">matt@roxburghm.com</a>
      </p>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'Help',
  emits: ['close'],
  data() {
    return {
      documents: [
        {title: 'High school on-time offers 2025', href: '/Documents/High_school_on_time_offers_2025.pdf'},
        {title: 'Starting High School 2025 (2024 figures)', href: '/Documents/Starting_High_School_2025.pdf'},
        {title: 'Starting High School 2024 (2023 figures)', href: '/Documents/Starting_High_School_2024.pdf'},
        {title: 'Starting High School 2023 (2022 figures)', href: '/Documents/Starting_High_School_2023.pdf'},
        {title: 'Starting High School 2022 (2021 figures)', href: '/Documents/Starting_High_School_2022.pdf'},
        {title: 'Starting High School 2021 (2020 figures)', href: '/Documents/Starting_High_School_2021.pdf'},
        {title: 'Starting High School 2020 (2019 figures)', href: '/Documents/Starting_High_School_2020.pdf'},
      ],
    }
  },
}
</script>

<style scoped>
.help {
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.help-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 12px 8px 28px;
}

.help-head h2 {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.help-body {
  padding: 4px 28px 28px !important;
  font-size: 15px !important;
  line-height: 1.6 !important;
  color: rgba(var(--v-theme-on-surface), 0.82) !important;
}

section {
  max-width: 68ch;
}

section + section {
  margin-top: 28px;
}

h3 {
  font-size: 15px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 6px;
}

p + p {
  margin-top: 10px;
}

ul {
  margin-top: 10px;
  padding-left: 20px;
}

li + li {
  margin-top: 6px;
}

.sources {
  list-style: none;
  padding-left: 0;
}

.sources li + li {
  margin-top: 2px;
}

a {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.sources a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.small {
  margin-top: 12px;
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.65);
}

.disclaimer {
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.65);
}

@media (max-width: 600px) {
  .help-head {
    padding-left: 16px;
  }

  .help-body {
    padding: 4px 16px 24px !important;
  }
}
</style>
