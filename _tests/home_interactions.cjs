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
  const expectedContent = JSON.parse(fs.readFileSync(path.join(fixtures, "content-data.json"), "utf8"));
  const detailPaths = expectedContent.research.directions.map((direction) => `research/${direction.id}/`);
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
    const openedMenu = !await button.isVisible();
    if (openedMenu) await target.locator(".nav-toggle").check();
    await button.click();
    if (openedMenu) await target.locator(".nav-toggle").uncheck();
  };
  const idle = async () => {
    await page.mouse.move(-10, -10);
    await page.evaluate(() => document.activeElement.blur());
  };
  const homeGeometry = async () => {
    assert.equal(await page.locator(".home-hero__all-news").count(), 0);
    if (await page.locator("[data-news-carousel]").count()) {
      const news = await page.locator('[data-news-slide]:not([hidden]) .news-carousel__copy').boundingBox();
      const viewport = page.viewportSize().width;
      assert.ok(news.width <= 900.1);
      assert.ok(Math.abs(news.x + news.width / 2 - viewport / 2) < 1, "Hero title stays centered");
      assert.ok((await page.locator('[data-news-slide]:not([hidden]) h2').innerText()).trim().length > 0);
      assert.equal(await page.locator('[data-news-slide]:not([hidden]) h2').evaluate((h) => getComputedStyle(h).textAlign), "center");
      assert.equal(await page.locator('[data-news-slide]:not([hidden]) .news-carousel__read').count(), 1);
      assert.equal(await page.locator('[data-news-carousel] a[href$="/blog/"]').count(), 0);
    }
    checks += 3;
  };
  const navigation = async (prefix, currentRoute) => {
    const toggle = page.locator(".nav-toggle");
    assert.ok(await page.locator("[data-language-control]").isVisible());
    if (page.viewportSize().width > 1100) {
      const nav = await page.locator("header nav").boundingBox();
      assert.ok(Math.abs(nav.x + nav.width / 2 - page.viewportSize().width / 2) < 1, "Navigation is geometrically centered");
      const brand = await page.locator("header .home").boundingBox();
      const language = await page.locator("[data-language-control]").boundingBox();
      assert.ok(brand.x + brand.width <= nav.x && nav.x + nav.width <= language.x);
    }
    const bar = await page.locator(".site-header__bar").boundingBox();
    if (page.viewportSize().width === 1440) { assert.ok(Math.abs(bar.x - 40) < 1); assert.ok(Math.abs(bar.width - 1360) < 1); }
    const intro = page.locator(".page-hero__intro");
    if (await intro.count()) { const box = await intro.boundingBox(); assert.ok(Math.abs(box.x - bar.x) < 1 && Math.abs(box.width - bar.width) < 1); }

    const opened = await toggle.isVisible() && !await toggle.isChecked();
    if (opened) await toggle.check();
    assert.equal(await page.locator(`header nav a[href="${prefix}blog/"]`).count(), 1);
    assert.equal(await page.locator(`header nav a[href="${prefix}research/"]`).count(), 1);
    if (currentRoute && currentRoute !== "contact/") assert.ok(await page.locator(`header nav a[href="${prefix}${currentRoute}"]`).getAttribute("aria-current"));
    assert.ok(await page.locator("header nav > a").evaluateAll((links) => links.every((a) => {
      const r = a.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth;
    })));
    if (opened) await toggle.uncheck();
    checks += 4;
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
      assert.equal(await page.locator("main > section").first().locator("h2").first().getAttribute("id"), "about-us");
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await page.locator("header").evaluate((h) => getComputedStyle(h, "::before").backgroundImage), "none");
      for (const href of links) assert.equal((await page.request.get(origin + href)).status(), 200);
      // Every count must fit both viewports, including all five dots and long translated titles.
      for (const width of [1440, 1280, 768, 375]) {
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
          await homeGeometry();
          checks += 2;
        }
      }
      if (count) {
        await page.screenshot({path: path.join(screenshots, `fixture-${count}-fallback.png`), fullPage: true});
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
    await page.mouse.move(-10, -10);
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

    for (const width of [1440, 1280, 768, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const code of ["en", "zh"]) {
        await language(page, code);
        await page.locator('[data-news-dot="1"]').click();
        const image = page.locator('[data-news-slide]:not([hidden]) [data-news-image]');
        await until(() => image.evaluate((img) => img.complete && img.naturalWidth > 0));
        const coversHero = await image.evaluate((img) => {
          const r = img.getBoundingClientRect(), hero = img.closest("header").getBoundingClientRect();
          return Math.abs(r.width - hero.width) < 1 && Math.abs(r.height - hero.height) < 1 && getComputedStyle(img).objectFit === "cover";
        });
        if (!coversHero) {
          console.log(await image.evaluate((img) => ({ image: img.getBoundingClientRect().toJSON(), header: img.closest("header").getBoundingClientRect().toJSON(), containingBlock: img.parentElement.offsetParent?.tagName })));
          await page.screenshot({ path: path.join(screenshots, "hero-geometry-failure.png"), fullPage: true });
        }
        assert.ok(coversHero);
        assert.ok(await page.locator("header nav a, [data-language-choice], [data-news-next], [data-news-playback]").evaluateAll((items) => items.filter((e) => e.getBoundingClientRect().width).every((e) => {
          const r = e.getBoundingClientRect(), hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
          return hit && e.contains(hit);
        })));
        const boxes = await page.locator(".home-research-card").evaluateAll((cards) => cards.map((card) => {
          const r = card.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, bottom: r.bottom };
        }));
        assert.equal(boxes.length, 2);
        assert.ok(boxes[1].y > boxes[0].bottom);
        assert.ok(Math.abs(boxes[0].width - boxes[1].width) < 1);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        assert.deepEqual(await page.locator(".home-research-card__link").evaluateAll((links) => links.map((a) => a.pathname)), detailPaths.map((p) => `${fixturePrefix}2/${p}`));
        assert.ok(await page.locator(".home-research-card__number").evaluateAll((numbers) => numbers.every((n) => {
          const range = document.createRange(); range.selectNodeContents(n); return range.getClientRects().length === 1;
        })));
        await page.screenshot({ path: path.join(screenshots, `fixture-news-${width}-${code}.png`), fullPage: true });
        checks += 5;
      }
    }

    // The background detail link must work without covering brand/nav/controls.
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(url(2));
    const heroBox = await page.locator("header").boundingBox();
    await page.mouse.click(heroBox.width * .85, heroBox.y + heroBox.height * .5);
    await page.waitForURL(/fixture-news-2\.html$/);
    assert.equal(await page.locator("header .page-hero__intro h1").count(), 1);
    assert.equal(await page.locator("h1").count(), 1);
    checks += 2;

    await page.goto(url(2, "members/fixture-member.html"));
    await page.setViewportSize({ width: 375, height: 1000 });
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

    // Isolated members cover every role, fallback roles, empty groups and publication privacy.
    for (const count of [0, 5]) {
      await page.goto(url(count, "team/"));
      const roles = await page.locator("[data-team-role]").evaluateAll((groups) => groups.map((g) => g.dataset.teamRole));
      assert.deepEqual(roles, count === 5 ? ["principal-investigator", "postdoc", "phd", "masters", "undergrad", "programmer", "other"] : ["phd"]);
      assert.equal(await page.locator('[aria-label="Hidden Member Fixture"]').count(), 0);
      if (count === 5) assert.equal(await page.locator('[data-team-role="other"] .portrait').count(), 2);
      assert.equal((await page.request.get(url(count, "members/hidden-member.html"))).status(), 404);
      checks += 4;
    }
    await page.goto(url(2, "members/fixture-member.html"));
    assert.equal(await page.locator("[data-member-history]").count(), 0);
    const encoded = await page.locator("[data-member-papers]").getAttribute("href");
    assert.equal(new URL(encoded, origin).searchParams.get("search"), '"Fixture & 姓名 + O\'Neil"');
    await page.locator("[data-member-papers]").click();
    assert.equal(await page.locator(".search-input").inputValue(), '"Fixture & 姓名 + O\'Neil"');
    assert.equal(await page.locator(".citation:visible").count(), 0);
    assert.ok(!(await page.content()).includes("Never expose hidden aliases"));
    checks += 5;

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
      assert.deepEqual(await page.locator("a.home-research-card__link").evaluateAll((a) => a.map((n) => n.pathname)), detailPaths.map((p) => prefix + p));
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
        for (const width of [1440, 1280, 768, 375]) {
          await page.setViewportSize({ width, height: 1000 });
          assert.equal(await page.locator("header").evaluate((h) => getComputedStyle(h).position), "relative");
          assert.equal(await page.locator("header .page-hero__intro h1").count(), 1);
          assert.equal(await page.locator("h1").count(), 1);
          assert.equal(await page.locator("header").evaluate((h) => getComputedStyle(h, "::before").backgroundImage), "none");
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
          for (const code of ["en", "zh"]) {
            await language(page, code);
            await navigation(prefix, route);
            if (route === "team/") {
              assert.equal(await page.locator("main > section").count(), 1);
              assert.ok(await page.locator("main > section").evaluateAll((items) => items.every((s) => getComputedStyle(s, "::before").backgroundImage === "none")));
              assert.ok((await page.locator("main").innerText()).includes(expectedContent.team.gallery_intro[code]));
              const members = expectedContent.members.filter((m) => m.data.published !== false);
              const order = ["principal-investigator", "postdoc", "phd", "masters", "undergrad", "programmer"];
              const shown = order.filter((role) => members.some((m) => m.data.role === role));
              if (members.some((m) => !order.includes(m.data.role))) shown.push("other");
              assert.deepEqual(await page.locator("[data-team-role]").evaluateAll((g) => g.map((e) => e.dataset.teamRole)), shown);
              assert.equal(await page.locator("[data-team-role] .portrait").count(), members.length);
              checks += 2;
            }
            if (prefix === previewPrefix && ["research/", "join-us/", "team/", "publications/", "blog/"].includes(route)) await page.screenshot({ path: path.join(screenshots, `${route.slice(0,-1)}-${width}-${code}.png`), fullPage: true });
          }
          if (route === "join-us/") {
            assert.deepEqual(await page.locator("main > section").evaluateAll((s) => s.slice(0,3).map((x) => getComputedStyle(x).backgroundColor)), ["rgb(255, 255, 255)", "rgb(240, 244, 248)", "rgb(255, 255, 255)"]);
            await page.locator(".dark-toggle").check();
            assert.equal(await page.locator("html").getAttribute("data-dark"), "true");
            await until(async () => await page.locator("main > section").nth(1).evaluate((s) => getComputedStyle(s).backgroundColor) === "rgb(23, 52, 77)");
            assert.equal(await page.locator("main > section").nth(1).evaluate((s) => getComputedStyle(s).backgroundColor), "rgb(23, 52, 77)");
            await page.locator(".dark-toggle").uncheck();
            await until(async () => await page.locator("main > section").nth(1).evaluate((s) => getComputedStyle(s).backgroundColor) === "rgb(240, 244, 248)");
          }
        }
        checks += 3;
      }
      // Real member profiles: optional histories, verified dates, native links and author search.
      await page.goto(origin + prefix + "team/");
      const piHref = await page.locator('a.portrait[aria-label="Xiaohua Duan"]').getAttribute("href");
      const studentHref = await page.locator('a.portrait[aria-label="Yan Wang"]').getAttribute("href");
      for (const [kind, memberHref] of [["pi", piHref], ["student", studentHref]]) {
        await page.goto(origin + memberHref);
        for (const width of [1440, 1280, 768, 375]) {
          await page.setViewportSize({ width, height: 1000 });
          for (const code of ["en", "zh"]) {
            await language(page, code);
            assert.equal(await page.locator("h1").count(), 1);
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            assert.ok(await page.locator("[data-language-control]").isVisible());
            if (kind === "pi") {
              assert.equal(await page.locator('[data-member-history="work_experience"] li').count(), 2);
              assert.equal(await page.locator('[data-member-history="education"] li').count(), 2);
              const work = await page.locator('[data-member-history="work_experience"]').innerText();
              assert.ok(work.includes("2026.01") && work.includes("2020.11") && work.includes("2025.11") && work.includes("Weill Cornell Medicine"));
              const education = await page.locator('[data-member-history="education"]').innerText();
              for (const date of ["2014.09", "2021.01", "2009.09", "2014.07"]) assert.ok(education.includes(date));
              assert.ok(!(await page.locator(".member-biography").innerText()).includes("2020.11"));
              assert.ok(!(await page.locator('[data-member-history="education"]').innerText()).includes("Weill Cornell"));
              assert.ok(!/Academic Appointments|Postdoctoral Training/.test(await page.locator("h2").allTextContents()));
            } else {
              assert.equal(await page.locator("[data-member-history]").count(), 0);
              assert.ok((await page.locator("main").innerText()).includes(code === "zh" ? "人工智能虚拟细胞" : "AI Virtual Cell"));
            }
            if (prefix === previewPrefix) await page.screenshot({ path: path.join(screenshots, `member-${kind}-${width}-${code}.png`), fullPage: true });
            checks += 6;
          }
        }
        await page.locator("[data-member-papers]").click();
        assert.equal(new URL(page.url()).pathname, prefix + "publications/");
        // The destination search initializes on window.load, after navigation commits.
        await until(async () => (await page.locator(".search-input").inputValue()).includes(kind === "pi" ? "Xiaohua Duan" : "Yan Wang"));
        assert.ok((await page.locator(".search-input").inputValue()).includes(kind === "pi" ? "Xiaohua Duan" : "Yan Wang"));
        assert.equal(await page.locator(".citation:visible").count(), kind === "pi" ? 2 : 0);
        checks += 3;
      }
      await page.goto(origin + prefix + "publications/");
      const searchCases = [["DUAN",2], ["X. Duan",2], ["段晓华",2], ["Duan X",2], ["Alain Borczuk",1], ['"pancreatic cancer organoid platform"',1], ["胰腺癌",1], ["肺和结肠",1], ["2024",1], ["2021",1], ["Cell Stem Cell",1], ["Nature",1], ["10.1016/j.stem.2023.11.011",1], ["organoid",2], ["Scalable data harmonization",0]];
      for (const code of ["en", "zh"]) {
        await language(page, code);
        for (const [query, count] of searchCases) {
          await page.locator(".search-input").fill(query);
          assert.equal(await page.locator(".citation:visible").count(), count, query);
          assert.equal(new URL(page.url()).searchParams.get("search"), query);
          if (!count) assert.ok((await page.locator(".search-info").innerText()).includes(code === "zh" ? "未找到匹配的论文" : "No matching publications"));
          checks += 2;
        }
        await page.locator(".search-box button").click();
        assert.equal(await page.locator(".citation:visible").count(), 2);
        assert.equal(await page.locator(".search-input").inputValue(), "");
        assert.ok((await page.locator(".search-info").innerText()).includes("2"));
        checks += 3;
      }
      for (const width of [1440, 1280, 768, 375]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const code of ["en", "zh"]) {
          await language(page, code);
          await page.locator(".search-input").fill("2024");
          assert.equal(await page.locator(".citation:visible").count(), 1);
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
          if (prefix === previewPrefix) await page.screenshot({ path: path.join(screenshots, `publications-search-${width}-${code}.png`), fullPage: true });
          checks += 2;
        }
      }
      for (const [index, detailPath] of detailPaths.entries()) {
        assert.equal((await page.goto(origin + prefix + detailPath)).status(), 200);
        const direction = expectedContent.research.directions[index];
        for (const width of [1440, 1280, 768, 375]) {
          await page.setViewportSize({ width, height: 1000 });
          for (const code of ["en", "zh"]) {
            await language(page, code);
            await navigation(prefix, "research/");
            assert.equal((await page.locator("h1").innerText()).trim(), code === "zh" ? direction.title_zh : direction.title);
            assert.ok((await page.locator("main").innerText()).includes(code === "zh" ? direction.description_zh : direction.description));
            assert.equal(await page.locator(".research-detail__back").getAttribute("href"), prefix + "research/");
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            assert.ok((await page.title()).includes(direction.title));
            if (prefix === previewPrefix) await page.screenshot({ path: path.join(screenshots, `research-detail-${index+1}-${width}-${code}.png`), fullPage: true });
            checks += 5;
          }
        }
        await page.locator(".research-detail__back").click();
        assert.equal(new URL(page.url()).pathname, prefix + "research/");
      }
      if (newsLinks.length) {
        assert.equal((await page.goto(origin + newsLinks[0])).status(), 200);
        for (const width of [1440, 1280, 768, 375]) {
          await page.setViewportSize({ width, height: 1000 });
          for (const code of ["en", "zh"]) {
            await language(page, code);
            await navigation(prefix, "blog/");
            const image = page.locator("body[data-news-detail] .post-cover");
            if (await image.count()) {
              await image.scrollIntoViewIfNeeded();
              await until(() => image.evaluate((i) => i.complete && i.naturalWidth > 0));
              assert.ok(await image.evaluate((i) => {
                const r = i.getBoundingClientRect(), section = i.closest("section"), box = section.getBoundingClientRect(), css = getComputedStyle(section);
                return r.height <= 420.1 && r.height <= innerHeight * .52 + .1 && r.width <= box.width - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight) + .1 && Math.abs(r.width / r.height - i.naturalWidth / i.naturalHeight) < .02;
              }));
            }
            assert.equal(await page.locator("header h1").count(), 1);
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            if (prefix === previewPrefix) await page.screenshot({ path: path.join(screenshots, `news-detail-${width}-${code}.png`), fullPage: true });
            checks += 3;
          }
        }
      }
      checks += 3;
    }
    await page.goto(origin + previewPrefix);
    for (const width of [1440, 1280, 768, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const code of ["en", "zh"]) {
        await language(page, code);
        await homeGeometry();
        await navigation(previewPrefix, "");
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.screenshot({ path: path.join(screenshots, `home-${width}-${code}.png`), fullPage: true });
        checks++;
      }
    }
    // Separate real-font probe: other checks deliberately block external services.
    // Network availability is reported, not confused with system-fallback coverage.
    const fontContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await fontContext.route("**/*", (route) => {
      const host = new URL(route.request().url()).hostname;
      return ["127.0.0.1", "fonts.googleapis.com", "fonts.gstatic.com"].includes(host) ? route.continue() : route.abort();
    });
    const fontPage = await fontContext.newPage();
    await fontPage.addInitScript(() => {
      window.fontCLS = 0;
      new PerformanceObserver((list) => list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) window.fontCLS += entry.value;
      })).observe({ type: "layout-shift", buffered: true });
    });
    let fontReport;
    try {
      await fontPage.goto(origin + previewPrefix, { waitUntil: "load", timeout: 20000 });
      fontReport = await fontPage.evaluate(async () => {
        const fonts = await Promise.race([
          Promise.all([document.fonts.load('400 16px "Inter"', "Duan Lab"), document.fonts.load('400 16px "Noto Sans SC"', "类器官")]),
          new Promise((resolve) => setTimeout(() => resolve(null), 12000)),
        ]);
        return { loaded: !!fonts && fonts.every((items) => items.length > 0), CLS: window.fontCLS, family: getComputedStyle(document.body).fontFamily };
      });
      if (fontReport.loaded) {
        assert.ok(fontReport.CLS < .1, `Font/load CLS ${fontReport.CLS}`);
        for (const width of [1440, 1280, 768, 375]) {
          await fontPage.setViewportSize({ width, height: 1000 });
          assert.ok(await fontPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
          if (width > 1100) assert.ok(await fontPage.locator("header nav").evaluate((nav) => { const b = nav.getBoundingClientRect(); return Math.abs(b.x + b.width / 2 - innerWidth / 2) < 1; }));
          await fontPage.screenshot({ path: path.join(screenshots, `home-webfonts-${width}.png`), fullPage: true });
        }
      }
    } catch (error) {
      // Assertions remain failures; only a service timeout may fall back.
      if (error.name !== "TimeoutError") throw error;
      fontReport = { loaded: false, unavailable: "External font service timeout; system fallback checked separately" };
    }
    fs.writeFileSync(path.join(screenshots, "font-load-report.json"), JSON.stringify(fontReport, null, 2));
    console.log(JSON.stringify({ fontReport }));
    await fontContext.close();
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ browserChecksPassed: checks, notes: "Actual Chromium, real clipboard and touch input; visibility state is simulated; fixtures are isolated and unpublished." }));
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => { console.error(error); process.exitCode = 1; server.close(); });
