# Data sources

Where each figure in `src/data/` comes from. Checked November 2026.

## Ealing admission distances (`src/data/ealing.js`, `intakeDist`)

Each "Starting High School" booklet prints the **previous** year's furthest distance offered,
so the booklet for year N gives the distances for September N−1.

| Offer year | Source | Copy in this repo |
|---|---|---|
| 2019 | Starting High School 2020 booklet | [`public/Documents/Starting_High_School_2020.pdf`](public/Documents/Starting_High_School_2020.pdf) |
| 2020 | Starting High School 2021 booklet | [`public/Documents/Starting_High_School_2021.pdf`](public/Documents/Starting_High_School_2021.pdf) |
| 2021 | Starting High School 2022 booklet | [`public/Documents/Starting_High_School_2022.pdf`](public/Documents/Starting_High_School_2022.pdf) |
| 2022 | Starting High School 2023 booklet, and the 2022 on-time offers | [`public/Documents/Starting_High_School_2023.pdf`](public/Documents/Starting_High_School_2023.pdf), [`public/Documents/Other/High_School_ontime_offers_2022.pdf`](public/Documents/Other/High_School_ontime_offers_2022.pdf) |
| 2023 | Starting High School 2024 booklet | [`public/Documents/Starting_High_School_2024.pdf`](public/Documents/Starting_High_School_2024.pdf) |
| 2024 | High school on-time offers 2024 (offers made 1 March 2024), and the Starting High School 2025 booklet | [`public/Documents/High_school_on_time_offers_2024.pdf`](public/Documents/High_school_on_time_offers_2024.pdf), [`public/Documents/Starting_High_School_2025.pdf`](public/Documents/Starting_High_School_2025.pdf) |
| 2025 | High school on-time offers 2025, and the Starting High School 2026 booklet | [`public/Documents/High_school_on_time_offers_2025.pdf`](public/Documents/High_school_on_time_offers_2025.pdf), [`public/Documents/Starting_High_School_2026.pdf`](public/Documents/Starting_High_School_2026.pdf) |
| 2026 | High school on-time offers 2026 (offers made 2 March 2026), cross-checked against the Starting High School 2027 booklet, page 6 | [`public/Documents/High_school_on_time_offers_2026.pdf`](public/Documents/High_school_on_time_offers_2026.pdf), [`public/Documents/Starting_High_School_2027.pdf`](public/Documents/Starting_High_School_2027.pdf) |

The council reuses its download links each year: the booklet link (`/download/downloads/id/13820/…`) and the
on-time offers link always serve the current file, whatever the filename says. Older years therefore came from the
Internet Archive: the 2024 on-time offers were captured on 4 July 2024 and the Starting High School 2026 booklet on
25 October 2025.

Other council pages: [School prospectuses](https://www.ealing.gov.uk/downloads/download/899/ealing_school_prospectuses) ·
[High school offer guidance](https://www.ealing.gov.uk/info/201113/school_admissions/1971/high_school_offer_guidance) ·
[Apply for high school](https://www.ealing.gov.uk/downloads/201115/apply_for_high_school)

### Notes on the distances

- `null` = everyone who applied was offered a place; `0` = no places offered on distance (Ark Soane 2019–20, before it opened).
- **Twyford** publishes two cutoffs a year (Foundation and World faith bands); the data uses the **World faith** figure.
- **Ark Soane** publishes distances from both the Town Hall and the school; the data uses the **school** figure.
- **Cardinal Wiseman**: since 2024 the cutoff applies to applicants below the Catholic-practice criteria (e.g. Catechumens & Eastern Christian in 2025 and 2026).
- **Drayton Manor** measures walking distance; `intakePath` holds the walking-distance area for 2019–2025. The 2026
  on-time offers confirm 1.647 mi, the same figure as 2025.
- **William Perkin 2024**: the 2024 on-time offers confirm 1.160 mi; the 2025 booklet's 1.036 mi is a misprint. That
  cut-off is for the "Nearest High School" priority group. The same is true in 2025 (0.836 mi) and 2026 (0.646 mi):
  every applicant in the plain "Distance" group was refused (284, 271 and 284), so a home inside the cut-off only
  qualifies if William Perkin is its nearest high school.

## Hounslow admission distances (`src/data/hounslow.js`, `intakeDist`)

Hounslow publishes a "How secondary places were allocated" report each year, after offer day.

| Offer year | Source | Copy in this repo |
|---|---|---|
| 2019 | Not found: the council's site and the Internet Archive have nothing before 2020 | – |
| 2020–2022 | "Secondary Transfer 2022 – Last distance offered", which lists 2020, 2021 and 2022 (Internet Archive, 29 March 2023) | [`public/Documents/Hounslow/Secondary_places_allocated_2022.pdf`](public/Documents/Hounslow/Secondary_places_allocated_2022.pdf) |
| 2023 | How secondary places were allocated for September 2023 (Internet Archive, 8 August 2024) | [`public/Documents/Hounslow/Secondary_places_allocated_2023.pdf`](public/Documents/Hounslow/Secondary_places_allocated_2023.pdf) |
| 2024 | [How secondary places were allocated for September 2024](https://www.hounslow.gov.uk/downloads/file/10512/how-secondary-places-were-allocated-for-september-2024) | [`public/Documents/Hounslow/Secondary_places_allocated_2024.pdf`](public/Documents/Hounslow/Secondary_places_allocated_2024.pdf) |
| 2025 | [How secondary places were allocated for September 2025](https://www.hounslow.gov.uk/downloads/file/11497/how-secondary-places-were-allocated-for-september-2025) | [`public/Documents/Hounslow/Secondary_places_allocated_2025.pdf`](public/Documents/Hounslow/Secondary_places_allocated_2025.pdf) |
| 2026 | [Allocation of Year 7 secondary school places, September 2026](https://www.hounslow.gov.uk/downloads/file/14358/allocation-of-year-7-secondary-school-places-september-2026) | [`public/Documents/Hounslow/Secondary_places_allocated_2026.pdf`](public/Documents/Hounslow/Secondary_places_allocated_2026.pdf) |

Like Ealing, Hounslow reuses download IDs (`id/4029` served the 2023 report, then the 2024 one), so older reports
came from the Internet Archive. Council page: [Secondary school admissions downloads](https://www.hounslow.gov.uk/downloads/download/2147/secondary-school-admissions).

### Notes on the distances

- "All offered" in the reports is `null`. "Contact school for information" (faith and some academy schools in
  2020–2022) and blank entries are left out, so those years show as no data.
- **Gumley House** and **Gunnersbury** (Catholic) never publish a distance: places go by faith criteria. No years.
- **St Mark's** publishes a cut-off per Catholic deanery; the data uses **Hounslow deanery**. Ealing deanery was
  6.656 (2023), 6.561 (2024), 5.509 (2025) and 5.599 mi (2026), given in the school's note.
- **Green School for Girls**: Christian foundation and world faith places were all offered every year; the data uses
  the **community** places' cut-off. The 2024 report prints "4.5122.126 miles" (the same in the copy archived in
  December 2024). 2.126 was the 2023 figure, so the data reads 2024 as **4.512**.
- **Green School for Boys**: Christian foundation and open places were all offered in 2023–2026.
- **Nishkam** is all-through: in 2023 its open distance places went to 0.815 mi (6 places), in 2024 none were given on
  distance (`0`), and 2025–2026 have no Year 7 entry figures.
- **Reach Academy Hanworth Park** gives places within a 5-mile catchment, pupil premium first, so there is no cut-off.
- **Reach Academy Feltham** is left out: it's all-through with no Year 7 entry point.
- **Kingsley Academy** appears as "Lift Kingsley" in the 2026 report.

## Ofsted (`rating`, `ratingDate`, `ofsted`)

`rating` / `ratingDate` are the last overall grade and its inspection date. `ofsted.latest` holds anything newer:
a report card (`reportCard`, with each area's grade and safeguarding), a 2024–25 inspection with area grades but no
overall grade (`keyJudgements`), or an ungraded check-in (`ungraded`, outcome `maintained` or `improving`).
Since September 2024 Ofsted no longer gives an overall grade, and from November 2025 it issues report cards instead.
Dormers Wells' and Greenford's report-card grades were read from the Ofsted report PDFs (Feb 2026).

| School | Ofsted page |
|---|---|
| Ada Lovelace | https://reports.ofsted.gov.uk/provider/23/145724 |
| Alec Reed Academy | https://reports.ofsted.gov.uk/provider/28/134369 |
| Ark Acton | https://reports.ofsted.gov.uk/provider/23/146318 |
| Ark Soane | https://reports.ofsted.gov.uk/provider/23/147863 |
| Brentside | https://reports.ofsted.gov.uk/provider/23/101939 |
| Dormers Wells | https://reports.ofsted.gov.uk/provider/23/145348 |
| Drayton Manor | https://reports.ofsted.gov.uk/provider/23/137221 |
| Ealing Fields | https://reports.ofsted.gov.uk/provider/23/142654 |
| Elthorne Park | https://reports.ofsted.gov.uk/provider/23/131310 |
| Featherstone | https://reports.ofsted.gov.uk/provider/23/137729 |
| Greenford | https://reports.ofsted.gov.uk/provider/23/101940 |
| Islip Manor (formerly Northolt High) | https://reports.ofsted.gov.uk/provider/23/101943 |
| Cardinal Wiseman | https://reports.ofsted.gov.uk/provider/23/101934 |
| Ellen Wilkinson | https://reports.ofsted.gov.uk/provider/23/101941 |
| Twyford | https://reports.ofsted.gov.uk/provider/23/137546 |
| Villiers | https://reports.ofsted.gov.uk/provider/23/101928 |
| William Perkin | https://reports.ofsted.gov.uk/provider/23/139725 |

### Hounslow schools

School details (official name, address, phone, website) and locations come from GOV.UK
[Get Information about Schools](https://get-information-schools.service.gov.uk), November 2026; each `centre` is the
GIAS easting/northing converted to latitude and longitude. Ofsted grades were read from each school's page on
`https://reports.ofsted.gov.uk/provider/23/<urn>` (`/provider/28/` for Nishkam and the Reach academies).

- **Cranford** has a report card (May 2026); its last overall grade is Good (March 2022).
- **Brentford School for Girls**' only overall grade (Good, September 2011) was given to its predecessor school
  (URN 102536); a 2025 inspection gave area grades only.
- **Reach Academy Hanworth Park** hasn't been inspected and has no GCSE results yet. It shares Reach Academy
  Feltham's address while its own building is finished, so its pin sits beside Reach Feltham's.

## GCSE results (`progress8`, `attainment8`, `grade5Above`)

From the DfE school performance tables (`perf` / `perfDetailed` links in the data). Not yet re-checked.

- Progress 8 is not published for 2024/25 or 2025/26 results (no Key Stage 2 baseline because of COVID); the latest available is 2023/24.
  See [DfE: Key stage 4 performance 2024/25](https://explore-education-statistics.service.gov.uk/find-statistics/key-stage-4-performance/2024-25).
- Drayton Manor and Ealing Fields currently have identical figures, so one is likely copied from the other.
- Ark Soane and Elthorne Park have no figures.
- **Hounslow** schools' Attainment 8 and grade 5+ figures are 2025/26 (provisional, from the DfE performance tables
  data on Explore Education Statistics, October 2026), and their Progress 8 scores are 2023/24, the latest published.
  The Ealing figures are older, so the two boroughs' GCSE results aren't from the same year.
