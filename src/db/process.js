const submitForm = () => {
    const urlElement = window.document.getElementById('url');
    const bodyElement = window.document.getElementById('body');
    const methodElement = document.getElementById('method');

    let url = `${window.location.hostname}`;

    let body =
        methodElement.value === 'GET' || methodElement.value === 'DELETE'
            ? null
            : bodyElement.value;

    url += urlElement.value;

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
        })
        .catch(err => {
            console.error(err);
        });

    console.log(urlElement.value);
};

window.addEventListener('load', () => {
    document
        .getElementById('submitButton')
        .addEventListener('click', submitForm, false);
    document.getElementById('method').addEventListener('change', revealMethod);

    revealMethod({
        target: { value: document.getElementById('method').value },
    });
});

function revealMethod(event) {
    if (event.target.value == 'GET' || event.target.value == 'DELETE') {
        document.getElementById('bodyWrapper').hidden = true;
    } else {
        document.getElementById('bodyWrapper').hidden = false;
    }
}
