// hecho con chat gpt
function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Selecciona un archivo antes de subir.');
        return;
    }

    const apiUrl = 'https://api.github.com/repos/0800-asd/732628040/contents/uploads/' + file.name;

    // Enlace al archivo que contiene la clave de acceso en Pastebin
    const pastebinLink = 'https://pastebin.com/raw/cMz5yfYH';

    // Lee la clave de acceso desde Pastebin
    fetch(pastebinLink)
        .then(response => response.text())
        .then(githubToken => {
            const reader = new FileReader();
            reader.onload = function (event) {
                const content = event.target.result.split(',')[1];
                const formData = new FormData();

                formData.append('file', file);

                fetch(apiUrl, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${githubToken.trim()}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: 'Subir archivo ' + file.name,
                        content: content,
                        branch: 'main',
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    const fileUrl = data.content.download_url;
                    const resultElement = document.getElementById('result');
                    resultElement.innerHTML = `Archivo subido exitosamente. Descarga desde: <a href="${fileUrl}" target="_blank">${fileUrl}</a>`;
                })
                .catch(error => {
                    console.error('Error al subir el archivo:', error);
                    alert('Ocurrió un error al subir el archivo.');
                });
            };

            reader.readAsDataURL(file);
        })
        .catch(error => {
            console.error('Error al obtener la clave de acceso desde Pastebin:', error);
            alert('Ocurrió un error al obtener la clave de acceso.');
        });
}
