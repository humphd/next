import path from '../lib/path';
/**
 * Send an Apache-style 404
 */
export const format404 = url => {
    return `<!DOCTYPE html>
            <html><head>
            <title>404 Not Found</title>
            </head><body>
            <h1>Not Found</h1>
            <p>The requested URL ${url} was not found on this server.</p>
            <hr></body></html>`;
};

/**
 * Send an Apache-style directory listing
 */
export const formatDir = (dirPath, entries) => {
    const parent = path.dirname(dirPath);

    const header = `<!DOCTYPE html>
                    <html>
                        <head>
                            <title>Index of IO</title>
                            <link href="/css/styles.css" rel="stylesheet"/>
                        </head>`;

    var len = entries.length,
        output = [];
    for (var i = 0; i < len; i++) {
        let size, filePath;
        if (entries[i].type == 'DIRECTORY') {
            size = entries[i].contents.length;
            filePath = '/io/in' + path.join(dirPath, encodeURIComponent(entries[i].name));
        } else {
            size = entries[i].size;
            filePath = '/io/out' + path.join(dirPath, encodeURIComponent(entries[i].name));
        }
        var entry = {
            name: entries[i].name,
            type: entries[i].type,
            size: size,
            path: filePath,
        };
        output.push(JSON.stringify(entry));
    }

    const body = `  <body>
                        <div class="filemanager">
                            <div class="breadcrumbs"></div>
                            <ul class="data"></ul>
                            <div class="nothingfound">
                                <div class="nofiles"></div>
                                <span>No files here.</span>
                            </div>
                            </br>
                            <div class="container">
                                <form class="box" method="post" action="/io/import" style="display: none;" enctype="multipart/form-data" id="uploadform">
                                    <div class="box__input">
                                        <input class="box__file" type="file" name="files[]" id="file" data-multiple-caption="{count} files selected" multiple />
                                        <label for="file"><strong>Choose a file</strong><span class="box__dragndrop"> or drag it here</span>.</label>
                                        <button type="submit" class="box__button">Upload</button>
                                    </div>
                                    <div class="box__uploading">Uploading&hellip;</div>
                                    <div class="box__success">Done!</div>
                                    <div class="box__error">Error(s): <span></span>.</div>
                                </form>
                            </div>
                        </div>
                        <script> 
                            let entries = '${output}';
                            if ( entries != '') {
                                entries = entries
                                            .split('},')
                                            .map(entry => { if (entry.substr(-1) != '}') entry += '}'; return JSON.parse(entry) });
                            }
                            console.table(entries);
                        </script>
                        <script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>
                        <script src="/scripts/script.js"></script>
                    </body>`;

    const footer = `</html>`;

    return header + body + footer;
};
