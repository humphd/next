---
id: Architecture
title: Architecture
sidebar_label: Architecture
---

An initial design architecture follows. Nothing here is final, and all of it can and will likely change. This is meant to get us started.


## Filesystem

A POSIX-like, node.js inspired filesystem is available. The filesystem is case sensitive, and supports binary and text files, symlinks, etc. in the style of a single-user filesystem (e.g., no permissions or extra security).

Initially we provide the following filesystem layout upon creation

* ```/``` - the root of the filesystem
* ```/bin``` - user defined commands that extend or override the shell built-ins
* ```/temp``` - temporary files, which are automatically cleaned-up at regular intervals
* ```/log``` - error and other info logs from commands and tools


## Editor

We provide a full visual code editor environment. Initially this uses Brackets, but at some point we might alter this and use something newer. The editor has access to everything in the filesystem.


## Command Line Shell

A command line shell is available via ```/terminal``` route (seee below). It allows various built-in, and user-defined commands to be run.

### Built-In Commands

An initial set of built-in commands is available, including:

* ```cd``` - change directory
* ```ls``` - list directory/file info
* ```cp``` - copy a file or folder
* ```mv``` - move a file or folder
* ```mkdir``` - make a directory
* ```rm``` - remove a file or folder
* ```find``` - find files or folders using name pattern matching
* ```grep``` - search for matches within files
* ```cat``` - concatenate a file (or files)
* ```zip``` - zip a file
* ```unzip``` - unzip a file
* ```tar``` - tar or untar a file
* ```du``` - get disk usage info for a folder
* ```data``` - interact with the database (e.g., data get <key> or data del <key>)
* ```encode``` - encode a file as a base64 string
* ```decode``` - decode a file from base64 string
* ```cache``` - cache a file in the browser's Cache Storage
* ```edit``` - open the editor to the given filepath (or root of filesystem)
* ```ln``` - create a symbolic link
* ```touch``` - create an empty file

### Custom Commands

All commands are run in a ```Web Worker```. A "process" like API will be developed to allow new commands to be written, which gives each script access to a set of globals like the filesystem, process info, etc. Input is passed to the worker, and output is returned via ```MessageChannel``` or the like.

User defined commands should be stored in ```/bin```. When a command ```xyz``` is run in the terminal, an associated ```/bin/xyz.js``` will be run first if present before looking for a built-in ```xyz``` command. This enables overriding built-ins.


## URLs

Because everything is unbunbled, URLs play an important role in how we use the various tools and access our data. As a general design guideline, we favour exposing things via URLs, and letting the browser and/or dev tools operate normally on the contents. A typical user will have many tabs or windows open to different parts of the system at one time. Some URLs provide access to raw data, others provide UI to tooling.


## Routes

What follows is an initial layout for what we're building, and is subject to change. Each URL documented below describes a route path, and possibly optional components or arguments that a user can provide.

```/```

The root of the project, which shows appropriate UI for discovering and using the other routes described below. This is the main landing page, but also the control centre for the entire system. It is a Progressive Web App (PWA) which works both online and offline.
/assets

Access to various images, scripts, stylesheets, etc. that are widely needed by our community and not hosted elsewhere.

```/bin```

Built-in commands (```cp```, ```ls```, etc) are stored here. When a command is run, in the terminal, the user's ```/bin``` directory is first used to resolve the command. If it is found, the local filesystem version is run; otherwise, the version available via the ```/bin``` route is used.


```/blog```

The project's blog, which is written by community members. Exposing it as part of the system is important, as we aim to connect our users and developers in ways that most projects don't.


```/data```

The built-in RESTful database API, which provides a key/value store that can be accessed via various HTTP requests:


```/data/reset```

Resets (i.e., destroys) the database. UI provides a safety mechanism that requires user initiated opt-in.
/data/download

Allows downloading a dump of all data in a given database.


```/data/upload```

Allows restoring the database from a given database dump file (i.e., one acquired via ```/data/download```).
```GET /data/api/{key}```

```PUT /data/api/{key}```

```POST /data/api/{key}```

```DELETE /data/api/{key}```

```/docs```

The project's documentation.
```/edit[/path/to/file/or/folder]```

Open the editor to a given file, folder, or if neither is supplied, the entire filesystem.


```/io```

HTTP access to the underlying filesystem, allowing users to move data in and out in various formats:


```/io/in[/path/to/folder]```

Provides UI to allow the user to drag-and-drop or select file(s) on the local computer to be imported into the filesystem. If a path is given, this is used (and created if missing) as the root for this import.


```/io/from/dataurl/{filepath}/{encoded dataurl}```

Creates a file at ```filepath``` with the contents from the given Data URL.


```/io/from/text/{filepath}/{encoded text}```

Creates a file at ```filepath``` with the given encoded text, which is first decoded.


```/io/out/path/to/file```

Downloads the file at the given path.


```/io/to/dataurl/path/to/file```

Redirects to a Data URL that contains the file at ```filepath```


```/io/share[/path/to/file/or/folder]```

Creates a Web Torrent Magnet URL for the portion of the file system specified, or the root (i.e., entire filesystem). This URL can be used to import the files in another browser.


```/io/archive[/path/to/file/or/folder]```

Creates a ```.zip``` archive of the file or folder specified, or the root (i.e., entire filesystem) and downloads it.


```/io/reset```

Resets (i.e., wipes and reformats) the filesystem. UI provides a safety mechanism that requires user initiated opt-in.


```/lib```

Various system libraries, for example, the filesystem. These libraries are used by commands in ```/bin```, and are exposed individually so users can override and create their own versions.


```/terminal[/path/to/folder]```

Open a terminal to the given folder (created if it doesn't exist) if provided, or the root of the filesystem if none given.


```/www[/path/to/file/or/folder]```

Browse to a given file, folder, or if neither is supplied, the entire filesystem.
