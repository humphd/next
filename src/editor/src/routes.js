import fs from '../../lib/fs';
const sh = new fs.Shell();

// Returns the URL's paths
function splitURL(urlPath) {
    return urlPath.substr(6).split('/');
}

// Uploads a file into filesystem
async function getRedirectionLink(url) {
    return new Promise((resolve, reject) => {
        const path = url.pathname.match(editRegex)[1];
        const paths = splitURL(url.pathname);
        let folder, file, redirectURL;
        fs.stat(path, (err, stats) => {
            if (err) {
                var redirectURL = `${url.origin}/editor`;
                resolve(redirectURL);
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

            return resolve(redirectURL);
        });
    });
}

const editRegex = /\/edit(\/.*)/;

export default {
    init: (workbox) => {
        // @ts-ignore
        workbox.routing.registerRoute(
            editRegex,
            async ({ url, event }) => {
                let redirectURL = `${url.origin}/editor`;
                try {
                    redirectURL = await getRedirectionLink(url);
                }
                catch(err) {
                    console.log(err);
                }
                
                return Response.redirect(redirectURL);
            },
            'GET'
        );
    }
};
