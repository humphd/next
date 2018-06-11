import { formatDir, format404 } from './html-formatter';
import scriptIn from './in.js';

const ioInRegex = /\/io\/in(\/.*)/;
const ioImportRegex = /\/io\/import/;

export default (workbox, ioServer) => {
    // @ts-ignore
    workbox.routing.registerRoute(
        ioInRegex,
        async ({ url }) => {
            const path = url.pathname.match(ioInRegex)[1];
            let body;
            let type;
            let status;
            try {
                // const result1 = await ioServer.createPath();
                const result = await ioServer.serve(path);
                body = result.body;
                type = result.type;
                status = 200;
            } catch (err) {
                body = format404(path);
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
            return event.request.formData().then(async formData => {
                return new Response(
                    formData.getAll('name')
                );
            }).catch(err => { return new Response(
                err
            ); });
        },
        'POST'
    );
};
