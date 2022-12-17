
const owapi = require("../owapi");
const http = require('http');



/**
 * @param {http.IncomingMessage} request 
 * @param {http.ServerResponse} response 
 */
function api_ranks(request, response) {
    response.writeHead(200, {
        'Content-Type': 'application/json'
    });
    response.end(JSON.stringify(owapi.ranks));
}



module.exports = api_ranks;
