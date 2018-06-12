function myFunction() 
{
    document.getElementById("test").innerHTML = "Hello World";
}

function onSubmit() 
{
    let url = `/io/import`;

    var formData = new FormData();
    formData.append('name', 'Jerry Goguette');

    let body = formData;

    const req = new Request(encodeURI(url), {
        // @ts-ignore
        method: "POST",
        body: body,
    });

    fetch(req)
        .then(res => {
            return res;
        })
        .then(data => {
            console.log(data);
        })
        .catch(err => {
            console.error(err);
        });

    return false;
}
