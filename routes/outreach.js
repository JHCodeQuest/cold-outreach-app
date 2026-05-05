const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const emailService = require('../services/email');

const upload = multer({ dest: 'uploads/' });

router.post('/upload-csv', upload.single('csv'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  const contacts = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => {
      contacts.push(row);
    })
    .on('end', () => {
      fs.unlinkSync(req.file.path);
      res.json({ success: true, contacts, count: contacts.length });
    })
    .on('error', (error) => {
      res.status(500).json({ success: false, error: error.message });
    });
});

router.post('/send-bulk', async (req, res) => {
  try {
    const { contacts, subject, body, from, delay } = req.body;
    const results = { sent: 0, failed: 0, errors: [] };

    for (const contact of contacts) {
      try {
        let personalizedSubject = subject;
        let personalizedBody = body;

        Object.keys(contact).forEach(key => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          personalizedSubject = personalizedSubject.replace(regex, contact[key]);
          personalizedBody = personalizedBody.replace(regex, contact[key]);
        });

        await emailService.sendEmail({
          to: contact.email || contact.Email || contact.email_address,
          subject: personalizedSubject,
          body: personalizedBody,
          from
        });

        results.sent++;
        
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay * 1000));
        }
      } catch (error) {
        results.failed++;
        results.errors.push({ email: contact.email || contact.Email, error: error.message });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/templates', (req, res) => {
  const templates = [
    { id: 1, name: 'Cold Outreach', subject: 'Quick question about {{company}}', body: 'Hi {{name}},\n\nI came across {{company}} and wanted to reach out...\n\nBest regards' },
    { id: 2, name: 'Follow Up', subject: 'Following up - {{company}}', body: 'Hi {{name}},\n\nJust following up on my last email...\n\nBest' },
    { id: 3, name: 'Partnership', subject: 'Partnership opportunity for {{company}}', body: 'Hi {{name}},\n\nI think there\'s a great opportunity for {{company}} to partner with us...\n\nBest' }
  ];
  res.json(templates);
});

module.exports = router;
