const express = require('express');
const puppeteer = require('puppeteer');
require("dotenv").config();

const app = express();
const PORT = 10000;

app.get('/', async (req, res) => {
    try {
        //const browser = await puppeteer.launch({ headless: true });
		const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
        const page = await browser.newPage();

        // Set user agent to avoid blocking
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        await page.goto('https://www.forebet.com/en/football-tips-and-predictions-for-today', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Extract all match data
        const matches = await page.evaluate(() => {
            const results = [];
            const matchRows = document.querySelectorAll('.rcnt');
            
            matchRows.forEach(row => {
                const fprcText = row.querySelector('.fprc')?.textContent.trim() || '';
                const fprcOdds = fprcText.split(/\s+/).map(Number).filter(n => !isNaN(n));
                
                results.push({
                    date: row.querySelector('.date_bah')?.textContent.trim() || 'N/A',
                    homeTeam: row.querySelector('.homeTeam')?.textContent.trim() || 'N/A',
                    awayTeam: row.querySelector('.awayTeam')?.textContent.trim() || 'N/A',
                    prediction: row.querySelector('.forepr span')?.textContent.trim() || 'N/A',
                    leagueTag: row.querySelector('.shortTag')?.textContent.trim() || 'N/A',
                    odds: fprcOdds.length > 0 ? fprcOdds : 'N/A',
                    predictedScore: row.querySelector('.ex_sc.tabonly')?.textContent.trim() || 'N/A',
                    avgOdds: row.querySelector('.avg_sc.tabonly')?.textContent.trim() || 'N/A'
                });
            });
            
            return results;
        });

        await browser.close();
        
        // Set response headers and send JSON
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(matches, null, 2));
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error scraping data');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});