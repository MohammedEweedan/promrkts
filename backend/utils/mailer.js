// Minimal runtime stub to satisfy bot/functions/tickets.js in development
// Replace with real transporter if needed.
module.exports.createTransporter = function createTransporter() {
  return {
    async sendMail() {
      return { accepted: [], rejected: [] };
    },
  };
};
