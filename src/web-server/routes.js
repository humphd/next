import { format404, format404AsJson } from './html-formatter';
import fs from '../lib/fs';

const wwwRegex = /\/www(\/.*)/;
const wwwJsonRegex = /\/www\/json(\/.*)/;

/**
 * Constructs a Response based on the success of the __func__ parameter.
 * This function assumes that return of the __func__ and __handle404__ will be an object containing __type__ and __body__.
 *
 * **E.g.**
 *
 * { type: 'html/text', body: '...'}
 * @param {*} param0 receives a __func__ reference to the main function to be called;
 *  __handle404__ function to be called in case error occured.
 */
const constructResponse = async ({ func, handle404 }) => {
    let res;
    let status;
    try {
        res = await func();
        status = 200;
    } catch (err) {
        res = handle404();
        // TODO: should probably do a better job here on mapping to err
        status = 404;
    }

    const config = {
        status,
        statusText: 'OK',
        headers: { 'Content-Type': res.type },
    };
    return new Response(res.body, config);
};

export default (workbox, webServer) => {
    // Cache service-worker icon files (PNG) in the root
    workbox.routing.registerRoute(
        /[^/]+\.png/,
        workbox.strategies.staleWhileRevalidate()
    );

    workbox.routing.registerRoute(
        wwwJsonRegex,
        async ({ url }) => {
            const path = url.pathname.match(wwwJsonRegex)[1];
            // optionally check if we want to get file content,too
            const getFileContent = !!url.searchParams.get('content');
            return await constructResponse({
                func: ((getContent, path) =>
                    new Promise((resolve, reject) => {
                        // run ls on the file
                        fs.stat(path, (err, stats) => {
                            if (err) {
                                return reject(err);
                            }
                            if (getContent) {
                                // get file content and append to response as `content` and `contentType`
                                webServer.serve(path).then(res => {
                                    resolve({
                                        type: 'application/json',
                                        body: JSON.stringify({
                                            metadata: stats,
                                            content: res.body,
                                            contentType: res.type,
                                        }),
                                    });
                                });
                            } else {
                                resolve({
                                    type: 'application/json',
                                    body: JSON.stringify({ metadata: stats }),
                                });
                            }
                        });
                    })).bind(null, getFileContent, path, webServer),
                handle404: format404AsJson.bind(null, path),
            });
        },
        'GET'
    );

    // @ts-ignore
    workbox.routing.registerRoute(
        wwwRegex,
        async ({ url }) => {
            const path = url.pathname.match(wwwRegex)[1];

            return await constructResponse({
                func: webServer.serve.bind(webServer, path),
                handle404: format404.bind(null, path),
            });
        },
        'GET'
    );
};
