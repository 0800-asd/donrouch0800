// hecho con chat gpt
function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Selecciona un archivo antes de subir.');
        return;
    }

    const apiUrl = 'https://api.github.com/repos/0800-asd/732628040/contents/uploads/' + file.name;

    // Lee la primera parte de la clave de acceso desde el archivo 1.txt
    const part1 = readFromFile('1.txt');

    // Lee la segunda parte de la clave de acceso desde el archivo 2.txt
    const part2 = readFromFile('2.txt');

    // Combina las partes para obtener la clave de acceso completa
    const githubToken = `${part1}${part2}`;

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
}

// Función para leer el contenido desde un archivo
function readFromFile(filePath) {
    const fs = require('fs');

    try {
        // Lee el contenido desde el archivo
        const content = fs.readFileSync(filePath, 'utf-8').trim();
        return content;
    } catch (error) {
        console.error(`Error al leer desde ${filePath}:`, error);
        alert(`Ocurrió un error al leer desde ${filePath}.`);
        return '';
    }
}
