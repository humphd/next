const submitForm = () => {
    const queryElement = window.document.getElementById('query');
    const methodElement = document.getElementById('method');

    let url = '/data/api';
    let body = null;
    switch (methodElement.value) {
        case 'GET':
            url += `?${queryElement.value}`;
            break;
        case 'POST':
        case 'PUT':
            body = JSON.stringify(queryElement.value);
    }

    console.log(methodElement.value);

    const req = new Request(encodeURI(url), {
        method: methodElement.value,
        body: body,
    });

    fetch(req)
        .then(res => {
            return res.json();
        })
        .then(data => {
            document.getElementById('result').innerText = JSON.stringify(data);
        });
    console.log(queryElement.value);
};

window.addEventListener('load', () => {
    document
        .getElementById('submitButton')
        .addEventListener('click', submitForm, false);
});
