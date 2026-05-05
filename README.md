# Cold Outreach Tool

A lightweight web app for sending cold emails and DMs on LinkedIn and Twitter (X).

## Features

- Send cold emails via SMTP (Gmail supported)
- Send LinkedIn DMs via LinkedIn API
- Send Twitter/X DMs via Twitter API v2
- Message templates for quick outreach

## Setup

1. Clone/copy this directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Configure your credentials in `.env`:
   - **Email**: Use Gmail App Password (not regular password)
   - **LinkedIn**: Get access token from LinkedIn Developers
   - **Twitter**: Create app at developer.twitter.com

5. Start the app:
   ```bash
   npm start
   ```

6. Open http://localhost:3000

## API Setup

### Gmail
1. Enable 2FA on your Google account
2. Generate App Password: Google Account → Security → App Passwords
3. Use the app password in `SMTP_PASS`

### LinkedIn
1. Create app at https://www.linkedin.com/developers/
2. Request `r_liteprofile`, `w_messages` permissions
3. Get access token

### Twitter/X
1. Create app at https://developer.twitter.com/
2. Enable "Read and Write" permissions
3. Get Bearer Token and Access Token

## Usage

- Select tab (Email/LinkedIn/Twitter)
- Choose a template or write custom message
- Fill in recipient details
- Click send

## Note

LinkedIn and Twitter integrations require API access which may need approval. For testing, the app will return simulation mode if credentials aren't configured.
