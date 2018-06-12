import { formatDir, format404 } from './html-formatter';

const ioInRegex = /\/io\/in(\/.*)/;
const ioImportRegex = /\/io\/import/;

export default (workbox, ioServer) => {
    // @ts-ignore
    workbox.routing.registerRoute(
        ioInRegex,
        async ({ url }) => {
            const path = url.pathname.match(ioInRegex)[1];
            let body;
            let type;
            let status;
            try {
                // const result1 = await ioServer.createPath();
                const result = await ioServer.serve(path);
                body = result.body;
                type = result.type;
                status = 200;
            } catch (err) {
                body = format404(path);
                type = 'text/html';
                // TODO: should probably do a better job here on mapping to err
                status = 404;
            }

            const init = {
                status,
                statusText: 'OK',
                headers: { 'Content-Type': type },
            };

            return new Response(body, init);
        },
        'GET'
    );

    workbox.routing.registerRoute(
        ioImportRegex,
        async ({ url, event, params }) => {
            return event.request.formData().then(async formData => {
                let body;
                let status;
                let type;
                try {
                    var files = JSON.parse(formData.get('file'));
                    
                    // Note that async functions return a promise
                    const promises = files.map(async (file) => {
                        var file = JSON.parse(file);
                            
                        file.buffer = Object.values(file.buffer);
                        const result = await ioServer.upload(file);

                        return result;
                    });
                    const results = await Promise.all(promises);
                    console.log(results);
                    return new Response(results);

                    // return new Response(files);
                    async (files) => {
                        
                        for (let i = 0; i < files.length; i++) {
                            var file = JSON.parse(files[i]);
                            
                            file.buffer = Object.values(file.buffer);
                            const result = await ioServer.upload(file);
    
                            body = result.body;
                            status = 200;
                        }
                      }
                    // files.forEach((file_) => {
                    //     var file = JSON.parse(file_);
                    //     file.buffer = Object.values(file.buffer);
                    //     const result = await ioServer.upload(file);

                    //     body = result.body;
                    //     status = 200;
                    // });
                } catch (err) {
                    body = err;
                    type = 'text/html';
                    // TODO: should probably do a better job here on mapping to err
                    status = 404;
                }

                const init = {
                    status,
                    statusText: 'OK',
                    headers: { 'Content-Type': type },
                };
    
                // return new Response(body, init);
            }).catch(err => { return new Response(
                err
            ); });
        },
        'POST'
    );
};
