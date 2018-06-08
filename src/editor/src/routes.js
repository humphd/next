import fs from '../../lib/fs';
const sh = new fs.Shell();

// Returns the URL's paths
function splitURL(urlPath) {
    return urlPath.substr(6).split('/');
}

const editRegex = new RegExp('\/edit(\/.*)/');

export default {
    init: (workbox) => {
        // @ts-ignore
        workbox.routing.registerRoute(
            editRegex,
            async ({ url, event }) => {
                const path = url.pathname.match(editRegex)[1];
                const paths = splitURL(url.pathname);

                let folder = file = redirectURL = "";
                
                // Untested Code!!!!
                fs.stat(path, (err, stats) => {
                    if (err) {
                        redirectURL = `${url.origin}/editor`;
                    }

                    if (stats.isDirectory()) {
                        folder = paths.join('/');
                        redirectURL = `${url.origin}/editor?folder=${folder}`;
                    } else {
                        file = paths[paths.length - 1];
                        paths.pop();
                        folder = paths.join('/');
                        redirectURL = `${url.origin}/editor?folder=${folder}&file=${file}`;
                    }

                    return Response.redirect(redirectURL);
                });
            },
            'GET'
        );
    }
};
