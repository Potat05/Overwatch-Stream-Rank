
const owapi = require("../owapi");
const http = require('http');



/**
 * @param {http.IncomingMessage} request 
 * @param {http.ServerResponse} response 
 */
function api_profile(request, response) {
    
    const url = new URL(request.url, `http://${request.headers.host}`);

    const battletag = url.searchParams.get('battletag');
    const getStats = ['1', 'true', 'yes', null].includes(url.searchParams.get('stats')?.toLowerCase());

    console.info(`api/profile: Fetching profile of ${battletag}, getStats: ${getStats}`);

    owapi.profile(battletag, getStats).then(profile => {

        if(profile != null) {
            
            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            response.end(JSON.stringify(profile));

        } else {

            response.writeHead(400);
            response.end('Status: Bad Request.');

        }

    }).catch(reason => {

        response.writeHead(500);
        response.end('Status: Internal Server Error.');

        console.error(reason);

    });
}



module.exports = api_profile;
