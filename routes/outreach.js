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
    { id: 1, name: 'GBP Review Tool - Intro', subject: 'Stop losing customers to bad reviews, {{company}}', body: 'Hi {{name}},\n\nI built a tool specifically for local service businesses like {{company}} that automatically alerts you to new Google Business Profile reviews and generates AI-powered replies in seconds.\n\nNo more manually checking for reviews or spending time crafting responses. You get notified instantly and can reply with one click.\n\nI\'m currently looking to sell this business. Check out my portfolio: https://jhcodequest.github.io/#about\n\nWant to see a demo? Just reply "yes" and I\'ll send you a video walkthrough.\n\nBest,\nMatrix' },
    { id: 2, name: 'GBP Tool - Pain Point', subject: 'Your {{company}} reviews are costing you leads', body: 'Hi {{name}},\n\nDid you know that 88% of consumers read reviews before choosing a local service business?\n\nIf you\'re not responding to reviews quickly (especially negative ones), you\'re losing customers to competitors who do.\n\nMy GBP Review Alert + AI Reply Generator solves this:\n✓ Instant notifications when new reviews come in\n✓ AI generates professional replies in seconds\n✓ Works for any local service business\n\nI\'m selling this SaaS tool as I pivot to new projects. See more: https://jhcodequest.github.io/#about\n\nWorth a 5-minute chat?\n\nBest,\nMatrix' },
    { id: 3, name: 'Business Sale - Acquisition', subject: 'Acquisition opportunity - GBP SaaS tool', body: 'Hi {{name}},\n\nI\'m reaching out because you\'re in the local service business space and might be interested in acquiring a ready-to-scale SaaS tool.\n\n**GBP Review Alert + AI Reply Generator**\n- Solves a real pain point for local businesses\n- Automated review monitoring + AI response generation\n- Ready to deploy\n\nI\'m selling this and other projects as I transition to new ventures. Portfolio: https://jhcodequest.github.io/#about\n\nIf you know someone who might be interested, I\'d appreciate an intro. Or if it\'s you, let\'s discuss terms.\n\nBest,\nMatrix' }
  ];
  res.json(templates);
});

module.exports = router;
