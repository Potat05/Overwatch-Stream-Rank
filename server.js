
const settings = require('./settings.json');
const fs = require('fs');
const http = require('http');



const MIME_TYPES = {
    'js': 'text/javascript',
    'css': 'text/css',
    'html': 'text/html',
    'json': 'application/json',
    'png': 'image/png'
}



http.createServer((request, response) => {

    const url = new URL(request.url, `http://${request.headers.host}`);

    console.log(`"${url.pathname}"`);

    if(url.pathname.startsWith('/api/')) {

        // Idk if theres any better way to do this.
        const apiFile = 'file://' + __dirname + url.pathname + '.js';

        import(apiFile).then(data => {

            const func = data[Object.keys(data)[0]];

            func(request, response);

        }).catch(reason => {

            response.writeHead(404);
            response.end('Status: Not Found.');

        });

    } else {

        if(url.pathname == '/favicon.ico') {
            url.pathname = '/favicon.png';
        }

        const file = __dirname + url.pathname;

        fs.readFile(file, (err, data) => {

            if(err) {

                response.writeHead(404);
                response.end('Status: Not Found.');

            } else {

                response.writeHead(200, {
                    'Content-Type': MIME_TYPES[file.split('.').pop()]
                });
                response.end(data);

            }

        });

    }

}).listen(settings.port, settings.hostname, undefined, () => {
    console.info(`Overwatch fetch profile server opened at: http://${settings.hostname}:${settings.port}`);
});
