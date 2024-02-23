const puppeteer = require("puppeteer");
const fs = require("fs");
const axios = require("axios");
const { exec } = require("child_process");
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function download_pdf(page, file_path, pdf_link) {
  await page.goto(pdf_link);

  // Click to Open Full PDF
  await page.waitForSelector('span[title="Click to Open Full PDF"]');
  await sleep(500);
  await page.click('span[title="Click to Open Full PDF"]');

  await page.waitForSelector('iframe[id="pdf-quickview"]');
  const iframeSrc = await page.$eval("#pdf-quickview", (iframe) => iframe.src);

  // Navigate to the PDF URL
  await page.goto(iframeSrc);
  // await sleep(3000);

  // Fetch the PDF buffer using a fetch request in the page context
  // NOTE: This method assumes the server sends the PDF file directly
  const pdfBuffer = await page.evaluate(async (iframeSrc) => {
    const response = await fetch(iframeSrc);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    return Array.from(new Uint8Array(buffer));
  }, iframeSrc);

  // Convert the array back to buffer and save it as a .pdf file
  const buffer = Buffer.from(pdfBuffer);
  fs.writeFileSync(file_path, buffer, "binary");
}

(async () => {
  await sleep(1000);
  exec("killall chrome");
  await sleep(1000);
  exec(
    '/opt/google/chrome/chrome --profile-directory="Default" --remote-debugging-port=9222'
  );
  await sleep(1000);

  const browserURL = "http://127.0.0.1:9222";

  const browser = await puppeteer.connect({ browserURL });
  const page = (await browser.pages())[0];

  const all_pdfs = JSON.parse(fs.readFileSync("pdfs.json", "utf8"));
  const years = Object.keys(all_pdfs);

  for (const year of years) {
    // console.log(year);
    if (year === "2008") {
      if (!fs.existsSync(`./data/${year}`))
        // check if subdir exists
        fs.mkdirSync(`./data/${year}`);

      const pdfs = all_pdfs[year];
      // console.log(pdfs);
      for (const pdf_name of Object.keys(pdfs)) {
        // download pdf
        const pdf_link = pdfs[pdf_name];
        const file_path = `./data/${year}/${pdf_name}.pdf`;
        await download_pdf(page, file_path, pdf_link);
      }
    }
  }
})();
