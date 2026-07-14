import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const distDir = resolve(new URL('../dist/', import.meta.url).pathname.replace(/^\/(.:)/, '$1'))
let html = await readFile(resolve(distDir, 'index.html'), 'utf8')

for (const match of [...html.matchAll(/<link[^>]+href="([^"]+\.css)"[^>]*>/g)]) {
  const css = await readFile(resolve(distDir, match[1].replace(/^\//, '')), 'utf8')
  html = html.replace(match[0], `<style>${css}</style>`)
}

for (const match of [...html.matchAll(/<script[^>]+src="([^"]+\.js)"[^>]*><\/script>/g)]) {
  const js = await readFile(resolve(distDir, match[1].replace(/^\//, '')), 'utf8')
  html = html.replace(match[0], `<script type="module">${js.replaceAll('</script>', '<\\/script>')}</script>`)
}

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
