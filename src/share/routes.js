import { format404 } from '../lib/html-formatter';

const importRegex = /\/import(\/*)/;
const exportRegex = /\/export(\/*)/;
const shareRegex = /\/share(\/?)$/;
//open package.json post build-server
export default (workbox, Share) => {
    workbox.routing.registerRoute(
        shareRegex,
        async ({ url }) => {
            return fetch('./index.html');
        },
        'GET'
    );

    workbox.routing.registerRoute(
        importRegex,
        async ({ url }) => {
            return fetch('./import.html');
        },
        'GET'
    );

    workbox.routing.registerRoute(
        exportRegex,
        async ({ url }) => {
            return fetch('./export.html');
        },
        'GET'
    );
};
