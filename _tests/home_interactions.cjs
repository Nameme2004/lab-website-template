/* Real-browser checks against isolated, genuinely Jekyll-rendered fixtures. */
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const [fixtures, production, preview] = process.argv.slice(2).map((p) => path.resolve(p));
const fixturePrefix = "/lab-website-template/preview/fixture/";
const previewPrefix = "/lab-website-template/preview/pr-check/";
const productionPrefix = "/lab-website-template/";
const server = http.createServer((request, response) => {
  const url = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  let root, relative;
  if (url.startsWith(fixturePrefix)) { root = fixtures; relative = url.slice(fixturePrefix.length); }
  else if (url.startsWith(previewPrefix)) { root = preview; relative = url.slice(previewPrefix.length); }
  else if (url.startsWith(productionPrefix)) { root = production; relative = url.slice(productionPrefix.length); }
  else { response.writeHead(404).end(); return; }
  let file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep) && file !== root) { response.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!fs.existsSync(file)) { response.writeHead(404).end(); return; }
  const mime = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png" };
  response.setHeader("Content-Type", mime[path.extname(file)] || "application/octet-stream");
  fs.createReadStream(file).pipe(response);
});

(async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const screenshots = path.join(fixtures, "screenshots");
  fs.mkdirSync(screenshots, { recursive: true });
  const browser = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {});
  let checks = 0;
  const errors = [];
  const prepare = async (context) => {
    await context.route("**/*", (route) => new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort());
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    return page;
  };
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ["clipboard-read", "clipboard-write"] });
  const page = await prepare(context);
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
  const until = async (test) => {
    for (let i = 0; i < 100; i++) {
      if (await test()) return;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw new Error("Timed out waiting for browser feedback");
  };
  const url = (count, suffix = "") => `${origin}${fixturePrefix}${count}/${suffix}`;
  const active = () => page.locator("[data-news-slide]").evaluateAll((slides) => slides.findIndex((slide) => !slide.hidden));
  const expectActive = async (index) => { assert.equal(await active(), index); checks++; };
  const language = async (target, code) => {
    const button = target.locator(`[data-language-choice="${code}"]`);
    if (!await button.isVisible()) await target.locator(".nav-toggle").check();
    await button.click();
  };
  const idle = async () => {
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.activeElement.blur());
  };
  try {
    for (const count of [0, 1, 2, 5]) {
      assert.equal((await page.goto(url(count), { waitUntil: "load" })).status(), 200);
      assert.equal(await page.locator("[data-news-slide]").count(), count);
      assert.equal(await page.locator("[data-news-controls]").isVisible(), count > 1);
      const links = await page.locator("[data-news-link]").evaluateAll((items) => items.map((a) => a.getAttribute("href")));
      assert.ok(links.every((href) => href.startsWith(`${fixturePrefix}${count}/`) && href.endsWith(".html")));
      assert.ok(links.every((href) => !/hidden-news|example-post|future-news|blank-news/.test(href)));
      if (count) assert.ok((await page.locator("[data-news-slide]").first().textContent()).includes(`Fixture News ${count}`));
      else assert.equal(await page.locator(".home-news-empty").count(), 0);
      assert.equal(await page.locator("header[data-home-hero] [data-news-carousel]").count(), count ? 1 : 0);
      assert.equal(await page.locator("main [data-news-carousel], #latest-news").count(), 0);
      assert.equal(await page.locator("main > section").first().locator("h1").first().getAttribute("id"), "about-us");
      for (const href of links) assert.equal((await page.request.get(origin + href)).status(), 200);
      // Every count must fit both viewports, including all five dots and long translated titles.
      for (const width of [1440, 375]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const code of ["en", "zh"]) {
          await language(page, code);
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
          assert.equal(await page.locator("header").evaluate((h) => getComputedStyle(h).position), "relative");
          if (!count) assert.equal(await page.locator(".home-hero__all-news, [data-news-controls]").count(), 0);
          if (count === 1) {
            await page.clock.fastForward(12000);
            assert.equal(await active(), 0);
          }
          checks += 2;
        }
      }
      if (count) {
        await page.locator("[data-news-slide]").first().scrollIntoViewIfNeeded();
        await until(() => page.locator("[data-news-slide]").first().locator(".news-carousel__media").evaluateAll((media) => media.every((m) => m.hidden)));
        assert.equal(await page.locator("[data-news-slide]").first().locator(".news-carousel__media:visible").count(), 0);
      }
      checks += 9;
    }

    await page.goto(url(2));
    await idle();
    await expectActive(0);
    await page.clock.fastForward(6000); await expectActive(1);
    await page.clock.fastForward(6000); await expectActive(0);
    await page.locator("[data-news-carousel]").hover();
    await page.clock.fastForward(12000); await expectActive(0);
    await page.mouse.move(0, 0);
    await page.clock.fastForward(6000); await expectActive(1);
    await page.locator("[data-news-next]").focus();
    await page.clock.fastForward(12000); await expectActive(1);
    await page.keyboard.press("ArrowLeft"); await expectActive(0);
    await page.locator('[data-news-dot="1"]').focus();
    await page.keyboard.press("Enter"); await expectActive(1);
    await idle();
    await page.clock.fastForward(5999); await expectActive(1);
    await page.clock.fastForward(1); await expectActive(0);
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, value: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.clock.fastForward(12000); await expectActive(0);
    await page.evaluate(() => {
      delete document.hidden;
      for (let i = 0; i < 5; i++) document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.clock.fastForward(6000); await expectActive(1);
    await page.locator("[data-news-playback]").click();
    await idle(); await page.clock.fastForward(12000); await expectActive(1);
    await page.locator("[data-news-playback]").click();
    await idle(); await page.clock.fastForward(6000); await expectActive(0);
    await language(page, "zh");
    assert.equal(await page.locator("[data-news-next]").getAttribute("aria-label"), "下一条新闻");
    assert.ok((await page.locator('[data-news-slide]:not([hidden])').textContent()).includes("测试新闻"));
    checks += 2;

    for (const width of [1440, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const code of ["en", "zh"]) {
        await language(page, code);
        await page.locator('[data-news-dot="1"]').click();
        const image = page.locator('[data-news-slide]:not([hidden]) [data-news-image]');
        await until(() => image.evaluate((img) => img.complete && img.naturalWidth > 0));
        assert.ok(await image.evaluate((img) => {
          const r = img.getBoundingClientRect();
          return Math.abs(r.width / r.height - 16 / 9) < 0.02;
        }));
        const boxes = await page.locator(".home-research-card").evaluateAll((cards) => cards.map((card) => {
          const r = card.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, bottom: r.bottom };
        }));
        assert.equal(boxes.length, 2);
        assert.ok(boxes[1].y > boxes[0].bottom);
        assert.ok(Math.abs(boxes[0].width - boxes[1].width) < 1);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        assert.ok((await page.locator(".home-research-card__link").evaluateAll((links) => links.map((a) => a.pathname))).every((p) => p === `${fixturePrefix}2/research/`));
        assert.ok(await page.locator(".home-research-card__number").evaluateAll((numbers) => numbers.every((n) => {
          const range = document.createRange(); range.selectNodeContents(n); return range.getClientRects().length === 1;
        })));
        await page.screenshot({ path: path.join(screenshots, `fixture-news-${width}-${code}.png`), fullPage: true });
        checks += 5;
      }
    }

    await page.goto(url(2, "members/fixture-member.html"));
    await language(page, "en");
    assert.equal(await page.locator("[data-email-address]").textContent(), "fixture@university.edu");
    assert.equal(await page.locator('a[href^="mailto:"]').count(), 0);
    assert.equal(await page.locator('a[href="https://github.com/fixture-lab"]').count(), 1);
    assert.equal(await page.locator('a[href="https://orcid.org/0000-0001-2345-6789"]').count(), 1);
    await page.locator("[data-copy-email]").focus();
    await page.keyboard.press("Enter");
    await until(async () => await page.locator("[data-copy-status]").textContent() === "Copied!");
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), "fixture@university.edu");
    await language(page, "zh");
    assert.equal(await page.locator("[data-copy-status]").textContent(), "已复制");
    await page.screenshot({ path: path.join(screenshots, "fixture-copy-email-375-zh.png"), fullPage: true });
    await page.clock.fastForward(2500);
    assert.equal(await page.locator("[data-copy-status]").textContent(), "");
    await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("Denied fixture"); } } }));
    await page.locator("[data-copy-email]").click();
    await until(async () => (await page.locator("[data-copy-status]").textContent()).includes("手动复制"));
    await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined }));
    await language(page, "en");
    await page.locator("[data-copy-email]").click();
    await until(async () => (await page.locator("[data-copy-status]").textContent()).includes("copy it manually"));
    await page.goto(url(2, "members/no-email.html"));
    assert.equal(await page.locator("[data-member-email]").count(), 0);
    checks += 10;

    const reduced = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1200, height: 1000 } });
    const quiet = await prepare(reduced);
    await quiet.clock.install({ time: 0 });
    await quiet.clock.pauseAt(1000);
    await quiet.goto(url(2));
    await quiet.clock.fastForward(18000);
    assert.equal(await quiet.locator("[data-news-slide]").evaluateAll((s) => s.findIndex((a) => !a.hidden)), 0);
    assert.equal(await quiet.locator("[data-news-playback]").textContent(), "Start autoplay");
    await quiet.locator("[data-news-next]").click();
    assert.equal(await quiet.locator("[data-news-slide]").evaluateAll((s) => s.findIndex((a) => !a.hidden)), 1);
    checks += 3;
    await reduced.close();

    const mobile = await browser.newContext({ viewport: { width: 375, height: 900 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const touchPage = await prepare(mobile);
    await touchPage.goto(url(2));
    await touchPage.locator("[data-news-slide]").first().scrollIntoViewIfNeeded();
    const box = await touchPage.locator("[data-news-slide]").first().boundingBox();
    const cdp = await mobile.newCDPSession(touchPage);
    const y = Math.max(80, box.y + 80), startX = box.x + box.width * 0.85, endX = box.x + box.width * 0.15;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: startX, y }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: endX, y }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await touchPage.waitForFunction(() => [...document.querySelectorAll("[data-news-slide]")].findIndex((s) => !s.hidden) === 1);
    assert.ok(await touchPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    checks += 2;
    await mobile.close();

    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const staticPage = await prepare(noJS);
    await staticPage.goto(url(2));
    assert.equal(await staticPage.locator("[data-news-slide]:visible").count(), 2);
    assert.equal(await staticPage.locator("[data-news-controls]:visible").count(), 0);
    checks += 2;
    await noJS.close();

    // Both real site base URLs were built without publishing; verify real data remains renderable.
    for (const prefix of [productionPrefix, previewPrefix]) {
      assert.equal((await page.goto(origin + prefix)).status(), 200);
      assert.equal(await page.locator(".home-research-card").count(), 2);
      assert.equal(await page.locator("a.home-research-card__link").first().getAttribute("href"), prefix + "research/");
      assert.equal(await page.locator("main [data-news-carousel]").count(), 0);
      assert.equal(await page.locator("[data-news-carousel]").count(), await page.locator("header [data-news-carousel]").count());
      const newsLinks = await page.locator("[data-news-link]").evaluateAll((a) => a.map((n) => n.pathname));
      for (const link of newsLinks) {
        assert.ok(link.startsWith(prefix));
        assert.equal((await page.request.get(origin + link)).status(), 200);
      }
      const images = await page.locator("[data-news-image]").evaluateAll((a) => a.map((n) => n.getAttribute("src")));
      for (const image of images) {
        assert.ok(image.startsWith(prefix));
        const response = await page.request.get(origin + image);
        assert.equal(response.status(), 200);
        console.log(JSON.stringify({ image, bytes: (await response.body()).length }));
      }
      for (const route of ["research/", "team/", "publications/", "join-us/", "contact/", "blog/"]) {
        assert.equal((await page.goto(origin + prefix + route)).status(), 200);
        assert.equal(await page.locator("header[data-home-hero], header [data-news-carousel]").count(), 0);
        for (const width of [1440, 375]) {
          await page.setViewportSize({ width, height: 1000 });
          assert.equal(await page.locator("header").evaluate((h) => getComputedStyle(h).position), "sticky");
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        }
        checks += 3;
      }
      checks += 3;
    }
    await page.goto(origin + previewPrefix);
    for (const width of [1440, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const code of ["en", "zh"]) {
        await language(page, code);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.screenshot({ path: path.join(screenshots, `home-${width}-${code}.png`), fullPage: true });
        checks++;
      }
    }
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ browserChecksPassed: checks, notes: "Actual Chromium, real clipboard and touch input; visibility state is simulated; fixtures are isolated and unpublished." }));
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => { console.error(error); process.exitCode = 1; server.close(); });
