// returns an array where first position is tha table name and the second is the property to be updated(if present).
const pathFromUrl = (url, match = '') => {
    return url.substr(url.indexOf(match) + match.length + 1).split('/');
};
// endpoints to be trimmed from urls
const apiUrl = 'data/api',
    uploadUrl = 'data/upload',
    downloadUrl = 'data/download';

// regex to match different endpoints
const apiRegex = /\/data\/api.*/,
    uploadRegex = /\/data\/upload.*/,
    downloadRegex = /\/data\/download.*/;

export default (workbox, db) => {
    workbox.routing.registerRoute(
        downloadRegex,
        async () => {
            let message = null;
            let ok = true;
            try {
                message = await db.downloadDb();
            } catch (err) {
                console.error(err);
                message = err.message;
                ok = false;
            }
            return new Response(
                JSON.stringify({ ok: ok, query: message, method: 'GET' })
            );
        },
        'GET'
    );

    workbox.routing.registerRoute(
        uploadRegex,
        async ({ event }) => {
            return event.request.json().then(async payload => {
                let message = null;
                let ok = true;
                try {
                    message = await db.uploadDb(payload);
                } catch (err) {
                    console.error(err);
                    message = err.message;
                    ok = false;
                }
                return new Response(
                    JSON.stringify({ ok: ok, query: message, method: 'POST' })
                );
            });
        },
        'POST'
    );

    // @ts-ignore
    workbox.routing.registerRoute(
        apiRegex,
        async ({ url }) => {
            const params = pathFromUrl(url.pathname, apiUrl);
            let message = null;
            let ok = true;
            try {
                message = await db.getData({
                    tableName: params[0],
                    propertyName: params[1],
                    value: params[2],
                });
            } catch (err) {
                console.error(err);
                message = err.message;
                ok = false;
            }
            return new Response(
                JSON.stringify({ ok: ok, query: message, method: 'GET' })
            );
        },
        'GET'
    );

    // @ts-ignore
    workbox.routing.registerRoute(
        apiRegex,
        ({ url, event }) => {
            return event.request.json().then(async payload => {
                const params = pathFromUrl(url.pathname, apiUrl);
                let message = '';
                let ok = true;
                try {
                    message = await db.addData({
                        tableName: params[0],
                        data: payload.data,
                        schema: payload.schema,
                    });
                } catch (err) {
                    console.error(err);
                    message = err.message;
                    ok = false;
                }
                return new Response(
                    JSON.stringify({ ok: ok, query: message, method: 'POST' })
                );
            });
        },
        'POST'
    );

    // @ts-ignore
    workbox.routing.registerRoute(
        apiRegex,
        ({ url, event }) => {
            return event.request.json().then(async payload => {
                const params = pathFromUrl(url.pathname, apiUrl);
                let message = '';
                let ok = true;
                try {
                    message = await db.putData({
                        tableName: params[0],
                        primaryKey: params[1],
                        data: payload.data,
                        schema: payload.schema,
                    });
                } catch (err) {
                    console.error(err);
                    message = err.message;
                    ok = false;
                }
                return new Response(
                    JSON.stringify({ ok: ok, query: message, method: 'PUT' })
                );
            });
        },
        'PUT'
    );

    // @ts-ignore
    workbox.routing.registerRoute(
        apiRegex,
        async ({ url }) => {
            const params = pathFromUrl(url.pathname, apiUrl);
            let message = 0;
            let ok = true;
            try {
                message = await db.deleteData({
                    tableName: params[0],
                    propertyName: params[1],
                    value: params[2],
                });
            } catch (err) {
                console.error(err);
                message = err.message;
                ok = false;
            }
            return new Response(
                JSON.stringify({ ok: ok, query: message, method: 'DELETE' })
            );
        },
        'DELETE'
    );
};
