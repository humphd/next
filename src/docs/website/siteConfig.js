/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config.html for all the possible
// site configuration options.

const siteConfig = {
    title: 'Next',
    tagline: 'An experiment to unbunble the web',
    url: 'https://humphd.github.io',
    //baseUrl: '/next/',
    baseUrl: '/',
    projectName: 'Next',
    organizationName: 'humphd',

    headerLinks: [
        { doc: 'Introduction', label: 'Docs' },
        { doc: 'Community', label: 'API' },
        { page: 'share', label: 'Share' },
        { page: 'terminal', label: 'Terminal' },
        { page: 'www', label: 'Files' },

        { page: 'help', label: 'Help' },
        { blog: true, label: 'Blog' },
    ],

    headerIcon: 'img/database.svg',
    footerIcon: 'img/database.svg',
    favicon: 'img/favicon/database.ico',

    colors: {
        primaryColor: '#E97E61',
        secondaryColor: '#873734',
    },

    copyright:
        'Copyright © ' +
        new Date().getFullYear() +
        ' David Humphrey <david.humphrey@senecacollege.ca>',

    highlight: {
        theme: 'default',
    },

    scripts: ['https://buttons.github.io/buttons.js', '/sw.js'],

    /* On page navigation for the current documentation page */
    onPageNav: 'separate',

    /* Open Graph and Twitter card images */
    ogImage: 'img/database.png',
    twitterImage: 'img/database.png',
};

module.exports = siteConfig;
