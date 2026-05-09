const path = require('path');
const main = require(path.join(process.cwd(), 'dist', 'main'));
const handler = main.default || main;

module.exports = async (req, res) => {
  if (typeof handler !== 'function') {
    return res.status(500).json({ 
      error: 'Serverless handler not found in bundle', 
      debug: {
        type: typeof handler,
        keys: Object.keys(main)
      }
    });
  }
  return await handler(req, res);
};
