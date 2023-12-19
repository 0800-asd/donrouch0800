function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Selecciona un archivo antes de subir.');
        return;
    }

    const apiUrl = 'https://api.github.com/repos/0800-asd/732628040/contents/uploads/' + file.name;

    const reader = new FileReader();
    reader.onload = function (event) {
        const content = event.target.result.split(',')[1];
        const formData = new FormData();

        formData.append('file', file);

        fetch(apiUrl, {
            method: 'PUT',
            headers: {
                Authorization: 'Bearer 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',
                'Content-Type': 'application/vnd.github.v3+json', // Cambio aquí
            },
            body: JSON.stringify({
                message: 'Subir archivo ' + file.name,
                content: content,
                branch: 'main',
            }),
        })
        .then(response => response.json())
        .then(data => {
            // Verifica si la propiedad download_url existe en la respuesta
            const fileUrl = data.content && data.content.download_url;

            if (fileUrl) {
                const resultElement = document.getElementById('result');
                resultElement.innerHTML = `Archivo subido exitosamente. Descarga desde: <a href="${fileUrl}" target="_blank">${fileUrl}</a>`;
            } else {
                console.error('La propiedad download_url no está presente en la respuesta:', data);
                alert('Error al obtener la URL de descarga del archivo.');
            }
        })
        .catch(error => {
            console.error('Error al subir el archivo:', error);
            alert('Ocurrió un error al subir el archivo.');
        });
    };

    reader.readAsDataURL(file);
}
