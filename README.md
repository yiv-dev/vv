# vv-parsing

Parser for [vkusvill.ru](https://vkusvill.ru) product data.

## Requirements

- Node.js >= 22
- Chromium (installed via `npm install` → `playwright install chromium`)

## Setup

```bash
npm install
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run collect-links` | Crawl category pages from `start-links.json`, save product links to `collected_links.json` |
| `npm run enrich-products -- <links-file.json>` | Fetch product details for each link, write JSON batches to `output/` |
| `npm run parse` | Parse a single category page (sample/debug) |

### 1. Collect links

Edit `start-links.json` with category paths, then:

```bash
npm run collect-links
```

Output: `collected_links.json`

### 2. Enrich products

Pass any JSON file with an array of product paths or URLs:

```bash
npm run enrich-products -- input/collected_links.json
npm run enrich-products -- input/collected_links_test.json
```

Output: `output/<date>-part-XXXX.json`

## Docker

```bash
docker compose up -d
docker compose exec scrapper npm run enrich-products -- input/collected_links_test.json
docker compose exec scrapper npm run collect-links
```

Volumes:

- `./input` — link files
- `./output` — enriched results

Default in container: `ENRICH_RESULT_ROWS_PER_FILE=100`.

## Configuration

Edit `src/config.js`:

| Option | Default | Description |
|--------|---------|-------------|
| `workerThreads` | `1` | Threads for link collection |
| `enrich.workerThreads` | `1` | Threads for product enrichment |
| `requestDelayMs` | `15000` | Delay between requests (ms) |
| `enrich.resultRowsPerFile` | `5` (local) / `100` (Docker) | Products per output file |

Environment variable:

```bash
ENRICH_RESULT_ROWS_PER_FILE=100 npm run enrich-products -- input/collected_links.json
```

## Important: rate limiting

**vkusvill.ru blocks parallel requests.** Keep `workerThreads` and `enrich.workerThreads` at **1** to avoid IP blocking and failed requests.

The default 15 s delay between requests is intentional — do not reduce it unless you accept the risk of blocks.

## Directories

```
input/          # user link files (collected_links.json, etc.)
output/         # enriched product JSON batches
start-links.json # category paths for collect-links
```
