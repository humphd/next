$(function () {
    var filemanager = $('.filemanager'),
        breadcrumbs = $('.breadcrumbs'),
        fileList = filemanager.find('.data');

    var breadcrumbsUrls = [];

    // Start by fetching the file data from scan.php with an AJAX request

    function render(entries) {

        var scannedFolders = [],
            scannedFiles = [];

        if (Array.isArray(entries)) {
            entries.forEach(function (entry) {
                if (entry.type === 'DIRECTORY') {
                    scannedFolders.push(entry);
                }
                else if (entry.type === 'FILE') {
                    scannedFiles.push(entry);
                }
            });
        }

        // Empty the old result and make the new one

        fileList.empty().hide();

        if (!scannedFolders.length && !scannedFiles.length) {
            filemanager.find('.nothingfound').show();
        }
        else {
            filemanager.find('.nothingfound').hide();
        }

        if (scannedFolders.length) {

            scannedFolders.forEach(function (f) {

                var itemsLength = f.size,
                    name = f.name,
                    icon = '<span class="icon folder"></span>';

                if (itemsLength) {
                    icon = '<span class="icon folder full"></span>';
                }

                if (itemsLength == 1) {
                    itemsLength += ' item';
                }
                else if (itemsLength > 1) {
                    itemsLength += ' items';
                }
                else {
                    itemsLength = 'Empty';
                }

                var folder = $('<li class="folders"><a href="' + f.path + '" title="' + name + '" class="folders">' + icon + '<span class="name">' + name + '</span> <span class="details">' + itemsLength + '</span></a></li>');

                folder.appendTo(fileList);
            });

        }

        if (scannedFiles.length) {

            scannedFiles.forEach(function (f) {

                var fileSize = bytesToSize(f.size),
                    name = f.name,
                    fileType = name.split('.'),
                    icon = '<span class="icon file"></span>';

                fileType = fileType[fileType.length - 1];

                icon = '<span class="icon file f-' + fileType + '">.' + fileType + '</span>';

                var file = $('<li class="files"><a href="' + f.path + '" title="' + f.path + '" class="files">' + icon + '<span class="name">' + name + '</span> <span class="details">' + fileSize + '</span></a></li>');
                file.appendTo(fileList);
            });

        }

        fileList.addClass('animated');

        var url = '';

        var nextDir = window.location.href;
        breadcrumbsUrls = generateBreadcrumbs(nextDir);

        breadcrumbsUrls.forEach(function (u, i) {

            var name = u.split('/');

            if (i !== breadcrumbsUrls.length - 1) {
                url += '<a href="/io/in/' + u + '"><span class="folderName">' + name[name.length - 1] + '</span></a> <span class="arrow">→</span> ';
            }
            else {
                url += '<span class="folderName">' + name[name.length - 1] + '</span>';
            }

        });

        breadcrumbs.text('').append(url);

        fileList.animate({ 'display': 'inline-block' });

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

    function fileUpload() {
        $('.fileupload').append(
            `
            <div class="container">
                <form class="box" method="post" action="/io/import" enctype="multipart/form-data">
                    <div class="box__input">
                        <input class="box__file" type="file" name="files[]" id="file" data-multiple-caption="{count} files selected" multiple />
                        <label for="file"><strong>Choose a file</strong><span class="box__dragndrop"> or drag it here</span>.</label>
                        <button type="submit" class="box__button">Upload</button>
                    </div>
                    <div class="box__uploading">Uploading&hellip;</div>
                    <div class="box__success">Done!</div>
                    <div class="box__error">Error! <span></span>.</div>
                </form>
            </div>
            `
        );
    }

    fileUpload();

    var bufferFiles = [];

    'use strict';

	;( function( $, window, document, undefined )
	{
		// feature detection for drag&drop upload

		var isAdvancedUpload = function()
			{
				var div = document.createElement( 'div' );
				return ( ( 'draggable' in div ) || ( 'ondragstart' in div && 'ondrop' in div ) ) && 'FormData' in window && 'FileReader' in window;
			}();


		// applying the effect for every form

		$( '.box' ).each( function()
		{
			var $form		 = $( this ),
				$input		 = $form.find( 'input[type="file"]' ),
				$label		 = $form.find( 'label' ),
				$errorMsg	 = $form.find( '.box__error span' ),
				$restart	 = $form.find( '.box__restart' ),
				droppedFiles = false,
				showFiles	 = function( files )
				{
					$label.text( files.length > 1 ? ( $input.attr( 'data-multiple-caption' ) || '' ).replace( '{count}', files.length ) : files[ 0 ].name );
				};

			// letting the server side to know we are going to make an Ajax request
			$form.append( '<input type="hidden" name="ajax" value="1" />' );

			// automatically submit the form on file select
			$input.on( 'change', function( e )
			{
				showFiles( e.target.files );

				
			});


			// drag&drop files if the feature is available
			if( isAdvancedUpload )
			{
				$form
				.addClass( 'has-advanced-upload' ) // letting the CSS part to know drag&drop is supported by the browser
				.on( 'drag dragstart dragend dragover dragenter dragleave drop', function( e )
				{
					// preventing the unwanted behaviours
					e.preventDefault();
					e.stopPropagation();
				})
				.on( 'dragover dragenter', function() //
				{
					$form.addClass( 'is-dragover' );
				})
				.on( 'dragleave dragend drop', function()
				{
					$form.removeClass( 'is-dragover' );
				})
				.on( 'drop', function( e )
				{
					droppedFiles = e.originalEvent.dataTransfer.files; // the files that were dropped
					showFiles( droppedFiles );

					
				});
			}


			// if the form was submitted

			$form.on( 'submit', function( e )
			{
				// preventing the duplicate submissions if the current one is in progress
				if( $form.hasClass( 'is-uploading' ) ) return false;

				$form.addClass( 'is-uploading' ).removeClass( 'is-error' );

				if( isAdvancedUpload ) // ajax file upload for modern browsers
				{
					e.preventDefault();

					// gathering the form data
					var ajaxData = new FormData( $form.get( 0 ) );
					if( droppedFiles )
					{
						$.each( droppedFiles, function( i, file )
						{
							ajaxData.append( $input.attr( 'name' ), file );
						});
                    }
                    
                    ajaxData.append( 'file1', JSON.stringify(bufferFiles[0]) );

					// ajax request
					$.ajax(
					{
						url: 			$form.attr( 'action' ),
						type:			$form.attr( 'method' ),
						data: 			ajaxData,
						dataType:		'json',
						cache:			false,
						contentType:	false,
						processData:	false,
						complete: function()
						{
							$form.removeClass( 'is-uploading' );
						},
						success: function( data )
						{
							$form.addClass( data.success == true ? 'is-success' : 'is-error' );
							if( !data.success ) $errorMsg.text( data.error );
						},
						error: function()
						{
							alert( 'Error. Please, contact the webmaster!' );
						}
					});
				}
				else // fallback Ajax solution upload for older browsers
				{
					var iframeName	= 'uploadiframe' + new Date().getTime(),
						$iframe		= $( '<iframe name="' + iframeName + '" style="display: none;"></iframe>' );

					$( 'body' ).append( $iframe );
					$form.attr( 'target', iframeName );

					$iframe.one( 'load', function()
					{
						var data = $.parseJSON( $iframe.contents().find( 'body' ).text() );
						$form.removeClass( 'is-uploading' ).addClass( data.success == true ? 'is-success' : 'is-error' ).removeAttr( 'target' );
						if( !data.success ) $errorMsg.text( data.error );
						$iframe.remove();
					});
				}
			});


			// restart the form if has a state of error/success

			$restart.on( 'click', function( e )
			{
				e.preventDefault();
				$form.removeClass( 'is-error is-success' );
				$input.trigger( 'click' );
			});

			// Firefox focus bug fix for file input
			$input
			.on( 'focus', function(){ $input.addClass( 'has-focus' ); })
			.on( 'blur', function(){ $input.removeClass( 'has-focus' ); });
		});

    })( jQuery, window, document );

    function handleFileSelect(evt) {
        debugger;
        var file = evt.target.files[0]; // FileList object
        
        reader = new FileReader();
        reader.onloadend = function (e) {
            console.log(e);
            var buf = new Int8Array(e.target.result);
            console.log(buf);
            bufferFiles[0] = {name: file.name, buffer: buf};
        };
        
        reader.readAsArrayBuffer(file);
      }
    
    document.getElementById('file').addEventListener('change', handleFileSelect, false);
    render(entries);
});
