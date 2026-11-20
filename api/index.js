// Vercel serverless entry: every /api/* request is rewritten here (see vercel.json)
// and handled by the Express app in backend/server.js.
module.exports = require('../backend/server');
