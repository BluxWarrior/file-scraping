const puppeteer = require("puppeteer");
const fs = require("fs");
const axios = require("axios");
const { exec } = require("child_process");
const startpage = process.argv[2];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ocr_pdf(page, year, pdf_name) {
  await page.goto("https://www.ilovepdf.com/ocr-pdf");

  await page.waitForSelector('a[id="pickfiles"]');
  await sleep(500);
  const [fileChooser] = await Promise.all([
    page.waitForFileChooser(),
    page.click("#pickfiles"),
  ]);

  // download
  await fileChooser.accept([`./data/${year}/${pdf_name}`]);

  await page.waitForSelector("#processTask");
  page.click("#processTask");

  // waiting
  console.log(`/home/blux/Downloads/${pdf_name}`);
  console.log(`./ocr_data/${year}/${pdf_name}`);

  let count = 0;
  while (!(await fs.existsSync(`/home/blux/Downloads/${pdf_name}`))) {
    if (count > 100) return false;
    await sleep(1000);
    count++;
  }
  await fs.rename(
    `/home/blux/Downloads/${pdf_name}`,
    `./ocr_data/${year}/${pdf_name}`,
    (err) => {
      if (err) return false;
      console.log("Rename successful");
    }
  );

  return true;
}

(async () => {
  // Launch a new browser session
  const browser = await puppeteer.launch({ headless: false });
  // Open a new page
  const page = await browser.newPage();
  // Set the navigation timeout (in milliseconds)
  await page.setDefaultNavigationTimeout(300000); // Timeout after 300 seconds

  const all_pdfs = JSON.parse(fs.readFileSync("pdfs.json", "utf8"));
  const years = Object.keys(all_pdfs);
  for (const year of years) {
    if (year >= startpage) {
      const pdfs = all_pdfs[year];
      // console.log(pdfs);
      if (!fs.existsSync(`./ocr_data/${year}`))
        // check if subdir exists
        fs.mkdirSync(`./ocr_data/${year}`);
      for (const pdf_name of Object.keys(pdfs).slice(
        fs.readdirSync(`./ocr_data/${year}`).length
      )) {
        // OCR pdf

        while (!(await ocr_pdf(page, year, `${pdf_name}.pdf`)));
      }
    }
  }
})();
