import iconFile from './icons/file.svg';
import iconFileSelected from './icons/file-selected.svg';
import iconFolder from './icons/folder.svg';
import { fullyDecodeURI } from '../lib/utils';
import Path from '../lib/path';
import { formatSize } from '../lib/utils';
import { blobToBuffer } from './io-files';
import UIkit from 'uikit';

addEventListener('DOMContentLoaded', () => {
    const ioInRegex = /\/io\/in(\/.*)/;
    const url = new URL(window.location.href);
    const path = url.pathname.match(ioInRegex)[1];
    let fileList = document.getElementById('data');

    const render = (pathDir, entries) => {
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

        if (scannedFolders.length) {
            scannedFolders.forEach(f => {
                let itemsLength = f.contents.length;
                let name = f.name;
                let path = Path.join(`/io/in${pathDir}`, name);

                if (itemsLength == 1) {
                    itemsLength += ' item';
                } else if (itemsLength > 1) {
                    itemsLength += ' items';
                } else {
                    itemsLength = 'Empty';
                }

                let folder = `
                    <div class="uk-card uk-card-hover uk-card-default uk-card-body card-radius">
                        <div uk-grid>
                            <div class="uk-width-1-4">
                                <img src="${iconFolder}">
                                <div class="hide navigateTo">${path}</div>
                            </div>
                            <div class="uk-width-3-4">
                                <div class="uk-width-1-1 uk-text-truncate item-name">${name}</div>
                                <div class="uk-width-1-1">${itemsLength}</div>
                            </div>
                        </div>
                    </div>
                `;

                let div = document.createElement('div');
                div.innerHTML = folder;

                fileList.appendChild(div);
            });
        }

        if (scannedFiles.length) {
            scannedFiles.forEach(f => {
                let fileSize = formatSize(f.size);
                let name = f.name;
                let path = Path.join(`/www${pathDir}`, name);
                let fileType = Path.extname(name).substr(1);

                let file = `
                    <div class="uk-card uk-card-hover uk-card-default uk-card-body card-radius">
                        <div uk-grid>
                            <div class="uk-width-1-4">
                                <img src="${iconFile}">
                                <div class="hide navigateTo">${path}</div>
                            </div>
                            <div class="uk-width-3-4">
                                <div class="uk-width-1-1 uk-text-truncate item-name">${name}</div>
                                <div class="uk-width-1-1">${fileSize}</div>
                            </div>
                        </div>
                    </div>
                `;

                let div = document.createElement('div');
                div.innerHTML = file;

                fileList.appendChild(div);
            });
        }

        var classname = document.querySelectorAll('.uk-card');

        Array.from(classname).forEach(function(element) {
            element.addEventListener('click', select, false);
            element.addEventListener(
                'dblclick',
                event => {
                    let element = event.target.closest('.uk-card');
                    let navigateTo = element.querySelector('.navigateTo');
                    location.href = navigateTo.innerHTML;
                },
                false
            );
        });

        generateBreadcrumbs();
    };

    // Splits a file path and turns it into clickable breadcrumbs
    const generateBreadcrumbs = () => {
        let breadcrumbs = document.getElementById('breadcrumbs');
        let breadcrumbsUrls = [];
        if (path == '/') {
            breadcrumbsUrls.push('/');
        } else {
            breadcrumbsUrls = path.split(Path.sep);
            for (let i = 1; i < breadcrumbsUrls.length; i++) {
                breadcrumbsUrls[i] = Path.join(
                    breadcrumbsUrls[i - 1],
                    breadcrumbsUrls[i]
                );
            }
        }
        let urls = '';
        breadcrumbsUrls.forEach((link, i) => {
            let linkTitle = fullyDecodeURI(Path.basename(link));
            if (i !== breadcrumbsUrls.length - 1) {
                urls += `<a href="/io/in/${link}"><span class="folderName">${linkTitle}</span></a> <span class="arrow"> > </span>`;
            } else {
                urls += `<span class="folderName">${linkTitle}</span>`;
            }
        });
        breadcrumbs.innerHTML = urls;
    };

    const refreshFolder = () => {
        location.reload();
    };

    const clearSelected = () => {
        var selectedElements = document.querySelectorAll('.uk-card-primary');
        Array.from(selectedElements).forEach(function(element) {
            element.classList.remove('uk-card-primary');
            element.classList.add('uk-card-default');

            let icon = element.childNodes[1].childNodes[1].childNodes[1];
            icon.src = iconFile;
        });

        let renameFileLi = document.getElementById('rename-li');
        let deleteFilesLi = document.getElementById('delete-li');
        let deleteFiles = document.getElementById('delete-files-badge');
        let downloadBadge = document.getElementById('download-files-badge');

        renameFileLi.classList.add('hide');
        deleteFilesLi.classList.add('hide');
        deleteFiles.innerHTML = '';
        deleteFiles.classList.add('hide');
        downloadBadge.innerHTML = '';
        downloadBadge.classList.add('hide');
    };

    UIkit.util.on('#delete-files', 'click', function(e) {
        e.preventDefault();
        e.target.blur();
        var selectedElements = document.querySelectorAll('.uk-card-primary');
        UIkit.modal
            .confirm(
                `Are you sure you want to delete ${
                    selectedElements.length
                } file(s)?`
            )
            .then(
                () => {
                    selectedElements.forEach(async entry => {
                        var item = entry.querySelector('.item-name');
                        var url = Path.join(
                            '/',
                            'io',
                            'remove',
                            path,
                            item.innerHTML
                        );
                        await fetch(url, {
                            method: 'GET',
                        })
                            .then(() => {
                                entry.parentNode.removeChild(entry);
                            })
                            .catch(err => console.error(err));
                    });

                    refreshFolder();
                },
                () => {
                    console.log('Rejected.');
                }
            );
    });

    UIkit.util.on('#download-files', 'click', function(e) {
        e.preventDefault();
        e.target.blur();
        var selectedElements = document.querySelectorAll('.uk-card-primary');
        UIkit.modal
            .confirm(
                `Are you sure you want to download ${
                    selectedElements.length
                } file(s)?`
            )
            .then(
                () => {
                    selectedElements.forEach(async entry => {
                        let navigateTo = entry.querySelector('.navigateTo');

                        let item = entry.querySelector('.item-name');
                        let url = Path.join(
                            '/',
                            'io',
                            navigateTo ? 'archive' : 'out',
                            path,
                            item.innerHTML
                        );

                        await fetch(url, {
                            method: 'GET',
                        })
                            .then(response => response.blob())
                            .then(blob => {
                                var url = window.URL.createObjectURL(blob);
                                var a = document.createElement('a');
                                a.href = url;
                                a.download = item.innerHTML;
                                a.click();
                            });
                    });

                    clearSelected();
                },
                () => {
                    console.log('Rejected.');
                }
            );
    });

    UIkit.util.on('#new-folder', 'click', function(e) {
        e.preventDefault();
        e.target.blur();
        UIkit.modal.prompt('New Folder Name:', '').then(async name => {
            await fetch(`/io/in${path}/${name}`, {
                method: 'GET',
            })
                .then(() => {
                    refreshFolder();
                })
                .catch(err => console.error(err));
        });
    });

    UIkit.util.on('#rename-li', 'click', function(e) {
        e.preventDefault();
        e.target.blur();
        UIkit.modal.prompt('New File/Folder Name:', '').then(async name => {
            let selectedElement = document.querySelector('.uk-card-primary');
            let item = selectedElement.querySelector('.item-name');
            let formData = new FormData();
            let ext = Path.extname(item.innerHTML);
            formData.append('oldPath', Path.join(path, item.innerHTML));
            formData.append('newPath', Path.join(path, name + ext));

            await fetch('/io/rename/', {
                method: 'POST',
                body: formData,
            })
                .then(() => {
                    refreshFolder();
                })
                .catch(err => console.error(err));
        });
    });

    let newFile = document.getElementById('new-file');
    newFile.addEventListener(
        'click',
        () => {
            document.getElementById('fileElem').click();
        },
        false
    );

    let uploadFiles = document.getElementById('upload-files');
    uploadFiles.addEventListener(
        'click',
        () => {
            document.getElementById('fileElem').click();
        },
        false
    );

    const preventDefaults = e => {
        e.preventDefault();
        e.stopPropagation();
    };

    let dropArea;
    const highlight = e => {
        dropArea.classList.add('highlight');
    };

    const unhighlight = e => {
        dropArea.classList.remove('highlight');
    };

    const handleDrop = e => {
        let dt = e.dataTransfer;
        let files = dt.files;
        importFiles(files);
    };

    const handleSelect = e => {
        let files = e.target.files;
        importFiles(files);
    };

    const getBufferFile = async file => {
        try {
            const result = await blobToBuffer(file);
            let buffer = new Uint8Array(result);
            return { path: Path.join(path, file.name), buffer: buffer };
        } catch (e) {
            console.warn(e.message);
            return e;
        }
    };

    const getBufferFiles = async files => {
        files = [...files];
        return await Promise.all(
            files.map(async file => {
                return await getBufferFile(file);
            })
        );
    };

    const importFiles = async files => {
        try {
            let url = document
                .getElementsByTagName('form')[0]
                .getAttribute('action');
            let bufferFiles = await getBufferFiles(files);
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
                        return !(res.err in res);
                    });

                    if (res) {
                        location.reload();
                    } else {
                        const result = data
                            .filter(res => res.err in res)
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

    document
        .getElementById('fileElem')
        .addEventListener('change', handleSelect, false);

    document
        .getElementById('submit-btn')
        .addEventListener('click', importFiles, false);

    fetch(`/www${path}?json=true`, {
        method: 'GET',
    })
        .then(res => res.json())
        .then(data => {
            render(path, data);
        })
        .catch(err => console.error(err));
});

const select = event => {
    let element = event.target.closest('.uk-card');
    let icon = element.childNodes[1].childNodes[1].childNodes[1];
    if (element.classList.contains('uk-card-default')) {
        element.classList.add('uk-card-primary');
        element.classList.remove('uk-card-default');
        icon.src = iconFileSelected;
    } else {
        element.classList.remove('uk-card-primary');
        element.classList.add('uk-card-default');
        icon.src = iconFile;
    }

    let renameFileLi = document.getElementById('rename-li');
    let deleteFilesLi = document.getElementById('delete-li');
    let downloadFilesLi = document.getElementById('download-li');
    let deleteFiles = document.getElementById('delete-files-badge');
    let downloadBadge = document.getElementById('download-files-badge');

    let selectedFiles = document.querySelectorAll('.uk-card-primary');

    if (selectedFiles.length > 0) {
        renameFileLi.classList.add('hide');
        deleteFilesLi.classList.remove('hide');
        downloadFilesLi.classList.remove('hide');
        deleteFiles.innerHTML = `${selectedFiles.length}`;
        deleteFiles.classList.remove('hide');
        downloadBadge.innerHTML = `${selectedFiles.length}`;
        downloadBadge.classList.remove('hide');
    } else {
        renameFileLi.classList.add('hide');
        deleteFilesLi.classList.add('hide');
        downloadFilesLi.classList.add('hide');
        deleteFiles.innerHTML = '';
        deleteFiles.classList.add('hide');
        downloadBadge.innerHTML = '';
        downloadBadge.classList.add('hide');
    }

    if (selectedFiles.length == 1) {
        renameFileLi.classList.remove('hide');
    }
};
