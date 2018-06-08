// Returns the URL's paths
function splitURL(urlPath) {
    return urlPath.substr(6).split('/');
}

// Determines whether path is a file
function isFile(pathname) {
    return pathname.split('/').pop().indexOf('.') > -1;
}

// Determines whether path is a directory
function isDir(pathname) { return !isFile(pathname); }

const editRegex = new RegExp('\/edit(\/.*)/');

export default {
    init: (workbox) => {
        // @ts-ignore
        workbox.routing.registerRoute(
            editRegex,
            async ({ url, event }) => {
                const paths = splitURL(url.pathname);

                let folder = file = redirectURL = "";

                // If URL contains a file
                if (isFile(paths[paths.length - 1])) {
                    file = paths[paths.length - 1];
                    paths.pop();
                    folder = paths.join('/');
                    redirectURL = `${url.origin}/editor?folder=${folder}&file=${file}`;
                }
                else {
                    folder = paths.join('/');
                    redirectURL = `${url.origin}/editor?folder=${folder}`;
                }

                return fetch(event.request)
                    .then((response) => {
                        return response.text();
                    })
                    .then((responseBody) => {
                        return Response.redirect(redirectURL);
                    });
            },
            'GET'
        );
    }
};