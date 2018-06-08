/**
 * NOTE: this is meant for debugging Bramble, and as an example
 * of how to do basic things with the API. It wasn't intended as a production setup.
 *
 * Use ?forceFiles=1 to force startup to re-install the default files
 */
(function () {
    "use strict";

    require.config({
        baseUrl: './'
    });

    /**
 * JavaScript Get URL Parameter
 * 
 * @param String prop The specific URL parameter you want to retreive the value for
 * @return String|Object If prop is provided a string value is returned, otherwise an object of all properties is returned
 */
    function getUrlParams(prop) {
        var params = {};
        var search = decodeURIComponent(window.location.href.slice(window.location.href.indexOf('?') + 1));
        var definitions = search.split('&');

        definitions.forEach(function (val, key) {
            var parts = val.split('=', 2);
            params[parts[0]] = parts[1];
        });

        return (prop && prop in params) ? params[prop] : params;
    }

    function load(Bramble) {
        Bramble.load("#bramble", {
            url: "editor.html",
            useLocationSearch: true
        });

        // Grabs the parameters from the url
        var urlParams = getUrlParams();
        if( urlParams.folder ) {
            Bramble.mount('/' + urlParams.folder, urlParams.file ? urlParams.file : '');
        }
        else {
            // Now that fs is setup, tell Bramble which root dir to mount
            // and which file within that root to open on startup.
            Bramble.mount('/');
        }
    }

    // Support loading from src/ or dist/ (default) to make local dev easier
    var isSrc = !!window.location.pathname.match(/\/src\/[^/]+$/);
    var brambleModule;

    if (isSrc) {
        console.log("Bramble src/ build");
        brambleModule = "../dist/bramble";
    } else {
        console.log("Bramble dist/ build");
        brambleModule = "bramble";
    }

    require([brambleModule], function (Bramble) {
        load(Bramble);
    });
}());
