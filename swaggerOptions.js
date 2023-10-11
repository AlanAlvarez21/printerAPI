const swaggerDefinition = require('./swaggerDefinition');

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./app.js'], // Replace with the path to your app.js or route files
};

module.exports = swaggerOptions;
