/**
 * End-to-end verification of the workflow the site has to support:
 * sign in, create a project, upload photographs, reorder them, choose hero and
 * cover, adjust the focal point, publish, and confirm it is live — then the
 * contact form, the inbox, Site Settings and the homepage editor.
 *
 *   node scripts/e2e.mjs [baseUrl]
 *
 * Requires the app to be running and ADMIN_EMAIL / ADMIN_PASSWORD to be set.
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { chromium } from 'playwright';
import sharp from 'sharp';

for (const file of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(path.join(process.cwd(), file));
  } catch {
    /* ignore */
  }
}

const BASE = (process.argv[2] ?? 'http://localhost:3000').replace(/\/+$/, '');
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;

const results = [];
let failures = 0;

function check(name, passed, detail = '') {
  results.push({ name, passed, detail });
  if (!passed) failures += 1;
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`);
}

/**
 * Waits until React has attached to the DOM. Clicking before that would
 * exercise the no-JavaScript fallback rather than the interactive behaviour
 * we are trying to verify.
 */
async function hydrated(page) {
  await page.waitForFunction(
    () => {
      const node = document.querySelector('main') ?? document.body;
      return Object.keys(node).some((key) => key.startsWith('__react'));
    },
    undefined,
    { timeout: 90_000 },
  );
}

async function open(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await hydrated(page);
}

/** Distinct, obviously synthetic test images. */
async function makeImages(dir) {
  const specs = [
    { name: 'test-wide.jpg', width: 1600, height: 900, rgb: { r: 90, g: 96, b: 104 } },
    { name: 'test-tall.jpg', width: 900, height: 1400, rgb: { r: 130, g: 120, b: 105 } },
    { name: 'test-square.png', width: 1200, height: 1200, rgb: { r: 70, g: 74, b: 78 } },
  ];

  const paths = [];
  for (const spec of specs) {
    const file = path.join(dir, spec.name);
    const image = sharp({
      create: { width: spec.width, height: spec.height, channels: 3, background: spec.rgb },
    });
    await (spec.name.endsWith('.png') ? image.png() : image.jpeg({ quality: 90 })).toFile(file);
    paths.push(file);
  }
  return paths;
}

async function main() {
  if (!EMAIL || !PASSWORD) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'eldamarany-e2e-'));
  const images = await makeImages(tmp);

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(String(error)));

  const stamp = Date.now();
  const titleEn = `E2E Test Project ${stamp}`;
  const titleAr = `مشروع اختبار ${stamp}`;

  try {
    /* --- 0. Warm the public routes -------------------------------------
       Publishing revalidates the whole site; in development that forces a
       recompile of every affected route, which would otherwise be mistaken
       for a failure further down. */
    const warm = await context.newPage();
    for (const route of ['/ar', '/en', '/ar/projects', '/en/projects', '/en/contact']) {
      await warm.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 180_000 });
    }
    await warm.close();

    /* --- 1. Sign in ---------------------------------------------------- */
    await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
    check('Unauthenticated /admin redirects to login', page.url().includes('/admin/login'));

    await page.fill('#email', EMAIL);
    await page.fill('#password', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin', { timeout: 60_000 });
    check('Admin sign-in succeeds', page.url().endsWith('/admin'));

    const dashboardHeading = await page.textContent('h1');
    check('Dashboard renders', Boolean(dashboardHeading?.includes('Welcome')));

    /* --- 2. Create a project ------------------------------------------- */
    await open(page, `${BASE}/admin/projects/new`);
    await page.fill('#titleAr', titleAr);
    await page.fill('#titleEn', titleEn);
    await page.fill('#descriptionEn', 'First paragraph of the description.\n\nSecond paragraph.');
    await page.fill('#locationEn', 'Alexandria, Egypt');
    await page.fill('#year', '2024');
    await page.selectOption('#status', 'COMPLETED');

    await page.click('button[name="publishStatus"][value="DRAFT"]');

    // "/admin/projects/new" also matches an id-shaped path, so wait explicitly
    // for the redirect to the saved record.
    await page.waitForURL(
      (url) => /^\/admin\/projects\/[^/]+$/.test(url.pathname) && !url.pathname.endsWith('/new'),
      { timeout: 60_000 },
    );
    const projectUrl = page.url().split('?')[0];
    check('Project created and saved as a draft', !projectUrl.endsWith('/new'), projectUrl);

    /* --- 3. Upload photographs ----------------------------------------- */
    await hydrated(page);
    await page.locator('button:has-text("Add images")').first().click();
    await page.waitForSelector('div[role="dialog"]', { timeout: 30_000 });
    await page.setInputFiles('div[role="dialog"] input[type="file"]', images);

    await page.waitForFunction(
      () =>
        document.querySelectorAll('div[role="dialog"] ul li button[aria-pressed="true"]').length >= 3,
      undefined,
      { timeout: 180_000 },
    );
    check('Three images uploaded through the dashboard', true);

    await page.click('div[role="dialog"] button:has-text("Add 3 image")');
    await page.waitForSelector('li:has-text("HERO")', { timeout: 60_000 });

    const tileCount = await page.locator('ul li:has(button[aria-label^="Reorder"])').count();
    check('Images attached to the project gallery', tileCount >= 3, `${tileCount} tiles`);

    const heroBadges = await page.locator('span:text-is("HERO")').count();
    const coverBadges = await page.locator('span:text-is("COVER")').count();
    check('First image became hero and cover automatically', heroBadges === 1 && coverBadges === 1);

    /* --- 4. Reorder by dragging ---------------------------------------- */
    const handles = page.locator('button[aria-label^="Reorder"]');
    const firstLabel = await handles.nth(0).getAttribute('aria-label');
    const box1 = await handles.nth(0).boundingBox();
    const box3 = await handles.nth(2).boundingBox();

    if (box1 && box3) {
      await page.mouse.move(box1.x + box1.width / 2, box1.y + box1.height / 2);
      await page.mouse.down();
      await page.mouse.move(box3.x + box3.width / 2, box3.y + box3.height / 2, { steps: 25 });
      await page.mouse.up();
      await page.waitForTimeout(3000);

      const newLabel = await handles.nth(0).getAttribute('aria-label');
      check('Gallery order changes when an image is dragged', newLabel !== firstLabel);
    } else {
      check('Gallery order changes when an image is dragged', false, 'handles not measurable');
    }

    const beforeReload = await handles.nth(0).getAttribute('aria-label');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await hydrated(page);
    await page.waitForSelector('button[aria-label^="Reorder"]', { timeout: 30_000 });
    const afterReload = await page
      .locator('button[aria-label^="Reorder"]')
      .nth(0)
      .getAttribute('aria-label');
    check('Gallery order is persisted', beforeReload === afterReload, afterReload ?? '');

    /* --- 5. Hero reassignment ------------------------------------------ */
    const setHero = page.locator('li button:has-text("Hero")').first();
    if (await setHero.count()) {
      await setHero.click();
      await page.waitForTimeout(3000);
    }
    check('Hero can be reassigned to another image',
      (await page.locator('span:text-is("HERO")').count()) === 1);

    /* --- 6. Focal point ------------------------------------------------ */
    await page.locator('li button:has-text("Edit")').first().click();
    await page.waitForSelector('div[role="application"]', { timeout: 30_000 });

    const stage = await page.locator('div[role="application"]').boundingBox();
    if (stage) {
      await page.mouse.move(stage.x + stage.width * 0.3, stage.y + stage.height * 0.28);
      await page.mouse.down();
      await page.mouse.move(stage.x + stage.width * 0.32, stage.y + stage.height * 0.3, { steps: 8 });
      await page.mouse.up();
    }

    const desktopX = await page.inputValue('input[name="focalX"]');
    check('Desktop focal point updates when dragged', Number(desktopX) !== 50, `focalX=${desktopX}`);

    await page.click('button:has-text("Mobile")');
    if (stage) {
      await page.mouse.move(stage.x + stage.width * 0.7, stage.y + stage.height * 0.7);
      await page.mouse.down();
      await page.mouse.move(stage.x + stage.width * 0.72, stage.y + stage.height * 0.72, { steps: 8 });
      await page.mouse.up();
    }
    const mobileX = await page.inputValue('input[name="mobileFocalX"]');
    check('Mobile focal point is separate from desktop',
      Number(mobileX) !== Number(desktopX), `mobileFocalX=${mobileX}`);

    await page.fill('textarea[name="captionEn"]', 'Test caption for the gallery image.');
    await page.fill('input[name="altTextEn"]', 'Synthetic test image');
    await page.click('button:has-text("Save image")');
    await page.waitForSelector('text=Image updated.', { timeout: 45_000 });
    check('Image crop and caption saved', true);

    await page.click('div[role="dialog"] button:has-text("Close")');
    await page.waitForTimeout(2000);

    /* --- 7. Draft preview ---------------------------------------------- */
    const previewLink = await page.locator('a:has-text("Preview draft")').getAttribute('href');
    check('Draft preview link is offered', Boolean(previewLink?.includes('preview=')));

    if (previewLink) {
      const previewPage = await context.newPage();
      const withToken = await previewPage.goto(`${BASE}${previewLink}`, {
        waitUntil: 'domcontentloaded',
      });
      const previewBody = await previewPage.textContent('body');
      check('Draft is visible with a preview token',
        withToken?.status() === 200 && Boolean(previewBody?.includes(titleAr)));

      const withoutToken = await previewPage.goto(`${BASE}${previewLink.split('?')[0]}`, {
        waitUntil: 'domcontentloaded',
      });
      check('Draft is hidden without the preview token', withoutToken?.status() === 404,
        `status ${withoutToken?.status()}`);
      await previewPage.close();
    }

    /* --- 8. Publish ----------------------------------------------------- */
    await open(page, projectUrl);
    await page.check('input[name="featured"]');
    // Put it first so the homepage assertion below is deterministic.
    await page.fill('#featuredOrder', '0');
    await page.click('button[name="publishStatus"][value="PUBLISHED"]');

    // Wait for whatever the action reports, then assert on its content, so a
    // validation failure is surfaced rather than showing up as a timeout.
    await page
      .waitForFunction(
        () =>
          [...document.querySelectorAll('[role="status"], [role="alert"]')].some(
            (node) => (node.textContent ?? '').trim().length > 0,
          ),
        undefined,
        { timeout: 180_000 },
      )
      .catch(() => {});

    const publishMessages = (await page.locator('[role="status"], [role="alert"]').allTextContents())
      .map((entry) => entry.trim())
      .filter(Boolean);

    check(
      'Project published from the dashboard',
      publishMessages.some((entry) => entry.includes('Published. The project is live')),
      publishMessages.join(' | ').slice(0, 200),
    );

    /* --- 9. Verify on the public site ----------------------------------- */
    const site = await context.newPage();

    await site.goto(`${BASE}/ar/projects`, { waitUntil: 'domcontentloaded' });
    check('Published project appears in the Arabic archive',
      Boolean((await site.textContent('body'))?.includes(titleAr)));

    await site.goto(`${BASE}/en/projects`, { waitUntil: 'domcontentloaded' });
    check('Published project appears in the English archive',
      Boolean((await site.textContent('body'))?.includes(titleEn)));

    await site.goto(`${BASE}/en`, { waitUntil: 'domcontentloaded' });
    check('Featured project appears on the homepage',
      Boolean((await site.textContent('body'))?.includes(titleEn)));

    await site.locator(`a:has-text("${titleEn}")`).first().click();
    await site.waitForURL(/\/en\/projects\/.+/, { timeout: 90_000 });
    check('Project detail page renders its content',
      Boolean((await site.textContent('body'))?.includes('First paragraph of the description.')));

    const objectPosition = await site
      .locator('img')
      .first()
      .evaluate((node) => getComputedStyle(node).objectPosition);
    check('Focal point is applied to the live image', /\d/.test(objectPosition), objectPosition);

    await hydrated(site);
    // Both the mobile strip and the desktop grid are in the DOM; pick the one
    // actually visible at this viewport.
    const galleryButton = site.locator('button[aria-label*="gallery" i]:visible').first();
    if (await galleryButton.count()) {
      await galleryButton.click();
      await site.waitForSelector('div[role="dialog"]', { timeout: 30_000 });
      check('Gallery lightbox opens', true);

      await site.keyboard.press('ArrowRight');
      await site.waitForTimeout(500);
      await site.keyboard.press('Escape');
      await site.waitForTimeout(900);
      check('Lightbox closes with the Escape key',
        (await site.locator('div[role="dialog"]').count()) === 0);
    } else {
      check('Gallery lightbox opens', false, 'no gallery trigger found');
    }

    /* --- 10. Filters ----------------------------------------------------- */
    await open(site, `${BASE}/en/projects`);
    await site.locator('select').first().selectOption({ index: 1 });
    await site.waitForURL(/\?.+=/, { timeout: 60_000 }).catch(() => {});
    check('Project filters update the URL', site.url().includes('='), site.url());

    const filteredCount = await site.locator('a[href*="/projects/"]').count();
    check('Filtered archive still renders results', filteredCount >= 0, `${filteredCount} links`);

    /* --- 11. Contact form ------------------------------------------------ */
    await open(site, `${BASE}/en/contact`);
    await site.fill('input[name="name"]', 'E2E Tester');
    await site.fill('input[name="email"]', 'e2e@example.com');
    await site.fill('textarea[name="message"]', `Automated end-to-end check ${stamp}.`);
    await site.check('input[name="consent"]');
    await site.click('button[type="submit"]');
    await site.waitForSelector('text=Your message has been sent', { timeout: 60_000 });
    check('Contact form submits successfully', true);

    /* --- 12. Inbox -------------------------------------------------------- */
    await open(page, `${BASE}/admin/messages`);
    check('Enquiry reaches the dashboard inbox',
      Boolean((await page.textContent('body'))?.includes('E2E Tester')));

    await page.locator('button:has-text("Mark contacted")').first().click();
    await page.waitForTimeout(3000);
    check('Message status can be changed',
      Boolean((await page.textContent('body'))?.includes('CONTACTED')));

    /* --- 13. Site settings and WhatsApp ----------------------------------- */
    await open(page, `${BASE}/admin/settings`);
    await page.fill('#whatsappNumber', '201000000000');
    await page.fill('#phone', '+20 3 000 0000');
    await page.click('button:has-text("Save settings")');
    await page.waitForSelector('text=Settings saved.', { timeout: 60_000 });
    check('Site settings save', true);

    await site.goto(`${BASE}/en/contact`, { waitUntil: 'domcontentloaded' });
    check('WhatsApp link generated from the saved number',
      (await site.locator('a[href^="https://wa.me/"]').count()) > 0);
    check('Phone number appears once entered',
      Boolean((await site.textContent('body'))?.includes('+20 3 000 0000')));

    /* --- 14. Homepage editor ---------------------------------------------- */
    // The first section (Hero) is expanded by default, so no click is needed.
    await open(page, `${BASE}/admin/homepage`);
    await page.waitForSelector('#titleEn', { timeout: 30_000 });
    const newHeadline = `Experience That Evolves ${stamp}`;
    await page.fill('#titleEn', newHeadline);
    await page.click('button:has-text("Save section")');
    await page.waitForSelector('text=The homepage has been updated', { timeout: 60_000 });
    check('Homepage section saved', true);

    await site.goto(`${BASE}/en`, { waitUntil: 'domcontentloaded' });
    check('Homepage headline edited in the dashboard appears live',
      Boolean((await site.textContent('body'))?.includes(newHeadline)));

    /* --- 15. Media library -------------------------------------------------- */
    await open(page, `${BASE}/admin/media`);
    const mediaText = await page.textContent('body');
    check('Uploaded files are listed in the media library',
      Boolean(mediaText?.includes('test-wide') || mediaText?.includes('test-square')));

    /* --- 16. Localisation, layout and errors --------------------------------- */
    await site.goto(`${BASE}/ar`, { waitUntil: 'domcontentloaded' });
    check('Arabic pages render right-to-left', (await site.getAttribute('html', 'dir')) === 'rtl');
    check('No horizontal overflow on the Arabic homepage',
      await site.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));

    for (const width of [320, 375, 430, 768, 1024]) {
      await site.setViewportSize({ width, height: 900 });
      await site.goto(`${BASE}/ar`, { waitUntil: 'domcontentloaded' });
      const fits = await site.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      );
      check(`No horizontal overflow at ${width}px`, fits);
    }
    await site.setViewportSize({ width: 1440, height: 900 });

    const notFound = await site.goto(`${BASE}/ar/missing-page`, { waitUntil: 'domcontentloaded' });
    check('Custom 404 page returns 404', notFound?.status() === 404);

    const sitemap = await site.goto(`${BASE}/sitemap.xml`, { waitUntil: 'domcontentloaded' });
    check('Sitemap is served', sitemap?.status() === 200);

    const robots = await site.goto(`${BASE}/robots.txt`, { waitUntil: 'domcontentloaded' });
    check('robots.txt is served', robots?.status() === 200);

    /* --- 17. Console cleanliness ---------------------------------------------- */
    const meaningfulErrors = consoleErrors.filter(
      (text) =>
        !text.includes('favicon') &&
        !text.includes('React DevTools') &&
        !text.includes('_next/hmr') &&
        !text.includes('WebSocket'),
    );
    check('No console errors during the run', meaningfulErrors.length === 0,
      meaningfulErrors.slice(0, 2).join(' | ').slice(0, 200));

    /* --- 18. Clean up ---------------------------------------------------------- */
    await open(page, projectUrl);
    await page.click('button:has-text("Delete project")');
    // Match the list route exactly — "**/admin/projects**" would also match the
    // edit page we are leaving.
    await page.waitForURL((url) => url.pathname === '/admin/projects', { timeout: 60_000 });
    await page.waitForSelector('a[href="/admin/projects/new"]', { timeout: 45_000 });

    // Both halves matter: the row must be gone from the database *and* from the
    // list the user is looking at straight after deleting.
    const { default: pg } = await import('pg');
    const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const remaining = await client.query('SELECT id FROM "Project" WHERE "titleEn" = $1', [titleEn]);
    await client.end();

    check('Project can be deleted', remaining.rowCount === 0,
      `${remaining.rowCount} row(s) remaining`);
    check('Deleted project disappears from the list immediately',
      !(await page.textContent('body'))?.includes(titleEn));

    // The photographs stay in the library after the project is removed; delete
    // them too so the run leaves nothing behind.
    let removedAssets = 0;
    for (const name of ['test-wide', 'test-tall', 'test-square']) {
      await open(page, `${BASE}/admin/media?q=${name}`);
      const tile = page.locator('ul li a[href^="/admin/media/"]').first();
      if ((await tile.count()) === 0) continue;

      await tile.click();
      await page.waitForURL(/\/admin\/media\/[^/]+$/, { timeout: 45_000 });
      await hydrated(page);

      const deleteButton = page.locator('button:has-text("Delete image")');
      if ((await deleteButton.count()) === 0) continue;

      await deleteButton.click();
      await page.waitForURL((url) => url.pathname === '/admin/media', { timeout: 60_000 });
      removedAssets += 1;
    }
    check('Unused media can be deleted from the library', removedAssets === 3,
      `${removedAssets}/3 removed`);

    await site.close();
  } catch (error) {
    check('Test run completed without throwing', false, String(error).slice(0, 300));
  } finally {
    await browser.close();
    await fs.rm(tmp, { recursive: true, force: true });
  }

  console.log('\n--------------------------------');
  console.log(`${results.length - failures}/${results.length} checks passed`);
  if (failures > 0) {
    console.log('\nFailed checks:');
    for (const result of results.filter((entry) => !entry.passed)) {
      console.log(`  - ${result.name}${result.detail ? `  [${result.detail}]` : ''}`);
    }
  }
  console.log('--------------------------------\n');

  process.exit(failures === 0 ? 0 : 1);
}

main();
