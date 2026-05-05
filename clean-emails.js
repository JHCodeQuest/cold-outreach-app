const fs = require('fs');
const csv = require('csv-parser');

const inputFile = process.argv[2] || '/Users/matrix/lead_gen/leads_with_emails.csv';
const outputFile = inputFile.replace('.csv', '_clean.csv');

const junkPatterns = [
  'sentry.io', 'sentry-next.wixpress.com', 'sentry.wixpress.com',
  'user@domain.com', 'example.com', 'test@', 'your@'
];

const isJunkEmail = (email) => {
  return junkPatterns.some(pattern => email.includes(pattern));
};

const results = [];
const validBusinesses = [];

fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (row) => {
    const email = row.email || '';
    const allEmails = row.all_emails || '';

    let validEmail = '';

    if (email && !isJunkEmail(email)) {
      validEmail = email;
    } else if (allEmails) {
      const emails = allEmails.split('; ').filter(e => e && !isJunkEmail(e));
      validEmail = emails.length > 0 ? emails[0] : '';
    }

    if (validEmail) {
      validBusinesses.push({
        name: row['Business Name'] || row.name || '',
        email: validEmail,
        company: row['Business Name'] || row.name || '',
        phone: row['Phone Number'] || row.phone || '',
        website: row.Website || row.website || ''
      });
    }
  })
  .on('end', () => {
    const csvContent = [
      'name,email,company,phone,website',
      ...validBusinesses.map(b => `"${b.name}","${b.email}","${b.company}","${b.phone}","${b.website}"`)
    ].join('\n');

    fs.writeFileSync(outputFile, csvContent);
    console.log(`\nClean CSV saved to: ${outputFile}`);
    console.log(`Valid businesses with emails: ${validBusinesses.length}`);
    console.log('\nBusinesses:');
    validBusinesses.forEach(b => console.log(`  ${b.name}: ${b.email}`));
  });
