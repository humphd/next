window.addEventListener('load', () => {
    const container = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file');
    const uploadButton = document.getElementById('upload');
    const clearButton = document.getElementById('clear');
    const downloadButton = document.getElementById('download');
    const deleteButton = document.getElementById('delete');
    const dlAnchorElem = document.getElementById('downloadAnchorElem');

    // intialize drag and drop zone
    container.ondragover = container.ondragenter = e => {
        e.preventDefault();
    };

    container.onmouseenter = () => {
        container.classList.add('mouse-over');
    };

    container.onmouseleave = () => {
        container.classList.remove('mouse-over');
    };

    // reuse the same function for file input field change and zone drop events
    container.ondrop = fileInput.onchange = e => {
        if (e.dataTransfer) {
            fileInput.files = e.dataTransfer.files;
        }
        if (fileInput.files.length) {
            container.textContent = `Received ${
                fileInput.files.item(fileInput.files.length - 1).name
            }`;
        }
        e.preventDefault();
    };

    // trigger file browsing on click of the zone
    container.onclick = () => {
        fileInput.click();
    };

    // attempt to upload the file. NOTE only the last file is used, if multiple files are droped.
    uploadButton.onclick = () => {
        if (!fileInput.files.length) {
            document.getElementById('result').innerText =
                'Please supply a file before attempting an upload.';
            return;
        }

        const file = fileInput.files.item(fileInput.files.length - 1);

        if (file.type !== 'application/json') {
            document.getElementById('result').innerText =
                'Only JSON files are accepted as valid upload target.';
            return;
        }

        const reader = new FileReader();

        // This fires after the blob has been read/loaded.
        reader.onload = e => {
            const text = e.srcElement.result;

            fetch(
                new Request(encodeURI('/data/upload'), {
                    method: 'POST',
                    body: text,
                })
            )
                .then(res => {
                    if (!res.ok) {
                        throw `${res.status}. ${res.statusText} for ${res.url}`;
                    }
                    return res.json();
                })
                .then(data => {
                    if (!data.ok) {
                        throw `Unable to upload. ${data.message}`;
                    }
                    document.getElementById('result').innerText =
                        'Succesfully uploaded.';
                })
                .catch(err => {
                    document.getElementById('result').innerText = err;
                });
        };

        // Start reading the blob as text.
        reader.readAsText(file.slice());
    };

    // clear file input field from any files
    clearButton.onclick = () => {
        fileInput.value = '';
        container.textContent = 'Drop files here...';
    };

    // attempt to download database schema into a json file
    downloadButton.onclick = () => {
        fetch(
            new Request(encodeURI('/data/download'), {
                method: 'GET',
                body: null,
            })
        )
            .then(res => {
                if (!res.ok) {
                    throw `${res.status}. ${res.statusText} for ${res.url}`;
                }
                return res.json();
            })
            .then(data => {
                if (!data.ok) {
                    throw `Unable to download. ${data.message}`;
                }
                document.getElementById('result').innerText =
                    'Successfully downloaded.';
                const dataStr =
                    'data:text/json;charset=utf-8,' +
                    encodeURIComponent(JSON.stringify(data.query));

                dlAnchorElem.setAttribute('href', dataStr);
                dlAnchorElem.setAttribute('download', 'db.json');
                dlAnchorElem.click();
            })
            .catch(err => {
                document.getElementById('result').innerText = err;
            });
    };

    deleteButton.onclick = () => {
        fetch(
            new Request(encodeURI('/data/reset'), {
                method: 'DELETE',
                body: null,
            })
        )
            .then(res => {
                if (!res.ok) {
                    throw `${res.status}. ${res.statusText} for ${res.url}`;
                }
                return res.json();
            })
            .then(data => {
                if (!data.ok) {
                    throw `Unable to reset. ${data.message}`;
                }
                document.getElementById('result').innerText =
                    'Succesfully deleted.';
            })
            .catch(err => {
                document.getElementById('result').innerText = err;
            });
    };
});
