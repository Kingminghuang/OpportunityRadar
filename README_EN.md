# Opportunity Radar

English | [简体中文](./README.md)

Opportunity Radar is a daily opportunity-intelligence workspace for indie hackers, product builders, and entrepreneurs. It starts from real public demand signals—complaints, feature requests, workarounds, and trend evidence—then turns the strongest opportunities into a traceable, filterable static site.

Live site: https://kingminghuang.github.io/OpportunityRadar/

## Highlights

- **Real demand first**: opportunities must be backed by verifiable user pain or demand signals, not trend popularity alone.
- **Traceable evidence**: every opportunity keeps 2–4 source links and summaries so the original discussion can be reviewed.
- **Structured scoring**: opportunities are scored across demand strength, willingness to pay, MVP feasibility, competitive whitespace, and acquisition feasibility, for a total of 25 points.
- **Clear action labels**: every opportunity is classified as `deep-dive`, `watch`, or `skip`.
- **Filterable radar**: the homepage can filter historical opportunities by date, category, minimum score, and decision.
- **Layered sources of truth**: `_data/reports/YYYY-MM-DD.json` is the only source for daily scans; the corresponding GitHub Issue body is the only source for a completed deep-dive report.
- **Automated deployment**: pushes to `main` trigger GitHub Actions to build the Astro site and deploy it to GitHub Pages.

## How It Works

A typical daily scan follows this flow:

1. Discover demand signals from public sources such as Product Hunt, Reddit, Hacker News, GitHub Issues / Discussions, and Indie Hackers.
2. Deduplicate overlapping themes and keep only candidates with concrete user-demand or pain-point evidence.
3. Score each opportunity across five dimensions and assign a `deep-dive`, `watch`, or `skip` decision.
4. Validate the report against [`docs/content-schema.md`](./docs/content-schema.md).
5. Write the single daily file at `_data/reports/YYYY-MM-DD.json`.
6. During the Astro build, daily-report JSON and GitHub Issues that conform to [`docs/research-issue-schema.md`](./docs/research-issue-schema.md) generate the site and read-only Markdown archives under `dist/archives/`.

The full prompt used for the automated daily scan is available in [`automate_prompt.md`](./automate_prompt.md).

## Data Format

Daily reports are stored as JSON and use the `Asia/Shanghai` timezone for their date:

```text
_data/
└── reports/
    └── YYYY-MM-DD.json
```

Each report contains 1–5 opportunities. Important fields include:

- `title` / `summary`: report title and daily summary
- `opportunities`: ranked opportunity list
- `score`: five component scores plus the total
- `evidence`: verifiable supporting sources
- `decision`: `deep-dive`, `watch`, or `skip`
- `priorities`: best deep dive, fastest MVP, highest commercial value, and most validation-needed opportunity
- `scanNotes`: coverage window, sources, and limitations

See [`docs/content-schema.md`](./docs/content-schema.md) for the complete schema, enums, and validation rules.

## Deep-Diving an Opportunity

After the daily task writes a report, it lists all Top 1–5 opportunities. Reply in the same task conversation with `deep dive <rank>`, for example `deep dive 1`. ChatGPT creates or updates a `[Deep Dive]` GitHub Issue and writes the complete research report into its body. Completed research uses the `research-complete` status; the next push to `main` or manual Pages workflow run syncs and publicly displays the Issue's full Markdown content on the site.

See [`docs/research-issue-schema.md`](./docs/research-issue-schema.md) for the Issue-body metadata format, required report sections, and public-content constraints.

## Local Development

### Requirements

- Node.js 22 (the GitHub Pages workflow uses Node.js 22)
- npm

### Install dependencies

```bash
npm ci
```

### Start the dev server

```bash
npm run dev
```

### Run tests

```bash
npm test
```

### Build for production

```bash
npm run build
```

The build first synchronizes the GitHub Issue research index, runs Astro checks and static-site generation, then creates Markdown archives. Without a local `GITHUB_TOKEN`, it uses an empty research index; the GitHub Pages deployment uses its repository token to read Issues. Output is written to `dist/`.

## GitHub Pages Deployment

The repository includes [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml).

On every push to `main`, GitHub Actions will:

1. install dependencies;
2. resolve the GitHub Pages site URL and base path;
3. synchronize deep-dive Issues with minimal `issues: read` permission;
4. run `npm run build:pages`;
5. upload `dist/`;
6. deploy the artifact to GitHub Pages.

The default Astro site configuration is defined in [`astro.config.mjs`](./astro.config.mjs), and the GitHub Pages workflow injects the correct base path via `BASE_PATH` when running `npm run build:pages`.

## Project Structure

```text
OpportunityRadar/
├── .github/workflows/        # GitHub Pages deployment
├── _data/reports/            # Daily opportunity JSON; source for daily scans
├── docs/                     # Content schema and project documentation
├── scripts/                  # Build-time scripts, including Issue sync and Markdown archive generation
├── src/
│   ├── layouts/              # Astro layouts
│   ├── lib/                  # Data loading, validation, and URL helpers
│   ├── pages/                # Homepage and report pages
│   └── styles/               # Site styles
├── tests/                    # Vitest tests
├── automate_prompt.md        # Prompt for the daily opportunity scan
├── astro.config.mjs
└── package.json
```

## Adding or Updating a Daily Report

Read [`docs/content-schema.md`](./docs/content-schema.md) before adding a report. Key rules include:

- the file path must be `_data/reports/YYYY-MM-DD.json`;
- dates use `Asia/Shanghai`;
- there can be only one report per day; reruns update the existing file;
- every report contains 1–5 opportunities;
- every opportunity requires 2–4 verifiable evidence links;
- `score.total` must equal the sum of the five component scores;
- Markdown archives are build artifacts and should not be committed as source mirrors.

## Tech Stack

- [Astro](https://astro.build/) — static site generation
- TypeScript — type checking
- [Zod](https://zod.dev/) — content validation
- [Vitest](https://vitest.dev/) — testing
- GitHub Actions + GitHub Pages — CI/CD and hosting

## License

This repository does not currently declare an open-source license. If you plan to allow third-party reuse or contributions, consider adding an appropriate `LICENSE` file.
