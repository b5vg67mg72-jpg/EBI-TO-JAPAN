import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the EBI public website", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>EBI Study Library \| Japan Admissions Resources<\/title>/i);
  assert.match(html, /id="past-exams"/);
  assert.match(html, /id="ai"/);
  assert.match(html, /id="contact"/);
  assert.match(html, /\/admin/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("keeps the main conversion controls wired", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /onClick=\{requestFreeLesson\}/);
  assert.match(page, /onSubmit=\{submitContact\}/);
  assert.match(page, /fetch\("\/api\/contact"/);
  assert.match(page, /document\.documentElement\.lang/);
  assert.match(page, /role=\{contactState === "error" \? "alert" : "status"\}/);
});

test("handles login failures without trapping the interface", async () => {
  const [page, route] = await Promise.all([
    readFile(new URL("../app/admin/login/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/login/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(page, /response\.json\(\)\.catch/);
  assert.match(page, /setBusy\(false\)/);
  assert.match(route, /status: 503/);
  assert.match(route, /ADMIN_PASSWORD/);
});
