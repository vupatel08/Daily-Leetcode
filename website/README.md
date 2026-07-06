# Groundwork website

Marketing site and documentation for [Groundwork](https://github.com/vupatel08/Groudwork).

Built with Next.js 15, Tailwind, and the same monochrome editorial design as the Hivemind site — adapted for Groundwork's MCP-first product.

## Develop

```bash
cd website
npm install
npm run dev          # http://localhost:3001
npm run dev:clean    # wipe .next cache + dev
```

**Do not run `npm run build` while `npm run dev` is active** — it corrupts the `.next` cache.

## Structure

- `app/` — pages (home, product, docs)
- `content/docs/` — markdown documentation with `<!-- visual:name -->` embeds
- `components/docs/visuals/` — rich fake-data UI for docs
- `components/demos/` — conflict alert, injection terminal, timeline

## Production

```bash
npm run build
npm run start
```
