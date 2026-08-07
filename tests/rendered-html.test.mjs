import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("rend le portail public KRITIA Neural UX", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>KRITIA Neural UX — L’écosystème des professionnels(?: · KRITIA Neural UX)?<\/title>/i);
  assert.match(html, /KRITIA NEURAL UX/i);
  assert.match(html, /BTP/);
  assert.match(html, /Publicité/);
  assert.match(html, /Diag/);
  assert.match(html, /Courtage en travaux/);
  assert.match(html, /Preuve BTP/);
  assert.match(html, /Constat BTP/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});
