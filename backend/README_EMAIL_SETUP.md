# Email Setup (Gmail or Ethereal)

This guide helps configure SMTP for local development and production for the backend.

## Overview
- The backend uses Nodemailer to send emails (password reset, account confirmation, contact messages).
- If SMTP is not configured, the mailer creates an Ethereal test account and logs a preview URL to the console.

## Gmail (Recommended for quick testing; consider Mailgun/SendGrid for production)
1. Ensure your Google Account has 2-Step Verification enabled:
   - https://myaccount.google.com/security -> 2-Step Verification
2. Create an App Password:
   - https://myaccount.google.com/apppasswords
   - Select "Mail" and your device, or use "Other (Custom name)".
   - Copy the 16-character password (this is the `SMTP_PASS`).
3. Update `backend/.env` (or env config in your deployment):
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your@gmail.com
   SMTP_PASS=THE_APP_PASSWORD
   MAIL_FROM="Support <your@gmail.com>"
   SMTP_SECURE=false
   ```
4. Restart the backend and ensure env vars are loaded.

## Ethereal (dev fallback)
- If `SMTP_*` env vars are not set, an Ethereal test account will be created automatically.
- Nodemailer will log an Ethereal preview URL in the backend logs. Use the link to preview email content.
- Useful for local dev and CI where you don't want to send real emails.

## Testing email sending
- We added a quick test script:
  ```bash
  cd backend
  npm run build
  npm run test:email
  ```
- Set `SMTP_TEST_TO` in `.env` if you want the test recipient to differ from the SMTP user.
- If Gmail is used and configured correctly, the test email will be sent to the recipient. If Ethereal is used, a preview link will be printed in the logs.
 - If you have Gmail configured and still see `534-5.7.9 Application-specific password required`, enable 2-step verification and create an App Password (see above). Use the new App Password as `SMTP_PASS`.

## Troubleshooting
- `Invalid login: 534-5.7.9 Application-specific password required`:
  - This usually indicates your account requires an App Password. See the instructions above.
- `Invalid login: 535-5.7.8 Username and Password not accepted`:
  - Double-check `SMTP_USER` and `SMTP_PASS` and confirm you used an app password.
  - Check your Google account security activity; Google may block logins from unfamiliar locations.

## Recommended: Use a dedicated transactional email provider
- For production (reliable deliverability) use services such as SendGrid, Mailgun, AWS SES, or Postmark. They offer API-based sending, analytics, and better deliverability.

## Notes
- For WhatsApp sending, if you have WhatsApp Cloud API enabled, set `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` in `.env`.

## Dev endpoints (helpful for local testing)
- `GET /dev/confirm-token?email=<email>` (only in non-production): returns the most recent account confirmation code for the given email if one exists.

### Common flow for testing account confirmation
1. Register a user via API or frontend.
2. If SMTP is configured, check your email inbox for the confirmation code or if not, check the Ethereal preview link logged in backend logs.
3. Use `GET /dev/confirm-token?email=...` to fetch the code for the registered email while developing locally.
4. Use `/auth/confirm` with body `{ email, code }` to confirm the account.

### Example:
```bash
curl -s "http://localhost:5000/dev/confirm-token?email=admin@test.local" | jq
curl -X POST http://localhost:5000/auth/confirm -H 'Content-Type: application/json' -d '{"email":"admin@test.local","code":"123456"}'
```

