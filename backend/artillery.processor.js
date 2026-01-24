// Optional processor for Artillery. You can tag requests, add headers, or collect custom metrics here.
module.exports = {
  beforeRequest: (req, context, ee, next) => {
    // Example: add a header per request
    req.headers['x-test-run'] = 'artillery';
    return next();
  },
};
