import fs from '../../lib/fs';
const sh = new fs.Shell();
import path from '../../lib/path';

// Uploads a file into filesystem
async function getRedirectionLink(url, editRegex) {
    return new Promise((resolve, reject) => {
        const pathDir = url.pathname.match(editRegex)[1];
        let folder, file, redirectURL;
        fs.stat(pathDir, (err, stats) => {
            if (err) {
                var redirectURL = `${url.origin}/editor`;
                return reject(redirectURL);
            }
            if (stats.isDirectory()) {
                folder = pathDir;
                redirectURL = `${url.origin}/editor?folder=${folder}`;
            } else {
                file = path.basename(pathDir);
                folder = path.dirname(pathDir);
                redirectURL = `${
                    url.origin
                }/editor?folder=${folder}&file=${file}`;
            }

            return resolve(redirectURL);
        });
    });
}

const editRegex = /\/edit(\/.*)/;

export default {
    init: workbox => {
        // @ts-ignore
        workbox.routing.registerRoute(
            editRegex,
            async ({ url, event }) => {
                let redirectURL = `${url.origin}/editor`;
                try {
                    redirectURL = await getRedirectionLink(url, editRegex);
                } catch (err) {
                    console.error(err);
                }

                return Response.redirect(redirectURL);
            },
            'GET'
        );
    },
};
