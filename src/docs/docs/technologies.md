---
id: technologies
title: Technologies
sidebar_label: Technologies
---

We'll leverage a number of existing technologies and projects, including:

* [https://github.com/filerjs/filer](https://github.com/filerjs/filer) or [https://github.com/jvilk/BrowserFS](https://github.com/jvilk/BrowserFS) for our filesystem.
* [https://github.com/xtermjs/xterm.js](https://github.com/xtermjs/xterm.js) for our command line shell
* [https://github.com/mozilla/brackets](https://github.com/mozilla/brackets) for our editor
* [https://webtorrent.io/](https://webtorrent.io/) for sharing filesystems between browsers
* [https://github.com/GoogleChrome/workbox](https://github.com/GoogleChrome/workbox) for our ServiceWorker routing and offline cache support
* [https://docusaurus.io/en/](https://docusaurus.io/en/) or [https://www.gatsbyjs.org/](https://www.gatsbyjs.org/) for our static site content/layout

An important goal will be to enable lots of people to get involved, especially non-experts. To do this, we need to build our code in such a way that it can be developed on Windows, macOS, or Linux.

We'll only support browsers that implement the standards we need in the Web API (i.e., we won't use all kinds of shims and workarounds).

We'll use auto-deployment from TravisCI to GitHub Pages to host our content.
