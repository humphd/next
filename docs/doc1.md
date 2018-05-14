---
id: doc1
title: Introduction
sidebar_label: Introduction
---


Consider the typical way local web development is done:

* a directory or directories of files
* a code editor for editing these files
* a command line terminal for running various commands
* a browser or testing and debugging code
* a web server for hosting our files in the browser
* a database server for persisting our data

In practical terms, this looks like a series of windows all operating on the same logical set of data, connected via the filesystem and network.

In this project, we aim to recreate this environment in a browser. It will be possible to have multiple tabs/windows all running different aspects of the environment and sharing data. We'll do this by leveraging aspects of the modern web, specifically:

* ```IndexedDB```
* Web Workers, including ```SharedWorker```, ```Worker```, and ```ServiceWorker```
* ```MessageChannel```
* ```CacheStorage```


## History

The ideas being developed here are the enxt step in evolving series of experiments, prototypes, products, and communities all aimed at making desktop-like web development possible in a browser:

* [Nimble](https://wiki.mozilla.org/Webmaker/Concept-Nimble)
* [Filer Browser Filesystem](https://github.com/filerjs/filer)
* [nohost Browser Web Server Prototype](https://github.com/humphd/nohost)
* [Bramble Prototype](https://learning.mozilla.org/blog/webmaker-experiments-with-brackets)
* [Thimble 1.0 (Press Coverage)](https://techcrunch.com/2012/06/18/mozilla-launches-thimble-a-web-based-code-editor-for-teaching-html-and-css/)
* [Thimble 2.0](https://thimble.mozilla.org/)
* [Technical Details of Thimble 2.0](https://blog.humphd.org/thimble-and-bramble/)
* [Why I love working on Mozilla Thimble](https://medium.com/read-write-participate/why-i-love-working-on-mozilla-thimble-8abbac7d1d9b)
* [MakeDrive Browser File Syncing](https://blog.humphd.org/introducing-makedrive/)


## Next Step

Where the previous work was focused on creating tools or products, the next iteration of the plan involves __unbundling__ these technologies into a more flexible dvelopment environment. Rather than creating a single "app", the current project aims to create a connected, interoperable set of web tooling that leverages existing browser and dev tool features, augmenting and connecting them where there are gaps.


## Goals

We hope to build something useful together, and experiment both with web technology, but also web collaboration. Ideally, this would be a different sort of open source project.

To this end, there are a number of initial goals:

* Create a new kind of development environment that runs in your browser, mixing a filesystem, command line shell, runtime, editor, web server, and database
* Do everything in the browser. Avoid or at least delay the use of any server other than for out static hosting
* Make it easy to move data in and out of the browser in various forms
* Create something new without directly competing with the myriad "learning to code" or "online scratchpad" style products, this will be none of those
* Avoid recreating what already exists: we aren't (re)making node.js, try to see how well we can unbundleand expose theweb platform for personal use and development
* Make it easier to work with the existing technologies in your browser
* Blur the line between user and developer
* Integrate documentation, communication, and project technologies
* Try to reach out to a different set of communities through active user support, localization, mentoring of projects, contribution, help students get involved, etc.
* Experiment with loose project boundaries: what we build and how we build it are closely connected
* Help people use, and learn to use, the modern web without becoming a learning platform as such
* Experiment with areas of development that are often neglected
