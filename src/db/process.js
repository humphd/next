const submitForm = () => {
    const urlElement = window.document.getElementById('url');
    const bodyElement = window.document.getElementById('body');
    const methodElement = document.getElementById('method');

    let url = `/data/api/`;

    let body =
        // @ts-ignore
        methodElement.value === 'GET' || methodElement.value === 'DELETE'
            ? null
            : // @ts-ignore
              JSON.stringify(bodyElement.value);
    // @ts-ignore
    url += urlElement.value;

    // @ts-ignore
    console.log(methodElement.value);

    const req = new Request(encodeURI(url), {
        // @ts-ignore
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
    // @ts-ignore
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
    // @ts-ignore
    if (event.target.value == 'GET' || event.target.value == 'DELETE') {
        document.getElementById('bodyWrapper').hidden = true;
    } else {
        document.getElementById('bodyWrapper').hidden = false;
    }
}
