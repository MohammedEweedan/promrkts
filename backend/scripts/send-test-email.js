/* Node script to quickly test sending emails through configured SMTP
   Usage: node scripts/send-test-email.js
   Ensure you run `npm run build` or that `dist/utils/mailer.js` exists.
*/

require('dotenv').config({ path: process.env.DOTENV_PATH || '.env' });

(async () => {
  try {
    const mailer = require('../dist/utils/mailer');
    const sendMail = mailer.sendMail || mailer.default?.sendMail;
    if (!sendMail) {
      console.error('sendMail not found in dist/utils/mailer. Make sure you built the project.');
      process.exit(1);
    }

    const to = process.env.SMTP_TEST_TO || process.env.SMTP_USER;
    if (!to) {
      console.error('No SMTP_TEST_TO or SMTP_USER configured. Set SMTP_TEST_TO to the recipient email.');
      process.exit(1);
    }

    const subject = process.env.SMTP_TEST_SUBJECT || 'promrkts email test';
    const text = `This is a test email sent at ${new Date().toISOString()}`;
    const html = `<p>${text}</p>`;

    console.log('Sending test email to', to);
    const info = await sendMail({ to, subject, text, html });
    console.log('Send result:', info);
    const nodemailer = require('nodemailer');
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('Preview URL:', preview);
    console.log('Done.');
  } catch (err) {
    console.error('Error sending test email:', err?.message || err);
    console.error(err);
    process.exit(1);
  }
})();
