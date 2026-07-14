# Qdrant Sizing Tool

An interactive, fully client-side sizing calculator for [Qdrant](https://qdrant.tech) vector database collections. Estimate RAM, SSD, and node requirements for any collection configuration — and understand *why* each component consumes what it does.

No backend, no API calls: all calculations run instantly in the browser, so the tool works offline and can be embedded in a documentation portal.

## Features

- **Instant recalculation** — every input change updates all results immediately; there is no "Calculate" button.
- **Complete storage breakdown** — original vectors, quantized vectors, HNSW graph, payload, payload indexes, ID/version tracking, metadata, and runtime overhead, each with RAM/disk placement.
- **Traceable math** — every value expands to show its formula, the calculation with your numbers substituted, an explanation of the underlying Qdrant mechanics, and a link to the official documentation.
- **Placement modeling** — toggle each component between RAM and disk and see the memory, latency, and warning implications.
- **Quantization support** — none, binary (1 bit/dim), and scalar int8 (1 byte/dim), with separate placement for original and quantized vectors.
- **Deployment comparison chart** — compares RAM, disk, and qualitative latency/recall/cost across five strategies, from "everything on disk" to "everything in RAM".
- **Contextual warnings** — e.g. unquantized vectors on SSD, HNSW graph on disk, insufficient replication, low RAM headroom per node.
- **Export** — PDF report (via print), JSON configuration, CSV summary, and a shareable URL that encodes all inputs as query parameters.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and produce a production build in dist/
npm run lint     # run oxlint
```

Requires Node.js 20+.

## Tech stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Recharts](https://recharts.org) for the pie and bar charts

## How the estimates work

All sizing logic lives in `src/lib/sizing.ts`. Key formulas (per replica):

| Component | Formula | Notes |
| --- | --- | --- |
| Original vectors | `N × dim × datatype size` | 4 B/dim for float32, 2 B/dim for float16 |
| Quantized vectors | `N × dim ÷ 8` (binary) / `N × dim × 1 B` (scalar) | Compressed copy used during ANN traversal |
| HNSW graph | `N × 2 × M × 4 B` | Level 0 stores ~2×M neighbors, each a 4-byte point ID |
| Payload | `N × avg payload size` | JSON metadata per point |
| Payload index | `N × indexed fields × ~16 B` | Heuristic; depends on field types and cardinality |
| IDs & versions | `N × ~16 B` | ID tracker + per-point version, always RAM-resident |
| Metadata | `max(32 MiB, 1% of data)` | Segment manifests, schema, WAL bookkeeping |
| Runtime overhead | `15% of RAM-resident data + 512 MiB` | Search buffers, indexing scratch, allocator overhead |

Cluster totals multiply by the replication factor; the recommended node count is derived from the per-node RAM budget. Components placed in RAM are still persisted to disk, matching Qdrant's storage behavior.

**These are estimates for capacity planning**, not guarantees — validate with a proof of concept before finalizing production sizing. See Qdrant's [capacity planning guide](https://qdrant.tech/documentation/guides/capacity-planning/) and [large-scale search tutorial](https://qdrant.tech/documentation/tutorials-operations/large-scale-search/).

## Project structure

```
src/
  lib/            # pure calculation logic (no React)
    sizing.ts     # component formulas and totals
    scenarios.ts  # deployment-strategy comparison
    warnings.ts   # contextual warnings
    performance.ts# qualitative performance notes
    url.ts        # shareable-URL (de)serialization
    export.ts     # JSON / CSV / PDF export
  components/
    InputPanel.tsx        # left panel: all inputs with tooltips
    charts/               # pie + horizontal bar charts (Recharts)
    results/              # summary, breakdown, formulas, warnings cards
    ui/                   # tooltip, expandable card, form fields
  hooks/
    useSizingConfig.ts    # config state synced to the URL
```
