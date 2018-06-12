import { formatDir, format404 } from './html-formatter';

const ioInRegex = /\/io\/in(\/.*)/;
const ioImportRegex = /\/io\/import/;

export default (workbox, ioServer) => {
    // @ts-ignore
    workbox.routing.registerRoute(
        ioInRegex,
        async ({ url }) => {
            const path = url.pathname.match(ioInRegex)[1];
            let body, type, status, result;
            try {
                let pathExist;
                // Check if path exist
                await ioServer
                    .dirExists(path)
                    .then(exist => {
                        pathExist = exist;
                    })
                    .catch(exist => {
                        pathExist = exist;
                    });

                if (pathExist) {
                    result = await ioServer.serve(path);
                } else {
                    // If not, create full path then serve
                    await ioServer.createPathRecursive(path);
                    result = await ioServer.serve(path);
                }

                body = result.body;
                type = result.type;
                status = 200;
            } catch (err) {
                body = err;
                type = 'text/html';
                // TODO: should probably do a better job here on mapping to err
                status = 404;
            }

            const init = {
                status,
                statusText: 'OK',
                headers: { 'Content-Type': type },
            };

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
                        const result = await ioServer.uploadFiles(files);
                        body = JSON.stringify(result);
                        status = 200;
                    } catch (err) {
                        body = err;
                        status = 404;
                    }

                    const init = {
                        status,
                        statusText: 'OK',
                        headers: { 'Content-Type': type },
                    };

                    return new Response(body, init);
                })
                .catch(err => {
                    return new Response(err);
                });
        },
        'POST'
    );
};
