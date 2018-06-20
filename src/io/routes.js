import { fullyDecodeURI } from '../lib/utils';
import formatFS from '../lib/format-fs';

const ioEntriesRegex = /\/io\/getentries(\/.*)/;
const ioInRegex = /\/io\/in(\/.*)/;
const ioResetRegex = /\/io\/reset/;
const ioRemoveRegex = /\/io\/remove(\/.+)/;
const ioToRegex = /\/io\/to\/dataurl(\/.*)/;
const ioOutRegex = /\/io\/out(\/.*)/;
const ioImportRegex = /\/io\/import/;
const ioFromTextRegex = /\/io\/from\/text(\/.*)/;
const ioFromDataURIRegex = /\/io\/from\/dataurl(\/.*)/;

// Handles the response status
function handleResponseStatus(status, statusText, type) {
    return {
        status,
        statusText: 'OK',
        headers: { 'Content-Type': type },
    };
}

const constructResponse = async func => {
    let body;
    try {
        const result = await func();
        body = result.body;
        let status = 200;
        let statusText = 'OK';
        let type = result.type;
        const init = handleResponseStatus(status, statusText, type);

        return new Response(body, init);
    } catch (err) {
        console.error(err);
        body = err.message;
        constructInternalError(body);
    }
};

const constructInternalError = async message => {
    return new Response(message, {
        status: 500,
        statusText: 'Internal Server Error',
        headers: { 'Content-Type': 'text/html' },
    });
};

export default (workbox, ioServer) => {
    workbox.routing.registerRoute(
        ioInRegex,
        async ({ url }) => {
            const path = fullyDecodeURI(url.pathname.match(ioInRegex)[1]);
            try {
                await ioServer.createPath(path);
                return fetch('/io/io.html');
            } catch (err) {
                constructInternalError(err);
            }
        },
        'GET'
    );

    workbox.routing.registerRoute(
        ioEntriesRegex,
        async ({ url }) => {
            const path = fullyDecodeURI(url.pathname.match(ioEntriesRegex)[1]);
            return await constructResponse(async () => {
                return await ioServer.getEntries(path);
            });
        },
        'GET'
    );

    workbox.routing.registerRoute(
        ioRemoveRegex,
        async ({ url }) => {
            const path = fullyDecodeURI(url.pathname.match(ioRemoveRegex)[1]);
            try {
                await ioServer.deletePath(path);
                return Response.redirect(`${url.origin}/io/in/`);
            } catch (err) {
                constructInternalError(err);
            }
        },
        'GET'
    );

    workbox.routing.registerRoute(
        ioImportRegex,
        async ({ event }) => {
            let formData;
            try {
                formData = await event.request.formData();
                return await constructResponse(async () => {
                    var files = JSON.parse(formData.get('file'));
                    const result = await ioServer.importFiles(files);
                    return {
                        body: JSON.stringify(result),
                        type: 'application/json',
                    };
                });
            } catch (err) {
                return constructInternalError(err);
            }
        },
        'POST'
    );

    workbox.routing.registerRoute(
        ioFromTextRegex,
        async ({ url }) => {
            const path = fullyDecodeURI(url.pathname.match(ioFromTextRegex)[1]);
            try {
                const result = await ioServer.createFileFromEncodedText(path);
                return Response.redirect(`${url.origin}/io/in${result.path}`);
            } catch (err) {
                constructInternalError(err);
            }
        },
        'GET'
    );

    workbox.routing.registerRoute(
        ioFromDataURIRegex,
        async ({ url }) => {
            const path = fullyDecodeURI(
                url.pathname.match(ioFromDataURIRegex)[1]
            );
            try {
                const result = await ioServer.createFileFromEncodedDataURI(
                    path
                );
                return Response.redirect(`${url.origin}/io/in${result.path}`);
            } catch (err) {
                constructInternalError(err);
            }
        },
        'GET'
    );

    workbox.routing.registerRoute(
        ioOutRegex,
        async ({ url }) => {
            let path = fullyDecodeURI(url.pathname.match(ioOutRegex)[1]);
            return await constructResponse(async () => {
                const result = await ioServer.getFile(path);
                return { body: result.body, type: 'application/octet-stream' };
            });
        },
        'GET'
    );

    workbox.routing.registerRoute(
        ioToRegex,
        async ({ url }) => {
            const path = fullyDecodeURI(url.pathname.match(ioToRegex)[1]);
            try {
                return await constructResponse(async () => {
                    const result = await ioServer.getFileDataURL(path);
                    const body = `
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
                    return { body: body, type: 'text/html' };
                });
            } catch (err) {
                constructInternalError(err);
            }
        },
        'GET'
    );

    workbox.routing.registerRoute(
        ioResetRegex,
        async ({ url }) => {
            try {
                await formatFS();
                return Response.redirect(`${url.origin}/io/in/`);
            } catch (err) {
                constructInternalError(err);
            }
        },
        'GET'
    );
};
