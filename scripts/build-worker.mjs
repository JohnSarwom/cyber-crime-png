import { mkdir, readFile, writeFile } from 'node:fs/promises'

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
const source = `const INDEX_HTML = ${JSON.stringify(html)};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (env?.ASSETS) {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404 || url.pathname.includes('.')) return asset;
    }
    return new Response(INDEX_HTML, {
      headers: {
        'content-type': 'text/html; charset=UTF-8',
        'cache-control': 'no-cache',
        'x-content-type-options': 'nosniff'
      }
    });
  }
};
`

await mkdir(new URL('../dist/server/', import.meta.url), { recursive: true })
await writeFile(new URL('../dist/server/index.js', import.meta.url), source)
