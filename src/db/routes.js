// returns an array where first position is tha table name and the second is the property to be updated(if present).
const pathFromUrl = (url, match = '') => {
    return url.substr(url.indexOf(match) + match.length + 1).split('/');
};

const apiUrl = 'data/api';
const apiRegex = /\/data\/api.*/;

export default (workbox, db) => {
    // @ts-ignore
    workbox.routing.registerRoute(
        apiRegex,
        async ({ url }) => {
            const params = pathFromUrl(url.pathname, apiUrl);
            let message = null;
            try {
                message = await db.getData({
                    tableName: params[0],
                    propertyName: params[1],
                    value: params[2],
                });
            } catch (err) {
                console.error(err);
                message = err.message;
            }
            return new Response(
                JSON.stringify({ query: message, method: 'GET' })
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
                try {
                    payload = JSON.parse(payload);
                    message = await db.addData({
                        tableName: params[0],
                        data: payload.data,
                        schema: payload.schema,
                    });
                } catch (err) {
                    console.error(err);
                    message = err.message;
                }
                return new Response(
                    JSON.stringify({ query: message, method: 'POST' })
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
                try {
                    payload = JSON.parse(payload);
                    message = await db.putData({
                        tableName: params[0],
                        primaryKey: params[1],
                        data: payload.data,
                        schema: payload.schema,
                    });
                } catch (err) {
                    console.error(err);
                    message = err.message;
                }
                return new Response(
                    JSON.stringify({ query: message, method: 'PUT' })
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
            try {
                message = await db.deleteData({
                    tableName: params[0],
                    propertyName: params[1],
                    value: params[2],
                });
            } catch (err) {
                console.error(err);
                message = err.message;
            }
            return new Response(
                JSON.stringify({ query: message, method: 'DELETE' })
            );
        },
        'DELETE'
    );
};
