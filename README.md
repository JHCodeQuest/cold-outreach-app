# GBP Review Tool - Sales Outreach

A lightweight bulk email tool for selling your **GBP Review Alert + AI Reply Generator** to local service businesses.

## About the Product

This tool helps local service businesses:
- Get instant alerts when new Google Business Profile reviews come in
- Generate professional AI-powered replies in seconds
- Save hours of manual review management

**Portfolio:** https://jhcodequest.github.io/#about

## Features

- Bulk email sending via Gmail SMTP
- CSV contact list upload (name, email, company columns)
- Personalized templates with `{{field}}` variables
- Pre-built templates for selling the GBP tool
- Adjustable delay between emails (avoid spam filters)

## Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/JHCodeQuest/cold-outreach-app.git
   cd cold-outreach-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Configure Gmail credentials in `.env`:
   - **SMTP_USER**: Your Gmail address
   - **SMTP_PASS**: Use Gmail App Password (requires 2FA enabled)
   - Get App Password: Google Account → Security → App Passwords

5. Start the app:
   ```bash
   npm start
   ```

6. Open http://localhost:3456

## CSV Format

Upload a CSV with columns like:
```csv
name,email,company
John Doe,john@acmepainting.com,Acme Painting
Jane Smith,jane@bestplumbing.com,Best Plumbing LLC
```

## Email Templates

Three pre-built templates for selling your GBP tool:
1. **Intro** - Introduce the tool and its benefits
2. **Pain Point** - Focus on lost customers from bad reviews
3. **Acquisition** - Direct pitch to acquire the SaaS tool

## Usage

1. Upload your CSV contact list
2. Select a template or write custom message
3. Personalize with `{{name}}`, `{{company}}` variables
4. Set delay (2-5 seconds recommended)
5. Click "Send Emails"

## Portfolio

Check out all my projects: https://jhcodequest.github.io/#about
