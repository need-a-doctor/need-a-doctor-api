var fs = require('fs');
var path = require('path');

var config = require('../config/environment');

var swaggerJSONFilePath = path.join(config.root,'src/swagger-ui/swagger.json');
var swaggerJSON = require(swaggerJSONFilePath);

swaggerJSON.host = config.backend.url.replace('http://','').replace(':9000/',':9000');
fs.writeFile(swaggerJSONFilePath, JSON.stringify(swaggerJSON, null, 2), 'utf-8', function (err) {
  if(err) {
    console.error('swagger-ui/updateAPIPath.js - Write SwaggerJSON failed. Error:', err);
  }
});
