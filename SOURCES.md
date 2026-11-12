# Data sources

Where each figure in `src/plugins/schools.js` comes from. Checked November 2026.

## Admission distances (`intakeDist`)

Each "Starting High School" booklet prints the **previous** year's furthest distance offered,
so the booklet for year N gives the distances for September N−1.

| Offer year | Source | Copy in this repo |
|---|---|---|
| 2019 | Starting High School 2020 booklet | [`public/Documents/Starting_High_School_2020.pdf`](public/Documents/Starting_High_School_2020.pdf) |
| 2020 | Starting High School 2021 booklet | [`public/Documents/Starting_High_School_2021.pdf`](public/Documents/Starting_High_School_2021.pdf) |
| 2021 | Starting High School 2022 booklet | [`public/Documents/Starting_High_School_2022.pdf`](public/Documents/Starting_High_School_2022.pdf) |
| 2022 | Starting High School 2023 booklet, and the 2022 on-time offers | [`public/Documents/Starting_High_School_2023.pdf`](public/Documents/Starting_High_School_2023.pdf), [`public/Documents/Other/High_School_ontime_offers_2022.pdf`](public/Documents/Other/High_School_ontime_offers_2022.pdf) |
| 2023 | Starting High School 2024 booklet | [`public/Documents/Starting_High_School_2024.pdf`](public/Documents/Starting_High_School_2024.pdf) |
| 2024 | Starting High School 2025 booklet | [`public/Documents/Starting_High_School_2025.pdf`](public/Documents/Starting_High_School_2025.pdf) |
| 2025 | High school on-time offers 2025 | [`public/Documents/High_school_on_time_offers_2025.pdf`](public/Documents/High_school_on_time_offers_2025.pdf) |
| 2026 | [High school on-time offers 2026](https://www.ealing.gov.uk/download/downloads/id/21309/high_school_on_time_offers_2026.pdf) (Ealing Council, offers made 2 March 2026), cross-checked against the [Starting High School 2027 booklet](https://www.ealing.gov.uk/download/downloads/id/13820/high_school_prospectus_starting_high_school_2027.pdf), page 6 | Not yet copied |

Other council pages: [Starting High School 2026 booklet](https://www.ealing.gov.uk/download/downloads/id/13820/high_school_prospectus_starting_high_school_2026.pdf) ·
[High school offer guidance](https://www.ealing.gov.uk/info/201113/school_admissions/1971/high_school_offer_guidance) ·
[Apply for high school](https://www.ealing.gov.uk/downloads/201115/apply_for_high_school)

### Notes on the distances

- `null` = everyone who applied was offered a place; `0` = no places offered on distance (Ark Soane 2019–20, before it opened).
- **Twyford** publishes two cutoffs a year (Foundation and World faith bands); the data uses the **World faith** figure.
- **Ark Soane** publishes distances from both the Town Hall and the school; the data uses the **school** figure.
- **Cardinal Wiseman**: since 2024 the cutoff applies to applicants below the Catholic-practice criteria (e.g. Catechumens & Eastern Christian in 2025 and 2026).
- **Drayton Manor** measures walking distance; `intakePath` holds the walking-distance area for 2019–2025. The 2026 figure (1.647 mi) is printed identically to 2025 – worth re-checking.
- **William Perkin 2024**: the data has 1.160 mi; the 2025 booklet prints 1.036 mi, the same as 2023, which may be a misprint. The 2024 on-time offers PDF is no longer on the council site.

## Ofsted (`rating`, `ratingDate`, `ofstedLatest`)

`ratingDate` is the date of the last **graded** inspection. `ofstedLatest` is the most recent inspection of any kind.
Since September 2024 Ofsted no longer gives an overall grade, and from November 2025 it issues report cards instead.

| School | Ofsted page |
|---|---|
| Ada Lovelace | https://reports.ofsted.gov.uk/provider/23/145724 |
| Alec Reed Academy | https://reports.ofsted.gov.uk/provider/28/134369 |
| Ark Acton | https://reports.ofsted.gov.uk/provider/23/146318 |
| Ark Soane | https://reports.ofsted.gov.uk/provider/23/147863 |
| Brentside | https://reports.ofsted.gov.uk/provider/23/101939 |
| Dormers Wells | https://reports.ofsted.gov.uk/provider/23/145348 (report card grades as reported by [Ealing.news](https://www.ealing.news/?p=27805)) |
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

## GCSE results (`progress8`, `attainment8`, `grade5Above`)

From the DfE school performance tables (`perf` / `perfDetailed` links in the data). Not yet re-checked.

- Progress 8 is not published for 2024/25 or 2025/26 results (no Key Stage 2 baseline because of COVID); the latest available is 2023/24.
  See [DfE: Key stage 4 performance 2024/25](https://explore-education-statistics.service.gov.uk/find-statistics/key-stage-4-performance/2024-25).
- Drayton Manor and Ealing Fields currently have identical figures, so one is likely copied from the other.
- Ark Soane and Elthorne Park have no figures.
