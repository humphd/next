let dropArea;
let bufferFiles = [];
addEventListener('DOMContentLoaded', function() {
    var filemanager = document.getElementById('filemanager'),
        breadcrumbs = document.getElementById('breadcrumbs'),
        nothingfound = document.getElementById('nothingfound'),
        fileList = document.getElementById('data');

    var breadcrumbsUrls = [];

    // Start by fetching the file data from scan.php with an AJAX request

    function render(entries) {
        var scannedFolders = [],
            scannedFiles = [];

        if (Array.isArray(entries)) {
            entries.forEach(function(entry) {
                if (entry.type === 'DIRECTORY') {
                    scannedFolders.push(entry);
                } else if (entry.type === 'FILE') {
                    scannedFiles.push(entry);
                }
            });
        }

        debugger;
        if (!scannedFolders.length && !scannedFiles.length) {
            nothingfound.style.display = 'block';
        } else {
            nothingfound.style.display = 'none';
        }

        if (scannedFolders.length) {
            scannedFolders.forEach(function(f) {
                var itemsLength = f.size,
                    name = f.name,
                    icon = '<span class="icon folder"></span>';

                if (itemsLength) {
                    icon = '<span class="icon folder full"></span>';
                }

                if (itemsLength == 1) {
                    itemsLength += ' item';
                } else if (itemsLength > 1) {
                    itemsLength += ' items';
                } else {
                    itemsLength = 'Empty';
                }

                var folder = document.createElement('li',{ class: 'folders'});
                folder.innerHTML = 
                    '<a href="' +
                        encodeURI(f.path) +
                        '" title="' +
                        name +
                        '" class="folders">' +
                        icon +
                        '<span class="name">' +
                        name +
                        '</span> <span class="details">' +
                        itemsLength +
                        '</span></a>';

                fileList.appendChild(folder);
            });
        }

        if (scannedFiles.length) {
            scannedFiles.forEach(function(f) {
                var fileSize = bytesToSize(f.size),
                    name = f.name,
                    fileType = name.split('.'),
                    icon = '<span class="icon file"></span>';

                fileType = fileType[fileType.length - 1];

                icon =
                    '<span class="icon file f-' +
                    fileType +
                    '">.' +
                    fileType +
                    '</span>';

                var file = document.createElement('li',{ class: 'files'});
                file.innerHTML = 
                    '<a href="' +
                        encodeURI(f.path) +
                        '" title="' +
                        f.path +
                        '" class="files">' +
                        icon +
                        '<span class="name">' +
                        name +
                        '</span> <span class="details">' +
                        fileSize +
                        '</span></a>';

                fileList.appendChild(file);
            });
        }

        var url = '';

        var nextDir = window.location.href;
        breadcrumbsUrls = generateBreadcrumbs(nextDir);

        breadcrumbsUrls.forEach(function(u, i) {
            var name = u.split('/');

            if (i !== breadcrumbsUrls.length - 1) {
                url +=
                    '<a href="/io/in/' +
                    u +
                    '"><span class="folderName">' +
                    name[name.length - 1] +
                    '</span></a> <span class="arrow">→</span> ';
            } else {
                url +=
                    '<span class="folderName">' +
                    name[name.length - 1] +
                    '</span>';
            }
        });

        breadcrumbs.innerHTML = url;
        fileList.style.display = 'inline-block';
    }

    // Splits a file path and turns it into clickable breadcrumbs
    function generateBreadcrumbs(nextDir) {
        var path = nextDir.substring(nextDir.indexOf('io/in/') + 6);
        path = path.split('/').slice(0);

        for (var i = 1; i < path.length; i++) {
            path[i] = path[i - 1] + '/' + path[i];
        }
        return path;
    }

    // Convert file sizes from bytes to human readable units
    function bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Bytes';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    function handleFileSelect(evt) {
        bufferFiles = [];
        var files = evt.target.files;

        Array.from(files).forEach(file => {
            var reader = new FileReader();
            reader.onloadend = function(e) {
                var buf = new Int8Array(e.target.result);
                var nextDir = window.location.href;
                var path = nextDir.substring(nextDir.indexOf('io/in/') + 5);
                path = path.replace(/\/?$/, '/');
                bufferFiles.push({ name: file.name, buffer: buf, path: path });
            };
            reader.readAsArrayBuffer(file);
        });
    }

    function addForm() {
        $('#dragndrop').append(
            `
            <style>
            #drop-area {
                border: 2px dashed #73879c;
                border-radius: 20px;
                width: 480px;
                font-family: sans-serif;
                margin: 100px auto;
                padding: 20px;
                background-color: #c8dadf;
                outline: #c8dadf solid 5px;
              }
              #drop-area.highlight {
                border-color: purple;
              }
              p {
                margin-top: 0;
              }
              .my-form {
                margin-bottom: 10px;
              }
              #gallery {
                margin-top: 10px;
                display: flex; /* or inline-flex */
                flex-wrap: wrap;
              }
              #gallery img {
                width: 150px;
                margin-bottom: 10px;
                margin-right: 10px;
                vertical-align: middle;
              }
              .button {
                display: inline-block;
                padding: 10px;
                background: #ccc;
                cursor: pointer;
                border-radius: 5px;
                border: 1px solid #ccc;
              }
              .button:hover {
                background: #ddd;
              }
              .button.submit {
                background: #88dae7;
                text-align: center;
              }

              #fileElem {
                display: none;
              }
            </style>

            <div id="drop-area">
                <form class="my-form" method="post" action="/io/import" enctype="multipart/form-data">
                    <p>Upload multiple files with the file dialog or by dragging and dropping files onto the dashed region</p>
                    <input type="file" id="fileElem" multiple onchange="handleFiles(this.files)">
                    <br>
                    <label class="button" for="fileElem">Select some files</label>
                    <div id="gallery"></div>
                    <button type="button" class="button submit" onclick="importFiles();">Import</button>
                </form>
            </div>
            `
        );
    }

    addForm();

    dropArea = document.getElementById('drop-area');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    dropArea.addEventListener('drop', handleDrop, false);

    const url = new URL(window.location.href);
    const path = url.pathname.match(/\/io\/in(\/.*)/)[1];

    fetch(`/io/getentries${path}`, {
        method: 'GET',
    })
        .then(res => {
            console.log(res);
            return res.text();
        })
        .then(data => {
            if (data != '') {
                entries = data.split('},').map(entry => {
                    if (entry.substr(-1) != '}') entry += '}';
                    return JSON.parse(entry);
                });
            }
            // render(entries);
        })
        .catch(err => {
            console.error(err);
        });

    render(entries);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    dropArea.classList.add('highlight');
}

function unhighlight(e) {
    dropArea.classList.remove('highlight');
}

function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;

    handleFiles(files);
}

function handleFiles(files) {
    files = [...files];
    Array.from(files).forEach(file => {
        var reader = new FileReader();
        reader.onloadend = function(e) {
            var buf = new Int8Array(e.target.result);
            var nextDir = window.location.href;
            var path = nextDir.substring(nextDir.indexOf('io/in/') + 5);
            path = path.replace(/\/?$/, '/');
            bufferFiles.push({ name: file.name, buffer: buf, path: path });
        };
        reader.readAsArrayBuffer(file);
    });
    files.forEach(previewFile);
}

function importFiles() {
    let url = document.getElementsByTagName('form')[0].getAttribute('action');

    let formData = new FormData();
    formData.append('file', JSON.stringify(bufferFiles));

    fetch(url, {
        method: 'POST',
        body: formData,
    })
        .then(res => {
            return res.json();
        })
        .then(data => {
            let res = data.every(res => {
                return res.success === true;
            });

            if (res) {
                location.reload();
            } else {
                const result = data
                    .filter(res => res.success == false)
                    .map(res => res.err)
                    .join('\n');

                alert(result);
            }
        })
        .catch(err => {
            /* Error. Inform the user */
            console.error(err);
            alert('Error. Submitting Request!');
        });
}

function importFile(file) {
    // Handle Single file Import
}

function previewFile(file) {
    let reader = new FileReader();
    const otherFileIcon =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEoAAABkCAQAAACLf268AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAAGD4AABg+AdPUS2UAAAAJdnBBZwAAAEoAAABkALqAOqAAAAMMSURBVGje7dtNSBRhHMfx7+yrL4malpkleVCMkIykDhVS9IqXoMAoKToUhYbVYhQWgZUJSV2UsIxyRYJO3XqBIBW6dgh6IcJDwW6HDh2C9WWdDuPDrOvLuOvM7h7+v+fi8zg7+/F5Zp55FvcBgHLu8JUIuk0lxCOqWVZqGSFqG0iVjzTgTpZUzrDtIKP8oZ38ZEgat7mGC8CLD23BA/UlnjBKxKxM8ZIbfE0c9cUY/W20UWroEmTExsUHrjIZ2/SJK7xJ9GQRdHSv/kK3J690f/wwhjmPP7E/zQ/gozSJfpkv0ZlO8eBVTSV000lRIiibo8apggArVWMOF+mnMo0og+WnlV7Wm+9zmOfsSHNPaXg4xgA15q+2MsiRpbyjYygjuxlij1mtoI8W64veseHTZua8GgY4bk7tRXTRYTWl2o5SMafhdfRyiWxVzSZAL2Up7qm5rAJu0Umhqro5wdPFHtgOXuixyeICDyk3G/YxyPYUotQ1NTtuGgmy2WyoI8jBlPfU3Id7PUPsNatVPIm9B1KAmj+beEYTHlVdSw/N+FKAmj0lxKeMHi6b92IhnbSR5TBKZeGVWT4ddJnPxVyuc5MVDveUNctPC31sUNUsAnRRkAKUtuhRLo4SZIuqejnHA4odQymWbrnY3MUQ+xXezSnuK5btqLyZxd0vvlseu5Egp9ViUKOJHuPx47F8ZYKppISfQJgzHCDHor/c5FNMSLEaKaKVz0Y/67n6qE1r9En97PI+mL1lle3D5yFA3XJOUM9JBy70KvppSOzjS2x8NGvGoOfymp02wv7ynlFCRJf8Cje/GWYKYNohlBHracGMi1EO8Q9w4O6LjWYxhcYfbQIzMIISlKAEJShBCSoDIihBCUpQghKUoDIgghKUoAQlKEEJKgMiKEEJSlCCEpSg0hb5x7agBJX+CEpQ9qPGASbUNwjTmBATxg/jHsaohkm60ViTRlKYe2q71FjcBrH0ZUKRprnr5Fa65MqwsevAmU2HyZQoI9SCGwjzjgiryXP2a4MWGecHj2nnG/wHw+hQhehxcv0AAAAldEVYdGRhdGU6Y3JlYXRlADIwMTItMDItMjlUMDA6NTk6MjAtMDg6MDD1UEWgAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDEyLTAyLTI5VDAwOjU5OjIwLTA4OjAwhA39HAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAASUVORK5CYII=';
    reader.readAsDataURL(file);
    console.log(file.name);
    reader.onloadend = function() {
        let div = document.createElement('div');
        div.style.maxWidth = '120px';

        let p = document.createElement('p');
        p.innerHTML = file.name;
        p.style.textAlign = 'center';
        p.style.maxWidth = '110px';

        let img = document.createElement('img');
        img.style.maxWidth = '110px';
        img.style.maxHeight = '110px';

        if (
            reader.result.substr(0, reader.result.indexOf('/')) == 'data:image'
        ) {
            img.src = reader.result;
        } else {
            img.src = otherFileIcon;
        }

        div.appendChild(img);
        div.appendChild(p);
        document.getElementById('gallery').appendChild(div);
    };
}
