import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

async function htmlToPdf(input: string, output: string) {
  const htmlPath = path.resolve(process.cwd(), input);
  const pdfPath = path.resolve(process.cwd(), output);

  if (!fs.existsSync(htmlPath)) {
    console.error(`Input HTML not found: ${htmlPath}`);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
  });

  await browser.close();
  console.log(`PDF generated at: ${pdfPath}`);
}

const [,, input, output] = process.argv;
if (!input || !output) {
  console.error('Usage: ts-node scripts/html-to-pdf.ts <input.html> <output.pdf>');
  process.exit(1);
}

htmlToPdf(input, output).catch((e) => {
  console.error('Failed to create PDF:', e);
  process.exit(1);
});
