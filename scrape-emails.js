const fs = require('fs');
const csv = require('csv-parser');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const inputFile = process.argv[2] || '/Users/matrix/lead_gen/leads.csv';
const outputFile = inputFile.replace('.csv', '_with_emails.csv');

const results = [];
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchPage = (url) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      timeout: 10000
    };

    client.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchPage(res.headers.location).then(resolve).catch(reject);
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject).on('timeout', () => reject(new Error('Timeout')));
  });
};

const extractEmails = (html, baseUrl) => {
  const emails = new Set();
  let match;

  while ((match = emailRegex.exec(html)) !== null) {
    const email = match[0].toLowerCase();
    if (!email.includes('example') && !email.includes('your@') && !email.includes('test@')) {
      emails.add(email);
    }
  }

  return Array.from(emails);
};

const findContactPage = (html, baseUrl) => {
  const linkRegex = /href=["']([^"']+)["']/g;
  const contactKeywords = ['contact', 'about', 'reach', 'get-in-touch'];
  const links = [];
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const link = match[1];
    if (contactKeywords.some(kw => link.toLowerCase().includes(kw))) {
      try {
        const fullUrl = new URL(link, baseUrl).href;
        links.push(fullUrl);
      } catch (e) {}
    }
  }

  return links;
};

const scrapeWebsite = async (website, businessName) => {
  if (!website || website === '') return [];

  try {
    console.log(`Scraping: ${businessName} - ${website}`);
    
    const html = await fetchPage(website);
    let emails = extractEmails(html, website);

    if (emails.length === 0) {
      const contactLinks = findContactPage(html, website);
      for (const link of contactLinks.slice(0, 2)) {
        try {
          const contactHtml = await fetchPage(link);
          const contactEmails = extractEmails(contactHtml, link);
          emails = [...emails, ...contactEmails];
          if (emails.length > 0) break;
        } catch (e) {}
      }
    }

    return [...new Set(emails)];
  } catch (error) {
    console.log(`  Error: ${error.message}`);
    return [];
  }
};

const main = async () => {
  const businesses = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(inputFile)
      .pipe(csv())
      .on('data', (row) => businesses.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Found ${businesses.length} businesses to process\n`);

  for (const business of businesses) {
    const website = business.Website || business.website || business.URL || '';
    const name = business['Business Name'] || business.name || 'Unknown';

    const emails = await scrapeWebsite(website, name);

    results.push({
      ...business,
      email: emails.length > 0 ? emails[0] : '',
      all_emails: emails.join('; ')
    });

    console.log(`  Emails found: ${emails.length > 0 ? emails.join(', ') : 'None'}\n`);

    await delay(2000);
  }

  const headers = Object.keys(results[0]);
  const csvContent = [
    headers.join(','),
    ...results.map(row => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  fs.writeFileSync(outputFile, csvContent);
  console.log(`\nDone! Output saved to: ${outputFile}`);
  console.log(`Found emails for ${results.filter(r => r.email).length} out of ${results.length} businesses`);
};

main().catch(console.error);
