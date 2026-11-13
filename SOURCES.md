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

## GCSE results (`progress8`, `attainment8`, `grade5Above`)

From the DfE school performance tables (`perf` / `perfDetailed` links in the data). Not yet re-checked.

- Progress 8 is not published for 2024/25 or 2025/26 results (no Key Stage 2 baseline because of COVID); the latest available is 2023/24.
  See [DfE: Key stage 4 performance 2024/25](https://explore-education-statistics.service.gov.uk/find-statistics/key-stage-4-performance/2024-25).
- Drayton Manor and Ealing Fields currently have identical figures, so one is likely copied from the other.
- Ark Soane and Elthorne Park have no figures.
