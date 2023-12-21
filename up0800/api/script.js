function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Selecciona un archivo antes de subir.');
        return;
    }

    const apiUrl = 'https://api.github.com/repos/0800-asd/donrouch0800/contents/uploads/' + file.name;

    // Rutas a los archivos que contienen las partes de la clave de acceso
    const part1Path = '1.txt';
    const part2Path = '2.txt';

    // Lee la primera parte de la clave de acceso
    fetch(part1Path)
        .then(response => response.text())
        .then(part1 => {
            // Lee la segunda parte de la clave de acceso
            fetch(part2Path)
                .then(response => response.text())
                .then(part2 => {
                    // Combina las partes para obtener la clave de acceso completa
                    const githubToken = `${part1.trim()}${part2.trim()}`;

                    const reader = new FileReader();
                    reader.onload = function (event) {
                        const content = event.target.result.split(',')[1];
                        const formData = new FormData();

                        formData.append('file', file);

                        fetch(apiUrl, {
                            method: 'PUT',
                            headers: {
                                Authorization: `Bearer ${githubToken}`,
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
                    console.error('Error al leer la segunda parte de la clave de acceso:', error);
                    alert('Ocurrió un error al leer la segunda parte de la clave de acceso.');
                });
        })
        .catch(error => {
            console.error('Error al leer la primera parte de la clave de acceso:', error);
            alert('Ocurrió un error al leer la primera parte de la clave de acceso.');
        });
}
