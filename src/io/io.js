import iconFile from './icons/file.png';
import strongDataUri from 'strong-data-uri';
import { fullyDecodeURI } from '../lib/utils';
import pth from '../lib/path';
import { formatSize } from '../lib/utils';
import { blobToBuffer } from './io-files';

addEventListener('DOMContentLoaded', () => {
    const ioInRegex = /\/io\/in(\/.*)/;
    const url = new URL(window.location.href);
    const path = url.pathname.match(ioInRegex)[1];
    let fileList = document.getElementById('data');
    let nothingfound = document.getElementById('nothingfound');
    let dropArea;

    const render = entries => {
        let scannedFolders = [],
            scannedFiles = [];

        if (Array.isArray(entries)) {
            entries.forEach(entry => {
                if (entry.type === 'DIRECTORY') {
                    scannedFolders.push(entry);
                } else if (entry.type === 'FILE') {
                    scannedFiles.push(entry);
                }
            });
        }

        if (!scannedFolders.length && !scannedFiles.length) {
            nothingfound.style.display = 'block';
        } else {
            nothingfound.style.display = 'none';
        }

        if (scannedFolders.length) {
            scannedFolders.forEach(f => {
                let itemsLength = f.size;
                let name = f.name;
                let path = encodeURI(f.path);
                let icon = '<span class="icon folder"></span>';

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

                let folder = document.createElement('li', { class: 'folders' });
                folder.innerHTML = `
                    <a href="${path}" title="${path}" class="folders">
                    ${icon}<span class="name">${name}</span> <span class="details">${itemsLength}</span></a>
                `;

                fileList.appendChild(folder);
            });
        }

        if (scannedFiles.length) {
            scannedFiles.forEach(f => {
                let fileSize = formatSize(f.size);
                let name = f.name;
                let path = encodeURI(f.path);
                let fileType = pth.extname(name).substr(1);
                let icon = '<span class="icon file"></span>';
                icon = `<span class="icon file f-${fileType}">.${fileType}</span>`;

                let file = document.createElement('li', { class: 'files' });
                file.innerHTML = `
                    <a href="${path}" title="${path}" class="files" target="blank">
                    ${icon}<span class="name">${name}</span> <span class="details">${fileSize}</span></a>
                `;

                fileList.appendChild(file);
            });
        }

        generateBreadcrumbs();
        fileList.style.display = 'inline-block';
    };

    // Splits a file path and turns it into clickable breadcrumbs
    const generateBreadcrumbs = () => {
        let breadcrumbs = document.getElementById('breadcrumbs');
        let breadcrumbsUrls = [];
        if (path == '/') {
            breadcrumbsUrls.push('/');
        } else {
            breadcrumbsUrls = path.split(pth.sep);
            for (let i = 1; i < breadcrumbsUrls.length; i++) {
                breadcrumbsUrls[i] = pth.join(
                    breadcrumbsUrls[i - 1],
                    breadcrumbsUrls[i]
                );
            }
        }

        let urls = '';

        breadcrumbsUrls.forEach((link, i) => {
            let linkTitle = fullyDecodeURI(pth.basename(link));

            if (i !== breadcrumbsUrls.length - 1) {
                urls += `<a href="/io/in/${link}"><span class="folderName">${linkTitle}</span></a> <span class="arrow">→</span>`;
            } else {
                urls += `<span class="folderName">${linkTitle}</span>`;
            }
        });

        breadcrumbs.innerHTML = urls;
    };

    const preventDefaults = e => {
        e.preventDefault();
        e.stopPropagation();
    };

    const highlight = e => {
        dropArea.classList.add('highlight');
    };

    const unhighlight = e => {
        dropArea.classList.remove('highlight');
    };

    const handleDrop = e => {
        let dt = e.dataTransfer;
        let files = dt.files;
        clearPreview();
        previewFiles(files);
    };

    const handleSelect = e => {
        let files = e.target.files;
        clearPreview();
        previewFiles(files);
    };

    const getBufferFile = async file => {
        try {
            const result = await blobToBuffer(file);
            let buffer = new Int8Array(result);
            return { name: file.name, buffer: buffer, path: path };
        } catch (e) {
            console.warn(e.message);
            return e;
        }
    };

    const getBufferFiles = async () => {
        let files = document.getElementById('fileElem').files;
        files = [...files];
        return await Promise.all(
            files.map(async file => {
                return await getBufferFile(file);
            })
        );
    };

    const importFiles = async () => {
        try {
            let url = document
                .getElementsByTagName('form')[0]
                .getAttribute('action');
            let bufferFiles = await getBufferFiles();
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
        } catch (err) {
            console.error(err);
            alert('Error. Submitting Request!');
        }
    };

    const clearPreview = () => {
        document.getElementById('gallery').innerHTML = '';
    };

    const previewFiles = files => {
        files = [...files];
        files.forEach(previewFile);
    };

    const previewFile = file => {
        let reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onloadend = () => {
            let div = document.createElement('div');
            div.style.maxWidth = '120px';

            let p = document.createElement('p');
            p.innerHTML = file.name;
            p.style.textAlign = 'center';
            p.style.maxWidth = '110px';

            let img = document.createElement('img');
            img.style.maxWidth = '110px';
            img.style.maxHeight = '110px';

            const dataUri = reader.result;
            let buffer = strongDataUri.decode(dataUri);
            let mimeType = buffer.mimetype; // text/plain

            if (mimeType.includes('image')) {
                img.src = reader.result;
            } else {
                img.src = iconFile;
            }

            div.appendChild(img);
            div.appendChild(p);
            document.getElementById('gallery').appendChild(div);
        };
    };

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

    fetch(`/io/getentries${path}`, {
        method: 'GET',
    })
        .then(res => {
            return res.text();
        })
        .then(data => {
            let entries = [];
            if (data != '') {
                entries = data.split('},').map(entry => {
                    if (entry.substr(-1) != '}') entry += '}';
                    return JSON.parse(entry);
                });
            }
            render(entries);
        })
        .catch(err => {
            console.error(err);
        });

    document
        .getElementById('fileElem')
        .addEventListener('change', handleSelect, false);

    document
        .getElementById('submit-btn')
        .addEventListener('click', importFiles, false);
});
