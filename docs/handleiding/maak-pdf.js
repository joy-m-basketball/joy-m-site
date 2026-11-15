// Maakt docs/handleiding-website-beheren.pdf van docs/handleiding/handleiding.html
// Gebruik (vanuit de hoofdmap van de repository):  node docs/handleiding/maak-pdf.js
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const html = path.resolve(__dirname, 'handleiding.html');
  const pdf = path.resolve(__dirname, '..', 'handleiding-website-beheren.pdf');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: pdf,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate:
      '<div style="width:100%;font:8px Helvetica,Arial,sans-serif;color:#8592a3;padding:0 16mm;display:flex;justify-content:space-between">' +
      '<span>Joy-M · Handleiding website beheren</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
  });
  await browser.close();
  console.log('PDF gemaakt:', pdf);
})();
