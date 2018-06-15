// returns an array where first position is tha table name and the second is the property to be updated(if present).
const pathFromUrl = (url, match = '') => {
    return url.substr(url.indexOf(match) + match.length + 1).split('/');
};

const constructResponse = async func => {
    let message = null;
    let ok = true;
    try {
        message = await func();
    } catch (err) {
        console.error(err);
        message = err.message;
        ok = false;
    }
    return new Response(JSON.stringify({ ok: ok, message: message }));
};

const constructInternalError = async message => {
    return new Response(JSON.stringify({ ok: false, message: message }), {
        status: 500,
        statusText: 'Internal Server Error',
    });
};
// endpoints to be trimmed from urls
const apiUrl = 'data/api';

// regex to match different endpoints
const apiRegex = /\/data\/api.*/;
const uploadRegex = /\/data\/upload.*/;
const downloadRegex = /\/data\/download.*/;
const resetRegex = /\/data\/reset.*/;

export default (workbox, db) => {
    workbox.routing.registerRoute(
        resetRegex,
        async () => {
            return await constructResponse(db.delete.bind(db, true));
        },
        'DELETE'
    );

    workbox.routing.registerRoute(
        downloadRegex,
        async () => {
            return await constructResponse(db.download.bind(db));
        },
        'GET'
    );

    workbox.routing.registerRoute(
        uploadRegex,
        async ({ event }) => {
            let payload = null;
            try {
                payload = await event.request.json();
            } catch (err) {
                return constructInternalError(
                    'Request body is not a valid JSON.'
                );
            }
            return await constructResponse(db.upload.bind(db, payload));
        },
        'POST'
    );

    // @ts-ignore
    workbox.routing.registerRoute(
        apiRegex,
        async ({ url }) => {
            const params = pathFromUrl(url.pathname, apiUrl);
            return await constructResponse(
                db.getData.bind(db, {
                    tableName: params[0],
                    propertyName: params[1],
                    value: params[2],
                })
            );
        },
        'GET'
    );

    // @ts-ignore
    workbox.routing.registerRoute(
        apiRegex,
        async ({ url, event }) => {
            let payload = null;
            try {
                payload = await event.request.json();
            } catch (err) {
                return constructInternalError(
                    'Request body is not a valid JSON.'
                );
            }
            const params = pathFromUrl(url.pathname, apiUrl);
            return await constructResponse(
                db.addData.bind(db, {
                    tableName: params[0],
                    data: payload.data,
                    schema: payload.schema,
                })
            );
        },
        'POST'
    );

    // @ts-ignore
    workbox.routing.registerRoute(
        apiRegex,
        async ({ url, event }) => {
            let payload = null;
            try {
                payload = await event.request.json();
            } catch (err) {
                return constructInternalError(
                    'Request body is not a valid JSON.'
                );
            }
            const params = pathFromUrl(url.pathname, apiUrl);
            return await constructResponse(
                db.putData.bind(db, {
                    tableName: params[0],
                    primaryKey: params[1],
                    data: payload.data,
                    schema: payload.schema,
                })
            );
        },
        'PUT'
    );

    // @ts-ignore
    workbox.routing.registerRoute(
        apiRegex,
        async ({ url }) => {
            const params = pathFromUrl(url.pathname, apiUrl);
            return await constructResponse(
                db.deleteData.bind(db, {
                    tableName: params[0],
                    propertyName: params[1],
                    value: params[2],
                })
            );
        },
        'DELETE'
    );
};
