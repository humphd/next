import { format404 } from './web-server/html-formatter';
import { getMimeType } from './web-server/content-type';

const wwwRegex = /\www(\/.*)/;

export default(workbox, webServer) => {
    // @ts-ignore
    workbox.routing.registerRoute(
        wwwRegex,
        async ({ url }) => {
            const path = url.match(wwwRegex)[1];
            let body;
            let type;
            try {
                body = await webServer.serve(path);
                type = getMimeType(path); 
            } catch (err) {
                body = format404(path);
                type = 'text/html';
            }

            const init = {
                status: 200,
                statusText: 'OK',
                headers: {'Content-Type': type}
            };

            return new Response(body, init);
        },
        'GET'
    );
};
