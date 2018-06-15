import { format404 } from '../lib/html-formatter';

const ioEntriesRegex = /\/io\/getentries(\/.*)/;
const ioInRegex = /\/io\/in(\/.*)/;
const ioResetRegex = /\/io\/reset/;
const ioRemoveRegex = /\/io\/remove\/(.+)/;
const ioToRegex = /\/io\/to\/dataurl(\/.*)/;
const ioOutRegex = /\/io\/out(\/.*)/;
const ioImportRegex = /\/io\/import/;
const ioFromTextRegex = /\/io\/from\/text(\/.*)/;
const ioFromDataURIRegex = /\/io\/from\/dataurl(\/.*)/;

// Handles the response status
function handleResponseStatus(status, type) {
    return {
        status,
        statusText: 'OK',
        headers: { 'Content-Type': type },
    };
}

export default (workbox, ioServer) => {
    workbox.routing.registerRoute(
        ioInRegex,
        async ({ url }) => {
            const path = ioServer.fullyDecodeURI(
                url.pathname.match(ioInRegex)[1]
            );
            let body, type, status;
            try {
                const result = await ioServer.createPath(path);
            } catch (err) {
                body = err;
                type = 'text/html';
                // TODO: should probably do a better job here on mapping to err
                status = 404;
            }

            const init = handleResponseStatus(status, type);

            const request = async () => {
                const response = await fetch('/io.html');
                return await response.text();
            };

            return request().then(html => {
                return new Response(html, init);
            });
        },
        'GET'
    );

    workbox.routing.registerRoute(
        ioEntriesRegex,
        async ({ url }) => {
            const path = ioServer.fullyDecodeURI(
                url.pathname.match(ioEntriesRegex)[1]
            );
            let body, type, status;
            try {
                const res = await ioServer.createPath(path);
                const result = await ioServer.getEntries(path);

                body = result.body;
                type = result.type;
                status = 200;
            } catch (err) {
                body = err;
                type = 'text/html';
                // TODO: should probably do a better job here on mapping to err
                status = 404;
            }

            const init = handleResponseStatus(status, type);

            return new Response(body, init);
        },
        'GET'
    );

    workbox.routing.registerRoute(
        ioRemoveRegex,
        async ({ url }) => {
            const path =
                '/' +
                ioServer.fullyDecodeURI(url.pathname.match(ioRemoveRegex)[1]);
            let body, type, status;
            try {
                const result = await ioServer.deletePath(path);
                return Response.redirect(`${url.origin}/io/in/`);
            } catch (err) {
                // Need better way, for now just claiming directory doesn't exist
                // body = err;
                body = format404(path);
                type = 'text/html';
                // TODO: should probably do a better job here on mapping to err
                status = 404;
            }

            const init = handleResponseStatus(status, type);

            return new Response(body, init);
        },
        'GET'
    );

    workbox.routing.registerRoute(
        ioImportRegex,
        async ({ url, event, params }) => {
            return event.request
                .formData()
                .then(async formData => {
                    let body,
                        status,
                        type = 'text/html';
                    try {
                        var files = JSON.parse(formData.get('file'));
                        const result = await ioServer.createFilesFromArrayBuffer(
                            files
                        );
                        body = JSON.stringify(result);
                        status = 200;
                    } catch (err) {
                        body = err;
                        status = 404;
                    }

                    const init = handleResponseStatus(status, type);

                    return new Response(body, init);
                })
                .catch(err => {
                    return new Response(err);
                });
        },
        'POST'
    );

    workbox.routing.registerRoute(
        ioFromTextRegex,
        async ({ url }) => {
            const path = ioServer.fullyDecodeURI(
                url.pathname.match(ioFromTextRegex)[1]
            );
            let body,
                status,
                type = 'text/html';
            try {
                const result = await ioServer.createFileFromEncodedText(path);
                return Response.redirect(`${url.origin}/io/in${result.path}`);
            } catch (err) {
                body = err;
                status = 404;
            }

            const init = handleResponseStatus(status, type);

            return new Response(body, init);
        },
        'GET'
    );

    workbox.routing.registerRoute(
        ioFromDataURIRegex,
        async ({ url }) => {
            const path = ioServer.fullyDecodeURI(
                url.pathname.match(ioFromDataURIRegex)[1]
            );
            let body,
                status,
                type = 'text/html';
            try {
                const result = await ioServer.createFileFromEncodedDataURI(
                    path
                );
                return Response.redirect(`${url.origin}/io/in${result.path}`);
            } catch (err) {
                body = err;
                status = 404;
            }

            const init = handleResponseStatus(status, type);

            return new Response(body, init);
        },
        'GET'
    );

    workbox.routing.registerRoute(
        ioOutRegex,
        async ({ url }) => {
            let path = url.pathname.match(ioOutRegex)[1];
            path = ioServer.fullyDecodeURI(path);

            let body, type, status, result;
            try {
                result = await ioServer.getFile(path);
                body = result.body;
                type = 'application/octet-stream';
                status = 200;
            } catch (err) {
                body = err;
                type = 'text/html';
                // TODO: should probably do a better job here on mapping to err
                status = 404;
            }

            const init = handleResponseStatus(status, type);

            return new Response(body, init);
        },
        'GET'
    );

    workbox.routing.registerRoute(
        ioToRegex,
        async ({ url }) => {
            const path = ioServer.fullyDecodeURI(
                url.pathname.match(ioToRegex)[1]
            );

            let body, type, status;
            try {
                const result = await ioServer.getFileDataURL(path);

                body = `
                    File Name: ${result.name} </br> </br>
                    Data URI: </br>
                    <textarea style="width: 600px;
                                               height: 120px;
                                               border: 3px solid #cccccc;
                                               padding: 5px;
                                               font-family: Tahoma, sans-serif;
                                               background-position: bottom right;
                                               background-repeat: no-repeat;"> ${
                                                   result.dataurl
                                               } </textarea>
                `;
                type = 'text/html';
                status = 200;
            } catch (err) {
                body = err;
                type = 'text/html';
                // TODO: should probably do a better job here on mapping to err
                status = 404;
            }

            const init = handleResponseStatus(status, type);

            return new Response(body, init);
        },
        'GET'
    );

    workbox.routing.registerRoute(
        ioResetRegex,
        async ({ url }) => {
            const path = ioServer.fullyDecodeURI(
                url.pathname.match(ioResetRegex)[1]
            );

            let body, type, status;
            try {
                const result = await ioServer.clearFileSystem();
                return Response.redirect(`${url.origin}/io/in/`);
            } catch (err) {
                console.log(err);
                body = err;
                type = 'text/html';
                // TODO: should probably do a better job here on mapping to err
                status = 404;
            }

            const init = handleResponseStatus(status, type);

            return new Response(body, init);
        },
        'GET'
    );
};
