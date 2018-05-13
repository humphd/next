function submitForm() {
    const queryElement = window.document.getElementById('query');
    const methodElement = document.getElementById('method');

    console.log(methodElement.value);

    const req = new Request(encodeURI(`/data/api?${queryElement.value}`), {
        method: methodElement.value,
    });
    fetch(req)
        .then(res => {
            return res.json();
        })
        .then(data => {
            document.getElementById('result').innerText(JSON.stringify(data));
        });
    console.log(queryElement.value);
}
