
const settings = require('./settings.json');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');



const MIME_TYPES = {
    'js': 'text/javascript',
    'css': 'text/css',
    'html': 'text/html',
    'json': 'application/json',
    'png': 'image/png'
}



http.createServer(async (request, response) => {

    console.log(`"${request.url}"`);

    if(request.url.startsWith('/profile/')) {

        const battletag = request.url.split('/').filter(s => s.length != 0).pop();
        const profile_url = `https://overwatch.blizzard.com/en-us/career/${battletag}/`;

        console.log(`Getting profile "${profile_url}"`);

        https.get(profile_url, result => {

            let data = [];
            result.on('data', chunk => data.push(chunk));
            result.on('end', () => {

                const str = data.reduce((str, chunk) => str + new TextDecoder().decode(chunk), '');

                // fs.writeFile('./test.html', str, undefined, err => {
                //     if(err) console.error(err);
                // });

                const profileData = {
                    battletag: battletag.replace('-', '#'),
                    rank: {
                        tank: str.match(/role\/tank.+?icons\/rank\/(\w+-\d)/s)?.[1],
                        damage: str.match(/role\/offense.+?icons\/rank\/(\w+-\d)/s)?.[1],
                        support: str.match(/role\/support.+?icons\/rank\/(\w+-\d)/s)?.[1]
                    }
                }

                response.writeHead(200, {
                    'Content-Type': MIME_TYPES['json']
                });
                response.end(JSON.stringify(profileData));
                
            });

        }).on('error', err => {
            console.error(err);
        });

    } else if(request.url == '/favicon.ico') {

        fs.readFile('./favicon.png', (err, data) => {

            if(err) {
                console.error(`Could not get favicon.`);
            } else {
                response.writeHead(200, {
                    'Content-Type': MIME_TYPES['png']
                });
                response.end(data);
            }

        });

    } else {

        const file = __dirname + request.url;

        fs.readFile(file, (err, data) => {

            if(err) {
                console.error(`Could not get file "${file}"`);
            } else {
                response.writeHead(200, {
                    'Content-Type': MIME_TYPES[file.split('.').pop()]
                });
                response.end(data);
            }

        });

    }

}).listen(settings.port, undefined, undefined, () => {
    console.info(`Overwatch fetch profile server opened at: http://127.0.0.1:${settings.port}`);
});
