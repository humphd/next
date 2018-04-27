# unbundled

> "There's only two ways: bundling and unbundling." &mdash;Jim Barksdale

This is an attempt at unbundling the web.

*Note: until we figure out a name and register a domain, we'll call this
project "unbundled".*

## Introduction

Consider the typical way local web development is done:

* a directory or directories of files
* a code editor for editing these files
* a command line terminal for running various commands
* a browser for testing and debugging code
* a web server for hosting our files in the browser
* a database server for persisting our data

In practical terms this looks like a series of windows all operating on the
same logical set of data, connected via the filesystem and network.

In this project, we aim to recreate this environment in a browser.  It will
be possible to have multiple tabs/windows all running different aspects
of the environment and sharing data.  We'll do this by leveraging
aspects of the modern web, specifically:

* `IndexedDB`
* Web Workers, including `SharedWorker`, `Worker`, and `ServiceWorker`
* `MessageChannel`
* `CacheStorage`

### History

The ideas being developed here are the next step in an evolving series of experiments, prototypes, products, and communities all aimed at making desktop-like web development possible in a browser:

* [Nimble](https://wiki.mozilla.org/Webmaker/Concept-Nimble)
* [Filer Browser Filesystem](https://github.com/filerjs/filer)
* [nohost Browser Web Server Prototype](https://github.com/humphd/nohost)
* [Bramble Prototype](https://learning.mozilla.org/blog/webmaker-experiments-with-brackets)
* [Thimble 1.0 (Press Coverage)](https://techcrunch.com/2012/06/18/mozilla-launches-thimble-a-web-based-code-editor-for-teaching-html-and-css/)
* [Thimble 2.0](https://thimble.mozilla.org/)
* [Technical Details of Thimble 2.0](https://blog.humphd.org/thimble-and-bramble/)
* [Why I love working on Mozilla Thimble](https://medium.com/read-write-participate/why-i-love-working-on-mozilla-thimble-8abbac7d1d9b)
* [MakeDrive Browser File Syncing](https://blog.humphd.org/introducing-makedrive/)

### Next Step

Where the previous work was focused on creating a tools or products, the next
iteration of the plan involves **unbundling** these technologies
into a more flexible development environment.  Rather than creating a single "app," the current project aims to create a connected, interoperable set of web tooling that leverages existing browser and dev tool features, augmenting and connecting them where there are gaps.

### Goals

We hope to build something useful together, and experiment both with web
technology, but also web collaboration.  Ideally, this would be a different
sort of open source project.

To this end, there are a number of initial goals:

* Create a new kind of development environment that runs in your browser, mixing a filesystem, command line shell, runtime, editor, web server, and database
* Do everything in the browser. Avoid or at least delay the use of any server other than for our static hosting
* Make it easy to move data in and out of the browser in various forms.
* Create something new without directly competing with the myriad "learning to code" or "online scratchpad" style products.  This will be none of those.
* Avoid recreating what already exists: we aren't (re)making node.js.  Instead, try to see how well we can unbundle and expose the web platform for personal use and development
* Make it easier to work with the existing technologies in your browser
* Blur the line between user and developer
* Integrate documentation, communication, and project technologies.
* Try to reach out to a different set of communities through active user support, localization, mentoring of project contribution, help students get involved, etc.
* Experiment with loose project boundaries: what we build and how we build it are closely connected
* Help people use, and learn to use, the modern web without becoming a learning platform as such
* Experiment with areas of development that are often neglected

## Architecture

An initial design architecture follows.  Nothing here is final, and all of it
can will will likely change.  This is meant to get us started.

### Filesystem

A POSIX-like, node.js inspired filesystem is available.  The filesystem is
case sensitive, and supports binary and text files, symlinks, etc. in the style of a single-user filesystem (e.g., no permissions or extra security).

Initially we provide the following filesystem layout upon creation

* `/` - the root of the filesystem
* `/bin` - user defined commands that extend or override the shell built-ins
* `/tmp` - temporary files, which are automatically cleaned-up at regular intervals
* `/log` - error and other info logs from commands and tools

### Editor

We provide a full visual code editor environment.  Initially this uses Brackets,
but at some point we might alter this and use something newer.  The editor
has access to everything in the filesystem.

### Command Line Shell

A command line shell is available via the `/terminal` route (see below).
It allows various built-in, and user-defined commands to be run.

#### Built-In Commands

An initial set of built-in commands is available, including:

* `cd` - change directory
* `ls` - list directory/file info
* `cp` - copy a file or folder
* `mv` - move a file or folder
* `mkdir` - make a directory
* `rm` - remove a file or folder
* `find` - find files or folders using name pattern matching
* `grep` - search for matches within files
* `cat` - concatenate a file (or files)
* `zip` - zip a file
* `unzip` - unzip a file
* `tar` - tar or untar a file
* `du` - get disk usage info for a folder
* `data` - interact with the database (e.g., `data get <key>` or `data del <key>`)
* `encode` - encode a file as a base64 string
* `decode` - decode a file from base64 string
* `cache` - cache a file in the browser's `Cache Storage`
* `edit` - open the editor to the given filepath (or root of filesystem)
* `ln` - create a symbolic link
* `touch` - create an empty file

#### Custom Commands

All commands are run in a `Web Worker`.  A "process" like API will be developed
to allow new commands to be written, which gives each script access to a set of globals like the filesystem, process info, etc.  Input is passed to the worker, and output is returned via `MessageChannel` or the like.

User defined commands should be stored in `/bin`.  When a command `xyz` is run
in the terminal, an associated `/bin/xyz.js` will be run first if present
before looking for a built-in `xyz` command.  This enables overriding built-ins.

### URLs

Because everything is unbunbled, URLs play an important role in how we use
the various tools and access our data.  As a general design guideline, we
favour exposing things via URLs, and letting the browser and/or dev tools
operate normally on the contents.  A typical user will have many tabs
or windows open to different parts of the system at one time. Some URLs provide access to raw data, others provide UI to tooling.

### Routes

What follows is an initial layout for what we're building, and is subject
to change.  Each URL documented below describes a route path, and possibly
optional components or arguments that a user can provide.

#### `/`

The root of the project, which shows appropriate UI for discovering and using the other routes described below.  This is the main landing page, but also the control centre for the entire system.  It is a Progressive Web App (PWA) which works both online and offline.

#### `/assets`

Access to various images, scripts, stylesheets, etc. that are widely needed by our community and not hosted elsewhere.

#### `/blog`

The project's blog, which is written by community members.  Exposing it as part of the system is important, as we aim to connect our users and developers in ways that most projects don't.

#### `/data`

The built-in RESTful database API, which provides a key/value store that
can be accessed via various HTTP requests:

##### `/data/reset`

Resets (i.e., destroys) the database.  UI provides a safety
mechanism that requires user initiated opt-in.

##### `/data/download`

Allows downloading a dump of all data in a given database.

##### `/data/upload`

Allows restoring the database from a given database dump file (i.e., 
one acquired via `/data/download`).

##### `GET /data/api/{key}`

##### `PUT /data/api/{key}`

##### `POST /data/api/{key}`

##### `DELETE /data/api/{key}`

#### `/docs`

The project's documentation.

#### `/edit[/path/to/file/or/folder]`

Open the editor to a given file, folder, or if neither is supplied, the entire
filesystem.

#### `/io`

HTTP access to the underlying filesystem, allowing users to move data in and
out in various formats:

##### `/io/in[/path/to/folder]`

Provides UI to allow the user to drag-and-drop or select file(s) on the local computer to be imported into the filesystem.  If a path is given, this is used (and created if missing) as the root for this import.

##### `/io/from/dataurl/{filepath}/{encoded dataurl}`

Creates a file at `filepath` with the contents from the given Data URL.

##### `/io/from/text/{filepath}/{encoded text}`

Creates a file at `filepath` with the given encoded text, which is first decoded.

##### `/io/out/path/to/file`

Downloads the file at the given path.

##### `/io/to/dataurl/path/to/file`

Redirects to a Data URL that contains the file at `filepath`

##### `/io/share[/path/to/file/or/folder]`

Creates a Web Torrent Magnet URL for the portion of the file system specified,
or the root (i.e., entire filesystem).  This URL can be used to import the
files in another browser.

##### `/io/archive[/path/to/file/or/folder]`

Creates a `.zip` archive of the file or folder specified, or the root
(i.e., entire filesystem) and downloads it.

##### `/io/reset`

Resets (i.e., wipes and reformats) the filesystem.  UI provides a safety
mechanism that requires user initiated opt-in.

#### `/terminal[/path/to/folder]`

Open a terminal to the given folder (created if it doesn't exist) if provided, or the root of the filesystem if none given.

#### `/www[/path/to/file/or/folder]`

Browse to a given file, folder, or if neither is supplied, the entire
filesystem.

## Technologies

We'll leverage a number of existing technologies and projects, including:

* https://github.com/filerjs/filer or https://github.com/jvilk/BrowserFS for our filesystem.
* https://github.com/xtermjs/xterm.js for our command line shell
* https://github.com/mozilla/brackets for our editor
* https://webtorrent.io/ for sharing filesystems between browsers
* https://github.com/GoogleChrome/workbox for our ServiceWorker routing and offline cache support
* https://docusaurus.io/en/ or https://www.gatsbyjs.org/ for our static site  content/layout

An important goal will be to enable lots of people to get involved, especially non-experts.  To do this, we need to build our code in such a way that it can be developed on Windows, macOS, or Linux.

We'll only support browsers that implement the standards we need in the Web API (i.e., we won't use all kinds of shims and workarounds).

We'll use auto-deployment from TravisCI to GitHub Pages to host our content.

## Community

As mentioned above, a major set of goals for the project is to blur the line
between user and developer, client and server, as well as documentation and source code. To achieve this, a number of philosophies about how the project is
run will be practiced

Where possible, we favour the contributor over the process.  As much as we can, we will seek to remove barriers to having people contribute, and try to get people involved vs. maintaining some aspirational but impractical level of quality.  If we break something, we'll fix it as we go.  Don't let that stop people from trying.

Another way to do this is through automation.  Things like using prettier, simplifying our source tree, using Markdown whenever possible and building web content, automatic deployment, etc.

We will use Issues for more than just technical discussions.  Users can ask questions, and we'll migrate answers to Markdown `/docs` files whenever we can.  We'll also encourage developers and users to contribute to the project's `/blog` and tell us what they're doing, how they're using the project, what they've built, ideas they have, cool things they're learning, etc.

We'll attempt to give-back to the communities building tech we use.  Our developers will work on PRs and provide help to the projects that are helping us.